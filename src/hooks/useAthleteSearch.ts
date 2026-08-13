import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AthleteSearchResult {
  athlete_id: string;
  display_name: string;
  country_noc: string | null;
  medal_summary: string | null;
  total_medals: number | null;
  primary_discipline: string | null;
  era: string | null;
  kd_sport_id: string | null;
}

/** Debounced, server-side athlete search. Never indexes oly_athletes client-side. */
export const useAthleteSearch = (query: string) => {
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const enabled = debounced.length >= 3;

  const { data, isFetching } = useQuery({
    queryKey: ["athlete-search", debounced.toLowerCase()],
    enabled,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_athletes")
        .select(
          "athlete_id, display_name, country_noc, medal_summary, total_medals, primary_discipline, era, kd_sport_id"
        )
        .ilike("display_name", `%${debounced}%`)
        .order("total_medals", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as AthleteSearchResult[];
    },
  });

  return {
    athletes: enabled ? data ?? [] : [],
    isLoading: enabled && isFetching,
  };
};
