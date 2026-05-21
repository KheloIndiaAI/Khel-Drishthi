import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

export type SearchEntityType =
  | "sport"
  | "discipline"
  | "event"
  | "centre"
  | "state"
  | "district"
  | "region";

export interface SearchItem {
  id: string;
  type: SearchEntityType;
  label: string;
  sublabel?: string;
  keywords: string;
  route: string;
  badge?: string;
}

export const useGlobalSearchIndex = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["global-search-index"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const [sports, disciplines, events, centres, regions] = await Promise.all([
        supabase.from("sports").select("sport_id, sport_name, is_tops, is_tagg, present_la28, present_ag2026"),
        supabase.from("disciplines").select("discipline_id, discipline_std, sport_id"),
        supabase.from("events").select("event_id, event_std, sport_id, present_la28, present_ag2026").limit(2000),
        supabase.from("centres").select("centre_id, centre_name, centre_type, state, district"),
        supabase.from("regional_centres").select("id, name, display_name"),
      ]);

      return {
        sports: sports.data ?? [],
        disciplines: disciplines.data ?? [],
        events: events.data ?? [],
        centres: centres.data ?? [],
        regions: regions.data ?? [],
      };
    },
  });

  const index = useMemo<SearchItem[]>(() => {
    if (!data) return [];
    const items: SearchItem[] = [];
    const sportName = new Map(data.sports.map((s) => [s.sport_id, s.sport_name]));

    for (const s of data.sports) {
      const badges = [
        s.present_la28 ? "LA28" : null,
        s.present_ag2026 ? "AG26" : null,
        s.is_tops ? "TOPS" : null,
        s.is_tagg ? "TAGG" : null,
      ].filter(Boolean).join(" · ");
      items.push({
        id: `sport-${s.sport_id}`,
        type: "sport",
        label: s.sport_name,
        sublabel: badges || undefined,
        keywords: s.sport_name.toLowerCase(),
        route: `/sport/${s.sport_id}`,
      });
    }

    for (const d of data.disciplines) {
      const parent = sportName.get(d.sport_id);
      items.push({
        id: `disc-${d.discipline_id}`,
        type: "discipline",
        label: d.discipline_std,
        sublabel: parent ? `under ${parent}` : undefined,
        keywords: `${d.discipline_std} ${parent ?? ""}`.toLowerCase(),
        route: `/sport/${d.sport_id}`,
      });
    }

    for (const e of data.events) {
      const parent = sportName.get(e.sport_id);
      const badge = [e.present_la28 ? "LA28" : null, e.present_ag2026 ? "AG26" : null].filter(Boolean).join(" + ");
      items.push({
        id: `evt-${e.event_id}`,
        type: "event",
        label: e.event_std,
        sublabel: [parent, badge].filter(Boolean).join(" · "),
        keywords: `${e.event_std} ${parent ?? ""}`.toLowerCase(),
        route: `/sport/${e.sport_id}?tab=events`,
      });
    }

    const stateCounts = new Map<string, number>();
    const districtKeys = new Map<string, { district: string; state: string; count: number }>();

    for (const c of data.centres) {
      if (!c.centre_name) continue;
      items.push({
        id: `ctr-${c.centre_id}`,
        type: "centre",
        label: c.centre_name,
        sublabel: [c.state, c.centre_type].filter(Boolean).join(" · "),
        keywords: `${c.centre_name} ${c.state ?? ""} ${c.district ?? ""} ${c.centre_type ?? ""}`.toLowerCase(),
        route: `/infrastructure?centre=${encodeURIComponent(c.centre_id)}`,
      });
      if (c.state) stateCounts.set(c.state, (stateCounts.get(c.state) ?? 0) + 1);
      if (c.district && c.state) {
        const key = `${c.district}|${c.state}`;
        const cur = districtKeys.get(key);
        districtKeys.set(key, { district: c.district, state: c.state, count: (cur?.count ?? 0) + 1 });
      }
    }

    for (const [state, count] of stateCounts) {
      items.push({
        id: `state-${state}`,
        type: "state",
        label: state,
        sublabel: `${count} centre${count === 1 ? "" : "s"}`,
        keywords: state.toLowerCase(),
        route: `/geographic?state=${encodeURIComponent(state)}`,
      });
    }

    for (const { district, state, count } of districtKeys.values()) {
      items.push({
        id: `dist-${district}-${state}`,
        type: "district",
        label: district,
        sublabel: `${state} · ${count} centre${count === 1 ? "" : "s"}`,
        keywords: `${district} ${state}`.toLowerCase(),
        route: `/infrastructure?district=${encodeURIComponent(district)}`,
      });
    }

    for (const r of data.regions) {
      items.push({
        id: `region-${r.id}`,
        type: "region",
        label: r.display_name,
        sublabel: "Regional Centre",
        keywords: `${r.display_name} ${r.name}`.toLowerCase(),
        route: `/infrastructure?region=${encodeURIComponent(r.name)}`,
      });
    }

    return items;
  }, [data]);

  return { index, isLoading };
};
