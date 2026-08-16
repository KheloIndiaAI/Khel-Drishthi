import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Shared caveat — kd_sport_id is NULL on ~22% of world tally rows. */
export const WORLD_SCOPE_FOOTNOTE =
  "World figures exclude historical disciplines with no modern equivalent (Tug-of-War, the Art Competitions and similar) — about 22% of world medal-tally rows carry no modern sport mapping.";

export const RECENT_YEARS = [2016, 2020, 2024];

export type SportWorldRow = {
  kd_sport_id: string;
  sport_name: string | null;
  era: string;
  gold_events: number | null;
  nations_medalling: number | null;
  medals: number | null;
  hhi: number | null;
  openness: number | null;
  leader_noc: string | null;
  leader_name: string | null;
  leader_medals: number | null;
};

export type SportCountryYearRow = {
  kd_sport_id: string;
  sport_name: string | null;
  year: number;
  country_noc: string;
  country_name: string | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  total: number | null;
};

export type RcaRow = {
  era: string;
  country_noc: string;
  country_name: string | null;
  canonical_discipline: string | null;
  kd_sport_id: string | null;
  medals: number | null;
  country_medals: number | null;
  sport_share_of_country: number | null;
  world_sport_share: number | null;
  rca: number | null;
};

export const useSportWorld = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-v-sport-world", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_sport_world")
        .select(
          "kd_sport_id,sport_name,era,gold_events,nations_medalling,medals,hhi,openness,leader_noc,leader_name,leader_medals"
        )
        .eq("kd_sport_id", sportId!);
      if (error) throw error;
      return (data || []) as SportWorldRow[];
    },
  });

export const useSportCountryYear = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-v-sport-country-year", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_sport_country_year")
        .select("kd_sport_id,sport_name,year,country_noc,country_name,gold,silver,bronze,total")
        .eq("kd_sport_id", sportId!);
      if (error) throw error;
      return (data || []) as SportCountryYearRow[];
    },
  });

export const useIndiaRca = (sportId?: string) =>
  useQuery({
    queryKey: ["oly-v-rca-india", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_rca")
        .select(
          "era,country_noc,country_name,canonical_discipline,kd_sport_id,medals,country_medals,sport_share_of_country,world_sport_share,rca"
        )
        .eq("era", "all")
        .eq("country_noc", "IND")
        .eq("kd_sport_id", sportId!);
      if (error) throw error;
      return (data || []) as RcaRow[];
    },
  });

/** RCA context: India's top over-indexed sports, for the comparison strip. */
export const useIndiaRcaAll = () =>
  useQuery({
    queryKey: ["oly-v-rca-india-all"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_v_rca")
        .select("kd_sport_id,canonical_discipline,medals,rca")
        .eq("era", "all")
        .eq("country_noc", "IND");
      if (error) throw error;
      return (data || []) as RcaRow[];
    },
  });
