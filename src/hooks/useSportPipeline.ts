import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SportArchetype =
  | "A_full"
  | "B_no_india_record"
  | "C_non_olympic"
  | "D_no_pipeline";

export interface SportPipelineRow {
  sport_id: string;
  sport_name: string | null;
  la28_events: number | null;
  ag2026_events: number | null;
  existing_athletes: number | null;
  sanctioned_capacity: number | null;
  centres_linked: number | null;
  centres_mappable: number | null;
  states: number | null;
  india_medals: number | null;
  india_gold: number | null;
  india_silver: number | null;
  india_bronze: number | null;

  india_olympians: number | null;
  india_games: number | null;
  india_first_year: number | null;
  india_last_year: number | null;
  india_top8: number | null;
  india_fourth: number | null;
  india_top8_no_medal: number | null;
  india_conversion: number | null;
  india_female_olympians: number | null;
  world_nations_last3: number | null;
  world_gold_events_last3: number | null;
  world_leader_noc: string | null;
  world_leader_name: string | null;
  world_leader_medals: number | null;
  medals_per_100_trainees: number | null;
  utilisation_pct: number | null;
  archetype: SportArchetype | null;
}

/**
 * One row per sport from the read-only `oly_v_pipeline` view.
 * Replaces several client-side aggregations — never recompute these in JS.
 */
export const useSportPipeline = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-v-pipeline", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("oly_v_pipeline")
        .select("*")
        .eq("sport_id", sportId!)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as SportPipelineRow | null;
    },
  });
