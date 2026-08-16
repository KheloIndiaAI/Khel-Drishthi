import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * One row per sport per state from the kd_v_sport_state view.
 * Counts are pre-aggregated server-side — never recompute them in the browser.
 */
export interface SportStateRow {
  sport_id: string;
  sport_name: string | null;
  state: string;
  centres: number | null;
  centres_mappable: number | null;
  ncoe: number | null;
  stc: number | null;
  kic: number | null;
  kisce: number | null;
  sanctioned: number | null;
  existing: number | null;
}

/**
 * State-level footprint of a single sport. Only fetched when a sport is selected.
 */
export const useSportStates = (sportId?: string) =>
  useQuery({
    queryKey: ['kd-v-sport-state', sportId],
    enabled: Boolean(sportId),
    staleTime: Infinity,
    queryFn: async (): Promise<SportStateRow[]> => {
      const { data, error } = await supabase
        .from('kd_v_sport_state')
        .select(
          'sport_id, sport_name, state, centres, centres_mappable, ncoe, stc, kic, kisce, sanctioned, existing'
        )
        .eq('sport_id', sportId!);
      if (error) throw error;
      return (data ?? []) as SportStateRow[];
    },
  });

/** Aggregate the state rows into the page-level summary figures. */
export const summariseSportStates = (rows: SportStateRow[] | undefined) => {
  if (!rows || rows.length === 0) return null;
  const sum = (key: keyof SportStateRow) =>
    rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
  return {
    sportName: rows[0].sport_name ?? '',
    centres: sum('centres'),
    centresMappable: sum('centres_mappable'),
    // "States present" means states that have at least one mapped centre.
    statesWithMappedCentre: rows.filter((r) => (Number(r.centres_mappable) || 0) > 0).length,
    statesLinked: rows.length,
    existing: sum('existing'),
    sanctioned: sum('sanctioned'),
  };
};
