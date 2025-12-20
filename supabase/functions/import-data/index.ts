import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { table, data } = await req.json();

    if (!data || !Array.isArray(data) || !table) {
      throw new Error("Invalid data or table name");
    }

    const batchSize = 100;
    let inserted = 0;
    let errors: string[] = [];

    if (table === "centre_sport_links") {
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await supabase.from("centre_sport_links").insert(
          batch.map((row: any) => ({
            bridge_id: row.bridge_id,
            centre_id: row.centre_id,
            centre_type: row.centre_type || null,
            state: row.state || null,
            district: row.district || null,
            sport_id: row.sport_id,
            sport_name: row.sport_name || null,
            discipline_id: row.discipline_id || null,
            discipline_name: row.discipline_name || null,
            source_dataset: row.source_dataset || null,
            programme_subtype: row.programme_subtype || null,
            operational_status: row.operational_status || null,
          }))
        );
        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
        }
      }
    } else if (table === "events") {
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await supabase.from("events").insert(
          batch.map((row: any) => ({
            event_id: row.event_id,
            sport_id: row.sport_id,
            discipline_id: row.discipline_id || null,
            event_std: row.event_std,
            event_raw: row.event_std,
            gender_std: row.gender_std || null,
            event_type_std: row.event_type_std || null,
            participant_type: null,
            present_la28: parseInt(row.present_la28) || 0,
            present_ag2026: parseInt(row.present_ag2026) || 0,
            la28_men: parseInt(row.la28_male) || 0,
            la28_women: parseInt(row.la28_female) || 0,
            la28_total: parseInt(row.la28_total) || 0,
            ag2026_men: parseInt(row.ag2026_male) || 0,
            ag2026_women: parseInt(row.ag2026_female) || 0,
            ag2026_total: parseInt(row.ag2026_total) || 0,
            both_games: parseInt(row.both) || 0,
          }))
        );
        if (error) {
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        } else {
          inserted += batch.length;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total: data.length, errors: errors.length > 0 ? errors : undefined }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
