import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoardRow {
  season: string | null;
  canonical_discipline: string | null;
  canonical_event: string | null;
  kd_sport_id: string | null;
  games_contested_recent: number | null;
  best_place_recent: number | null;
  best_year: number | null;
  trail: string | null;
  distance_to_podium: number | null;
  nations_medalling_recent: number | null;
  games_held_recent: number | null;
  trend: string | null;
  pipeline_athletes: number | null;
  openness_band: string | null;
  board_tier: string | null;
  is_team_event: boolean | null;
  field_units: number | null;
  hhi: number | null;
  medalist_nations: number | null;
  editions: number | null;
  alltime_leader_noc: string | null;
  alltime_leader_share_pct: number | null;
  last3_leader_noc: string | null;
}

export interface OpportunityRow extends BoardRow {
  sportLabel: string;
  rowKey: string;
}

const BOARD_COLUMNS =
  "season,canonical_discipline,canonical_event,kd_sport_id,games_contested_recent,best_place_recent,best_year,trail,distance_to_podium,nations_medalling_recent,games_held_recent,trend,pipeline_athletes,openness_band,board_tier,is_team_event,field_units,hhi,medalist_nations,editions,alltime_leader_noc,alltime_leader_share_pct,last3_leader_noc";

export const useOpportunityBoard = () =>
  useQuery({
    queryKey: ["opportunity-board", "Summer"],
    staleTime: Infinity,
    queryFn: async (): Promise<OpportunityRow[]> => {
      const [boardRes, sportsRes] = await Promise.all([
        supabase.from("oly_event_board_cache").select(BOARD_COLUMNS).eq("season", "Summer"),
        supabase.from("sports").select("sport_id,sport_name"),
      ]);
      if (boardRes.error) throw boardRes.error;
      if (sportsRes.error) throw sportsRes.error;

      const nameById = new Map<string, string>();
      (sportsRes.data ?? []).forEach((s) => {
        if (s.sport_id && s.sport_name) nameById.set(s.sport_id, s.sport_name);
      });

      return ((boardRes.data ?? []) as BoardRow[]).map((r, i) => ({
        ...r,
        sportLabel:
          (r.kd_sport_id ? nameById.get(r.kd_sport_id) : undefined) ??
          r.canonical_discipline ??
          "—",
        rowKey: `${r.canonical_discipline ?? ""}||${r.canonical_event ?? ""}||${i}`,
      }));
    },
  });
