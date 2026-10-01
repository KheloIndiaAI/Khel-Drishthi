// Admin-only CSV import. Auth/CORS live in ../_shared (see auth.ts for why the old
// has_role RPC check always returned 403 under the service-role client).
import { corsHeaders as buildCorsHeaders, preflight } from "../_shared/http.ts";
import { requireAdmin } from "../_shared/auth.ts";

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
    const { centres } = await req.json();

    if (!centres || !Array.isArray(centres)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid centres data: must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (centres.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid centres data: array is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (centres.length > MAX_RECORDS) {
      return new Response(
        JSON.stringify({ success: false, error: `Too many records. Maximum allowed: ${MAX_RECORDS}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Importing ${centres.length} centres by admin ${user.email}`);

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < centres.length; i += batchSize) {
      const batch = centres.slice(i, i + batchSize);
      
      const { error } = await supabase.from("centres").insert(
        batch.map((c: Record<string, unknown>) => ({
          centre_id: sanitizeString(c.centre_id) || '',
          centre_type: sanitizeString(c.centre_type) || '',
          centre_name: sanitizeString(c.centre_name_std) || '',
          centre_name_raw: sanitizeString(c.centre_name_raw),
          state: sanitizeString(c.state) || '',
          district: sanitizeString(c.district),
          region_unit: sanitizeString(c.region_unit),
          programme_subtype: sanitizeString(c.programme_subtype),
          operational_status: sanitizeString(c.operational_status),
          source_dataset: sanitizeString(c.source_dataset),
          is_active: safeParseBoolean(c.is_active),
        }))
      );

      if (error) {
        console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted ${batch.length} records`);
      }
    }

    console.log(`Import complete by admin ${user.email}: ${inserted}/${centres.length} centres, ${errors.length} errors`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted, 
        total: centres.length,
        errors: errors.length > 0 ? errors : undefined
      }),
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
