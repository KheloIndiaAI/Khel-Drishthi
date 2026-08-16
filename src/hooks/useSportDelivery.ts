import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Delivery-system data for a single sport: per-centre capacity, linked
 * infrastructure projects and KISCE fund releases.
 *
 * A centre can link to a sport under several disciplines, so every count that
 * matters is taken over a DISTINCT key (project_code / fund_id / centre_id) —
 * naive row counts inflate.
 */

export interface SportCentreCapacityRow {
  sport_id: string;
  centre_id: string;
  centre_name: string | null;
  centre_type: string | null;
  state: string | null;
  district: string | null;
  is_mappable: boolean | null;
  sanctioned: number | null;
  existing: number | null;
  sanctioned_girls: number | null;
  existing_girls: number | null;
  has_para: boolean | null;
}

export interface SportProjectRow {
  sport_id: string;
  project_code: string;
  project_name: string | null;
  infra_type: string | null;
  status: string | null;
  progress: number | null;
  state: string | null;
  parent_centre_id: string | null;
  parent_facility_name: string | null;
  gps_in_india: boolean | null;
}

export interface SportFundRow {
  sport_id: string;
  fund_id: number;
  kd_centre_id: string | null;
  centre_name: string | null;
  state: string | null;
  funds_released: number | string | null;
  financial_year: string | null;
  head: string | null;
  uc_status: string | null;
  uc_pending: boolean | null;
  release_date: string | null;
}

/** Dedupe rows on a key — the views are at discipline grain in places. */
const dedupe = <T,>(rows: T[], key: (r: T) => string | number) => {
  const seen = new Set<string | number>();
  const out: T[] = [];
  for (const r of rows) {
    const k = key(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
};

export const useSportCentreCapacity = (sportId?: string) =>
  useQuery({
    queryKey: ["kd-v-sport-centre-capacity", sportId],
    enabled: Boolean(sportId),
    staleTime: Infinity,
    queryFn: async (): Promise<SportCentreCapacityRow[]> => {
      const { data, error } = await supabase
        .from("kd_v_sport_centre_capacity")
        .select(
          "sport_id, centre_id, centre_name, centre_type, state, district, is_mappable, sanctioned, existing, sanctioned_girls, existing_girls, has_para"
        )
        .eq("sport_id", sportId!);
      if (error) throw error;
      return dedupe((data ?? []) as SportCentreCapacityRow[], (r) => r.centre_id);
    },
  });

export const useSportProjects = (sportId?: string) =>
  useQuery({
    queryKey: ["kd-v-sport-projects", sportId],
    enabled: Boolean(sportId),
    staleTime: Infinity,
    queryFn: async (): Promise<SportProjectRow[]> => {
      const { data, error } = await supabase
        .from("kd_v_sport_projects")
        .select(
          "sport_id, project_code, project_name, infra_type, status, progress, state, parent_centre_id, parent_facility_name, gps_in_india"
        )
        .eq("sport_id", sportId!);
      if (error) throw error;
      return dedupe((data ?? []) as SportProjectRow[], (r) => r.project_code);
    },
  });

export const useSportFunds = (sportId?: string) =>
  useQuery({
    queryKey: ["kd-v-sport-funds", sportId],
    enabled: Boolean(sportId),
    staleTime: Infinity,
    queryFn: async (): Promise<SportFundRow[]> => {
      const { data, error } = await supabase
        .from("kd_v_sport_funds")
        .select(
          "sport_id, fund_id, kd_centre_id, centre_name, state, funds_released, financial_year, head, uc_status, uc_pending, release_date"
        )
        .eq("sport_id", sportId!);
      if (error) throw error;
      return dedupe((data ?? []) as SportFundRow[], (r) => r.fund_id);
    },
  });

/** LA28 event names — context for sports with no domestic pipeline at all. */
export const useLa28Events = (sportId?: string, enabled = true) =>
  useQuery({
    queryKey: ["sport-la28-events", sportId],
    enabled: Boolean(sportId) && enabled,
    staleTime: Infinity,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("event_std")
        .eq("sport_id", sportId!)
        .eq("present_la28", 1)
        .order("event_std");
      if (error) throw error;
      return (data ?? []).map((r: { event_std: string | null }) => r.event_std ?? "").filter(Boolean);
    },
  });
