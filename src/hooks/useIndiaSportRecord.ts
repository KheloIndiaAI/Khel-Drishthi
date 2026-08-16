import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * India Olympic-record views, all keyed on kd_sport_id.
 * Never query oly_participations / oly_athletes / oly_medals from this page.
 */

export const PLACE_FOOTNOTE =
  "Finishing places are complete through Tokyo 2020. Paris 2024 was loaded at roster grain, so recent results are under-counted.";

const db = () => supabase as any;

export interface TimelineRow {
  year: number;
  athletes: number | null;
  events_contested: number | null;
  entries: number | null;
  top8_entries: number | null;
  fourth_entries: number | null;
  entries_without_place: number | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  medals: number | null;
  female_athletes: number | null;
  male_athletes: number | null;
}

export const useIndiaSportTimeline = (sportId?: string) =>
  useQuery({
    queryKey: ["india-sport-timeline", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await db()
        .from("oly_v_india_sport_timeline")
        .select(
          "year, athletes, events_contested, entries, top8_entries, fourth_entries, entries_without_place, gold, silver, bronze, medals, female_athletes, male_athletes"
        )
        .eq("kd_sport_id", sportId!)
        .order("year", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TimelineRow[];
    },
  });

export interface OlympianRow {
  athlete_id: string;
  display_name: string | null;
  gender: string | null;
  birth_year: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  first_year: number | null;
  last_year: number | null;
  appearances: number | null;
  events_contested: number | null;
  entry_rows: number | null;
  best_place: number | null;
  top8_entries: number | null;
  fourth_places: number | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  medals: number | null;
}

const ROSTER_COLS =
  "athlete_id, display_name, gender, birth_year, height_cm, weight_kg, first_year, last_year, appearances, events_contested, entry_rows, best_place, top8_entries, fourth_places, gold, silver, bronze, medals";

export type RosterSort = "display_name" | "first_year" | "appearances" | "best_place" | "medals";

export const ROSTER_PAGE_SIZE = 25;

/** Project knowledge §4 — never search these tables on fewer than 3 characters. */
export const MIN_SEARCH_LENGTH = 3;

/**
 * Server-side paged roster. Never fetches the whole table.
 * The exact count is requested only on page 0 and reused by the caller.
 */
export const useIndiaOlympiansPage = (
  sportId: string | undefined,
  {
    page,
    search,
    sortKey,
    ascending,
  }: { page: number; search: string; sortKey: RosterSort; ascending: boolean }
) => {
  const searchActive = search.length >= MIN_SEARCH_LENGTH;
  const searchBlocked = search.length > 0 && !searchActive;
  return useQuery({
    queryKey: ["india-olympians", sportId, page, searchActive ? search : "", sortKey, ascending],
    // Below the minimum search length we do not fire a request at all.
    enabled: !!sportId && !searchBlocked,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = page * ROSTER_PAGE_SIZE;
      const wantCount = page === 0;
      let q = db()
        .from("oly_v_india_olympians")
        .select(ROSTER_COLS, wantCount ? { count: "exact" } : undefined)
        .eq("kd_sport_id", sportId!);
      if (searchActive) q = q.ilike("display_name", `%${search}%`);
      q = q
        .order(sortKey, { ascending, nullsFirst: false })
        .order("athlete_id", { ascending: true })
        .range(from, from + ROSTER_PAGE_SIZE - 1);
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as OlympianRow[], total: wantCount ? (count ?? 0) : null };
    },
  });
};


/** Debounce helper for the roster search box. */
export const useDebounced = (value: string, ms = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
};

/** Top 10 by appearances — a small, bounded query. */
export const useMostCapped = (sportId?: string) =>
  useQuery({
    queryKey: ["india-most-capped", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await db()
        .from("oly_v_india_olympians")
        .select(ROSTER_COLS)
        .eq("kd_sport_id", sportId!)
        .order("appearances", { ascending: false, nullsFirst: false })
        .order("medals", { ascending: false, nullsFirst: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as OlympianRow[];
    },
  });

export interface BiometricRow {
  gender: string | null;
  n_height: number | null;
  n_weight: number | null;
  median_height_cm: number | null;
  median_weight_kg: number | null;
  min_height_cm: number | null;
  max_height_cm: number | null;
  sport_n_height: number | null;
}

/**
 * Server-side aggregated biometrics — one row per sport per gender.
 * Gate on `sport_n_height` (sport-wide total); never count rows client-side.
 */
export const useSportBiometrics = (sportId?: string) =>
  useQuery({
    queryKey: ["india-biometrics-view", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await db()
        .from("oly_v_india_biometrics")
        .select(
          "gender, n_height, n_weight, median_height_cm, median_weight_kg, min_height_cm, max_height_cm, sport_n_height"
        )
        .eq("kd_sport_id", sportId!);
      if (error) throw error;
      return (data ?? []) as BiometricRow[];
    },
  });

export interface MedalistRow {
  year: number;
  canonical_discipline: string | null;
  event: string | null;
  medal_type: string | null;
  athlete_name: string | null;
  gender: string | null;
  birth_year: number | null;
}

export const useIndiaMedalists = (sportId?: string) =>
  useQuery({
    queryKey: ["india-medalists", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await db()
        .from("oly_v_india_medalists")
        .select("year, canonical_discipline, event, medal_type, athlete_name, gender, birth_year")
        .eq("kd_sport_id", sportId!)
        .order("year", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as MedalistRow[];
    },
  });

export interface NearMissRow {
  year: number;
  canonical_discipline: string | null;
  event_name: string | null;
  place: number | null;
  is_medal: boolean | null;
  athlete_count: number | null;
  athletes: string | null;
}

export const useIndiaNearMiss = (sportId?: string) =>
  useQuery({
    queryKey: ["india-near-miss", sportId],
    enabled: !!sportId,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await db()
        .from("oly_v_india_near_miss_events")
        .select("year, canonical_discipline, event_name, place, is_medal, athlete_count, athletes")
        .eq("kd_sport_id", sportId!)
        .eq("is_medal", false)
        .order("place", { ascending: true })
        .order("year", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as NearMissRow[];
    },
  });
