import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SportDisciplineMapRow = {
  season: string | null;
  canonical_discipline: string | null;
  kd_sport_id: string | null;
  participation_rows: number | null;
  last_year: number | null;
};

export type EventDominanceRow = {
  season: string | null;
  canonical_discipline: string | null;
  canonical_event: string | null;
  editions: number | null;
  first_year: number | null;
  last_year: number | null;
  medals_total: number | null;
  medalist_nations: number | null;
  hhi: number | null;
  alltime_leader_noc: string | null;
  alltime_leader_medals: number | null;
  alltime_leader_golds: number | null;
  alltime_leader_share_pct: number | null;
  last3_leader_noc: string | null;
  last3_leader_medals: number | null;
  last3_leader_golds: number | null;
  gold_streak_noc: string | null;
  gold_streak_len: number | null;
  gold_streak_from: number | null;
  gold_streak_to: number | null;
  era_winners: string | null;
};

export type EventBoardRow = {
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
  ranked_coverage: number | null;
  hhi: number | null;
  medalist_nations: number | null;
};

export type EventRiserRow = {
  season: string | null;
  canonical_discipline: string | null;
  canonical_event: string | null;
  country_noc: string | null;
  medals_last3: number | null;
  medals_prev3: number | null;
  medal_gain: number | null;
  top8_last3: number | null;
  top8_prev3: number | null;
  top8_gain: number | null;
  topdecile_last3: number | null;
  topdecile_prev3: number | null;
  topdecile_gain: number | null;
  event_last_year: number | null;
};

export type DisciplineAgeRow = {
  season: string | null;
  canonical_discipline: string | null;
  era: string | null;
  medallists_n: number | null;
  medal_age_p10: number | null;
  medal_age_p50: number | null;
  medal_age_p90: number | null;
  medal_age_window: number | null;
  entrant_age_p50: number | null;
  india_entrants_n: number | null;
  india_age_p50: number | null;
  age_gap_yrs: number | null;
  birth_cohort_for_2028: number | null;
  birth_cohort_for_2036: number | null;
};

const DOMINANCE_COLS =
  "season,canonical_discipline,canonical_event,editions,first_year,last_year,medals_total,medalist_nations,hhi,alltime_leader_noc,alltime_leader_medals,alltime_leader_golds,alltime_leader_share_pct,last3_leader_noc,last3_leader_medals,last3_leader_golds,gold_streak_noc,gold_streak_len,gold_streak_from,gold_streak_to,era_winners";

const BOARD_COLS =
  "season,canonical_discipline,canonical_event,kd_sport_id,games_contested_recent,best_place_recent,best_year,trail,distance_to_podium,nations_medalling_recent,games_held_recent,trend,pipeline_athletes,openness_band,board_tier,is_team_event,field_units,ranked_coverage,hhi,medalist_nations";

const RISER_COLS =
  "season,canonical_discipline,canonical_event,country_noc,medals_last3,medals_prev3,medal_gain,top8_last3,top8_prev3,top8_gain,topdecile_last3,topdecile_prev3,topdecile_gain,event_last_year";

const AGE_COLS =
  "season,canonical_discipline,era,medallists_n,medal_age_p10,medal_age_p50,medal_age_p90,medal_age_window,entrant_age_p50,india_entrants_n,india_age_p50,age_gap_yrs,birth_cohort_for_2028,birth_cohort_for_2036";

export const useSportDisciplines = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-v-sport-discipline-map", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_sport_discipline_map")
        .select("season,canonical_discipline,kd_sport_id,participation_rows,last_year")
        .eq("kd_sport_id", sportId!)
        .eq("season", "Summer");
      if (error) throw error;
      return (data || []) as SportDisciplineMapRow[];
    },
  });

export const useEventDominance = (disciplines: string[]) =>
  useQuery({
    queryKey: ["oly-v-event-dominance", disciplines],
    staleTime: Infinity,
    enabled: disciplines.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_event_dominance")
        .select(DOMINANCE_COLS)
        .in("canonical_discipline", disciplines)
        .eq("season", "Summer");
      if (error) throw error;
      return (data || []) as EventDominanceRow[];
    },
  });

export const useEventBoard = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-event-board-cache", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_event_board_cache")
        .select(BOARD_COLS)
        .eq("kd_sport_id", sportId!)
        .eq("season", "Summer");
      if (error) throw error;
      return (data || []) as EventBoardRow[];
    },
  });

export const useEventRisers = (discipline?: string | null, event?: string | null) =>
  useQuery({
    queryKey: ["oly-v-event-risers", discipline, event],
    staleTime: Infinity,
    enabled: !!discipline && !!event,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_event_risers")
        .select(RISER_COLS)
        .eq("season", "Summer")
        .eq("canonical_discipline", discipline!)
        .eq("canonical_event", event!);
      if (error) throw error;
      return (data || []) as EventRiserRow[];
    },
  });


export const useDisciplineAge = (disciplines: string[]) =>
  useQuery({
    queryKey: ["oly-v-discipline-age", disciplines],
    staleTime: Infinity,
    enabled: disciplines.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_discipline_age")
        .select(AGE_COLS)
        .in("canonical_discipline", disciplines)
        .eq("season", "Summer");
      if (error) throw error;
      return (data || []) as DisciplineAgeRow[];
    },
  });

/** Composite identity for an event: discipline + event name. */
export const eventKey = (discipline: string | null | undefined, event: string | null | undefined) =>
  `${discipline ?? ""}||${event ?? ""}`;

/** Split a composite key back into its parts. */
export const parseEventKey = (key: string | null | undefined) => {
  const [discipline = "", event = ""] = (key ?? "").split("||");
  return { discipline, event };
};

/** "2016:14 2020:12 2024:3" -> [{year:2016, place:14}, ...] */

export const parseTrail = (trail: string | null | undefined) => {
  if (!trail) return [] as { year: number; place: number }[];
  return trail
    .trim()
    .split(/\s+/)
    .map((chunk) => {
      const [y, p] = chunk.split(":");
      const year = Number(y);
      const place = Number(p);
      return Number.isFinite(year) && Number.isFinite(place) ? { year, place } : null;
    })
    .filter((v): v is { year: number; place: number } => v !== null);
};

/** "1980s:URS 1990s:RUS" -> [{decade:"1980s", noc:"URS"}, ...] */
export const parseEraWinners = (era: string | null | undefined) => {
  if (!era) return [] as { decade: string; noc: string }[];
  return era
    .trim()
    .split(/\s+/)
    .map((chunk) => {
      const [decade, noc] = chunk.split(":");
      return decade && noc ? { decade, noc } : null;
    })
    .filter((v): v is { decade: string; noc: string } => v !== null);
};
