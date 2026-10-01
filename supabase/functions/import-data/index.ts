// Admin-only CSV import. Auth/CORS live in ../_shared (see auth.ts for why the old
// has_role RPC check always returned 403 under the service-role client).
import { corsHeaders as buildCorsHeaders, preflight } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";

// Allowed table names - prevents table name injection
const ALLOWED_TABLES = ["centre_sport_links", "events", "event_overlap", "ncoe_capacity", "stc_capacity", "disciplines"] as const;
type AllowedTable = typeof ALLOWED_TABLES[number];

// Maximum payload size limits
const MAX_RECORDS = 10000;
const MAX_STRING_LENGTH = 500;

// Helper to sanitize and validate string
function sanitizeString(value: unknown, maxLength: number = MAX_STRING_LENGTH): string | null {
  if (value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if (str.length > maxLength) {
    return str.substring(0, maxLength);
  }
  return str;
}

// Helper to safely parse integer
function safeParseInt(value: unknown, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') return defaultValue;
  const parsed = parseInt(String(value), 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// Helper to safely parse boolean
function safeParseBoolean(value: unknown): boolean {
  if (value === true || value === 'True' || value === 'true' || value === '1') return true;
  return false;
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const corsHeaders = buildCorsHeaders(req);

  try {
    // ==================== AUTHENTICATION + AUTHORIZATION ====================
    const ctx = await requireAdmin(req);
    if (ctx instanceof Response) return ctx;
    const { admin: supabase, user } = ctx;
    console.log(`Admin user ${user.id} authorized`);

    // ==================== INPUT VALIDATION ====================
    const { table, data } = await req.json();

    // Validate table name against allowlist
    if (!table || !ALLOWED_TABLES.includes(table as AllowedTable)) {
      console.log(`Invalid table name: ${table}`);
      return new Response(
        JSON.stringify({ success: false, error: `Invalid table name. Allowed: ${ALLOWED_TABLES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate data is an array with reasonable size
    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data: must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (data.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid data: array is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (data.length > MAX_RECORDS) {
      return new Response(
        JSON.stringify({ success: false, error: `Too many records. Maximum allowed: ${MAX_RECORDS}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Importing ${data.length} records into table: ${table} by admin ${user.email}`);

    const batchSize = 100;
    let inserted = 0;
    let errors: string[] = [];

    if (table === "centre_sport_links") {
      // First, deduplicate bridge_ids across entire dataset
      const bridgeIdCount: Record<string, number> = {};
      const deduplicatedData = data.map((row: Record<string, unknown>) => {
        const originalBridgeId = sanitizeString(row.bridge_id) || '';
        if (bridgeIdCount[originalBridgeId] === undefined) {
          bridgeIdCount[originalBridgeId] = 0;
        }
        bridgeIdCount[originalBridgeId]++;
        
        // If this is a duplicate, create a unique bridge_id with suffix
        const uniqueBridgeId = bridgeIdCount[originalBridgeId] > 1 
          ? `${originalBridgeId}_${bridgeIdCount[originalBridgeId]}`
          : originalBridgeId;
        
        return {
          bridge_id: uniqueBridgeId,
          centre_id: sanitizeString(row.centre_id) || '',
          centre_type: sanitizeString(row.centre_type),
          state: sanitizeString(row.state),
          district: sanitizeString(row.district),
          sport_id: sanitizeString(row.sport_id) || '',
          sport_name: sanitizeString(row.sport_name),
          discipline_id: sanitizeString(row.discipline_id),
          discipline_name: sanitizeString(row.discipline_name),
          source_dataset: sanitizeString(row.source_dataset),
          programme_subtype: sanitizeString(row.programme_subtype),
          operational_status: sanitizeString(row.operational_status),
        };
      });

      // Log duplicates found
      const duplicates = Object.entries(bridgeIdCount).filter(([_, count]) => count > 1);
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicate bridge_ids, auto-fixed with suffixes`);
      }

      for (let i = 0; i < deduplicatedData.length; i += batchSize) {
        const batch = deduplicatedData.slice(i, i + batchSize);
        
        // Use upsert to handle duplicates - update if bridge_id exists
        const { error } = await supabase.from("centre_sport_links").upsert(
          batch,
          { onConflict: 'bridge_id', ignoreDuplicates: false }
        );
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    } else if (table === "events") {
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const mappedData = batch.map((row: Record<string, unknown>) => ({
          event_id: sanitizeString(row.event_id) || '',
          sport_id: sanitizeString(row.sport_id) || '',
          discipline_id: sanitizeString(row.discipline_id),
          event_std: sanitizeString(row.event_std) || '',
          event_raw: sanitizeString(row.event_std),
          gender_std: sanitizeString(row.gender_std),
          event_type_std: sanitizeString(row.event_type_std),
          participant_type: null,
          present_la28: safeParseInt(row.present_la28),
          present_ag2026: safeParseInt(row.present_ag2026),
          la28_men: safeParseInt(row.la28_male),
          la28_women: safeParseInt(row.la28_female),
          la28_total: safeParseInt(row.la28_total),
          ag2026_men: safeParseInt(row.ag2026_male),
          ag2026_women: safeParseInt(row.ag2026_female),
          ag2026_total: safeParseInt(row.ag2026_total),
          both_games: safeParseInt(row.both),
        }));
        
        // Use upsert to handle duplicates - update if event_id exists
        const { error } = await supabase.from("events").upsert(
          mappedData,
          { onConflict: 'event_id', ignoreDuplicates: false }
        );
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    } else if (table === "event_overlap") {
      // Clear existing data first
      await supabase.from("event_overlap").delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const mappedData = batch.map((row: Record<string, unknown>) => ({
          sport_std: sanitizeString(row.sport_std),
          events_total: safeParseInt(row.events_total),
          la28_events: safeParseInt(row.la28_events),
          ag_events: safeParseInt(row.ag_events),
          both_events: safeParseInt(row.both_events),
          only_la28: safeParseInt(row.only_la28),
          only_ag: safeParseInt(row.only_ag),
        }));
        
        const { error } = await supabase.from("event_overlap").insert(mappedData);
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    } else if (table === "ncoe_capacity") {
      // Clear existing data first
      await supabase.from("ncoe_capacity").delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const mappedData = batch.map((row: Record<string, unknown>) => ({
          centre_id: sanitizeString(row.centre_id),
          centre_name: sanitizeString(row.centre) || sanitizeString(row.centre_name_std),
          region: sanitizeString(row.region),
          state: sanitizeString(row.state_std) || sanitizeString(row.state),
          sport_id: sanitizeString(row.sport_id),
          discipline_raw: sanitizeString(row.discipline_raw),
          san_res_boys: safeParseInt(row.san_res_b),
          san_res_girls: safeParseInt(row.san_res_g),
          san_res_total: safeParseInt(row.san_res_t),
          san_nonres_boys: safeParseInt(row.san_nonres_b),
          san_nonres_girls: safeParseInt(row.san_nonres_g),
          san_nonres_total: safeParseInt(row.san_nonres_t),
          san_grand_total: safeParseInt(row.san_gt),
          ex_res_boys: safeParseInt(row.ex_res_b),
          ex_res_girls: safeParseInt(row.ex_res_g),
          ex_res_total: safeParseInt(row.ex_res_t),
          ex_nonres_boys: safeParseInt(row.ex_nonres_b),
          ex_nonres_girls: safeParseInt(row.ex_nonres_g),
          ex_nonres_total: safeParseInt(row.ex_nonres_t),
          ex_grand_total: safeParseInt(row.ex_gt),
          is_para: safeParseBoolean(row.is_para),
        }));
        
        const { error } = await supabase.from("ncoe_capacity").insert(mappedData);
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    } else if (table === "stc_capacity") {
      // Clear existing data first
      await supabase.from("stc_capacity").delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const mappedData = batch.map((row: Record<string, unknown>) => ({
          centre_id: sanitizeString(row.centre_id),
          centre_name: sanitizeString(row.centre) || sanitizeString(row.centre_name_std),
          region: sanitizeString(row.region),
          state: sanitizeString(row.state_std) || sanitizeString(row.state),
          sport_id: sanitizeString(row.sport_id),
          discipline_raw: sanitizeString(row.discipline_raw),
          san_res_boys: safeParseInt(row.san_res_b),
          san_res_girls: safeParseInt(row.san_res_g),
          san_res_total: safeParseInt(row.san_res_t),
          san_nonres_boys: safeParseInt(row.san_nonres_b),
          san_nonres_girls: safeParseInt(row.san_nonres_g),
          san_nonres_total: safeParseInt(row.san_nonres_t),
          san_grand_total: safeParseInt(row.san_gt),
          ex_res_boys: safeParseInt(row.ex_res_b),
          ex_res_girls: safeParseInt(row.ex_res_g),
          ex_res_total: safeParseInt(row.ex_res_t),
          ex_nonres_boys: safeParseInt(row.ex_nonres_b),
          ex_nonres_girls: safeParseInt(row.ex_nonres_g),
          ex_nonres_total: safeParseInt(row.ex_nonres_t),
          ex_grand_total: safeParseInt(row.ex_gt),
          is_para: safeParseBoolean(row.is_para),
        }));
        
        const { error } = await supabase.from("stc_capacity").insert(mappedData);
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    } else if (table === "disciplines") {
      // Clear existing data first
      await supabase.from("disciplines").delete().neq('discipline_id', 'PLACEHOLDER');
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const mappedData = batch.map((row: Record<string, unknown>) => ({
          discipline_id: sanitizeString(row.discipline_id) || '',
          sport_id: sanitizeString(row.sport_id) || '',
          discipline_std: sanitizeString(row.discipline_std) || '',
          discipline_raw: sanitizeString(row.discipline_std),
          la28_event_count: safeParseInt(row.la28_event_count),
          ag2026_event_count: safeParseInt(row.ag2026_event_count),
          present_la28: safeParseInt(row.present_la28),
          present_ag2026: safeParseInt(row.present_ag2026),
          is_active: safeParseBoolean(row.is_active),
        }));
        
        const { error } = await supabase.from("disciplines").insert(mappedData);
        if (error) {
          console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
          console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
        }
      }
    }

    console.log(`Import complete by admin ${user.email}: ${inserted}/${data.length} records, ${errors.length} errors`);
    return new Response(
      JSON.stringify({ success: true, inserted, total: data.length, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Import error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
