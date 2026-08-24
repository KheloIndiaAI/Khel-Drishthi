import { useQueries, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Era cuts follow Olympic history: the post-war resumption (1948) and the
 *  post-Soviet reordering (1992). */
export type EraKey = "all" | "prewar" | "coldwar" | "modern" | "last3";

export const ERA_OPTIONS: { key: EraKey; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "prewar", label: "Pre-war (–1948)" },
  { key: "coldwar", label: "Cold war (1948–1988)" },
  { key: "modern", label: "Modern (1992–)" },
  { key: "last3", label: "Last three Games" },
];

export const ERA_CHART_LABEL: Record<EraKey, string> = {
  all: "all time",
  prewar: "pre-war era",
  coldwar: "cold war era",
  modern: "modern era",
  last3: "last three Games",
};

/** Year predicate for an era. `lastThreeYears` must be computed from the data. */
export const makeEraFilter = (era: EraKey, lastThreeYears: number[]) => {
  switch (era) {
    case "prewar":
      return (y: number) => y < 1948;
    case "coldwar":
      return (y: number) => y >= 1948 && y <= 1988;
    case "modern":
      return (y: number) => y >= 1992;
    case "last3":
      return (y: number) => lastThreeYears.includes(y);
    default:
      return () => true;
  }
};

export type StrikeRow = {
  season: string;
  year: number;
  country_noc: string;
  events_contested: number | null;
  events_medalled: number | null;
  strike_rate_pct: number | null;
  athletes: number | null;
  era: string | null;
};

export const useCountryStrike = (nocs: string[]) =>
  useQuery({
    queryKey: ["oly-v-country-games-strike", nocs.join(",")],
    staleTime: Infinity,
    enabled: nocs.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_country_games_strike")
        .select(
          "season,year,country_noc,events_contested,events_medalled,athletes,strike_rate_pct,era"
        )
        .eq("season", "Summer")
        .in("country_noc", nocs);
      if (error) throw error;
      return (data || []) as StrikeRow[];
    },
  });

export type RiserRow = {
  season: string;
  canonical_discipline: string | null;
  canonical_event: string | null;
  country_noc: string;
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

const RISER_COLS =
  "season,canonical_discipline,canonical_event,country_noc,medals_last3,medals_prev3,medal_gain,top8_last3,top8_prev3,top8_gain,topdecile_last3,topdecile_prev3,topdecile_gain,event_last_year";

const fetchRisers = async (noc: string) => {
  const { data, error } = await supabase
    .from("oly_v_event_risers")
    .select(RISER_COLS)
    .eq("season", "Summer")
    .eq("country_noc", noc)
    .eq("event_last_year", 2024);
  if (error) throw error;
  return (data || []) as RiserRow[];
};

/** Sequential, one NOC at a time — the view is expensive and both a multi-country
 *  IN() and concurrent single-country calls exceed the statement timeout. */
export const useEventRisers = (nocs: string[]) => {
  const q = useQuery({
    queryKey: ["oly-v-event-risers-benchmark", [...nocs].sort().join(",")],
    staleTime: Infinity,
    retry: 1,
    enabled: nocs.length > 0,
    queryFn: async () => {
      const out: RiserRow[] = [];
      for (const noc of nocs) out.push(...(await fetchRisers(noc)));
      return out;
    },
  });

  return { data: q.data || [], isLoading: q.isLoading, isError: q.isError };
};


