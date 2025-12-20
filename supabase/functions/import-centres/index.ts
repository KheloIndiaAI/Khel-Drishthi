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

    const { centres } = await req.json();

    if (!centres || !Array.isArray(centres)) {
      throw new Error("Invalid centres data");
    }

    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    let errors: string[] = [];

    for (let i = 0; i < centres.length; i += batchSize) {
      const batch = centres.slice(i, i + batchSize);
      
      const { error } = await supabase.from("centres").insert(
        batch.map((c: any) => ({
          centre_id: c.centre_id,
          centre_type: c.centre_type,
          centre_name: c.centre_name_std,
          centre_name_raw: c.centre_name_raw,
          state: c.state,
          district: c.district || null,
          region_unit: c.region_unit || null,
          programme_subtype: c.programme_subtype || null,
          operational_status: c.operational_status || null,
          source_dataset: c.source_dataset || null,
          is_active: c.is_active === "True" || c.is_active === true,
        }))
      );

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    }

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
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
