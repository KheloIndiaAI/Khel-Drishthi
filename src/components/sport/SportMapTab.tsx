import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import IndiaMap, { type Centre } from "@/components/geographic/IndiaMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, AlertTriangle, Building2, Users } from "lucide-react";

/**
 * One row per sport per centre from the kd_v_sport_centres view.
 * The view already resolves state/district from `centres`, so the drifted
 * `state` columns on the capacity tables are never used here.
 */
export interface SportCentreRow {
  sport_id: string;
  sport_name: string | null;
  centre_id: string;
  centre_name: string;
  centre_type: string;
  state: string;
  district: string | null;
  region_unit: string | null;
  operational_status: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  is_mappable: boolean | null;
}

/** Linked centres for a sport — also decides whether the Map tab is shown at all. */
export const useSportCentres = (sportId?: string) =>
  useQuery({
    queryKey: ["sport-centres", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kd_v_sport_centres")
        .select(
          "sport_id, sport_name, centre_id, centre_name, centre_type, state, district, region_unit, operational_status, latitude, longitude, is_mappable"
        )
        .eq("sport_id", sportId!)
        .order("state");
      if (error) throw error;
      return (data ?? []) as SportCentreRow[];
    },
  });

interface CapacityRow {
  centre_id: string;
  discipline_raw: string | null;
  san_grand_total: number | null;
  ex_grand_total: number | null;
  ex_res_total: number | null;
  ex_nonres_total: number | null;
  ex_res_boys: number | null;
  ex_res_girls: number | null;
}

const CAP_COLUMNS =
  "centre_id, discipline_raw, san_grand_total, ex_grand_total, ex_res_total, ex_nonres_total, ex_res_boys, ex_res_girls";

/** Capacity for THIS sport only — joined on centre_id AND sport_id. */
const useSportCapacity = (sportId?: string) =>
  useQuery({
    queryKey: ["sport-map-capacity", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const [ncoe, stc] = await Promise.all([
        supabase.from("ncoe_capacity").select(CAP_COLUMNS).eq("sport_id", sportId!),
        supabase.from("stc_capacity").select(CAP_COLUMNS).eq("sport_id", sportId!),
      ]);
      if (ncoe.error) throw ncoe.error;
      if (stc.error) throw stc.error;
      const byCentre = new Map<string, CapacityRow[]>();
      for (const row of [...(ncoe.data ?? []), ...(stc.data ?? [])] as CapacityRow[]) {
        const list = byCentre.get(row.centre_id) ?? [];
        list.push(row);
        byCentre.set(row.centre_id, list);
      }
      return byCentre;
    },
  });

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Null capacity is an em-dash, never 0. */
const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : v.toLocaleString("en-IN");

interface SportMapTabProps {
  sportId?: string;
  sportName?: string;
}

const SportMapTab = ({ sportId, sportName }: SportMapTabProps) => {
  const { data: rows, isLoading, isError } = useSportCentres(sportId);
  const { data: capacityByCentre, isError: capacityError } = useSportCapacity(sportId);
  const [selected, setSelected] = useState<Centre | null>(null);

  const { mapped, unmapped, linkedCount } = useMemo(() => {
    const all = rows ?? [];
    const mappedRows = all.filter(
      (r) => r.is_mappable && num(r.latitude) !== null && num(r.longitude) !== null
    );
    return {
      linkedCount: all.length,
      mapped: mappedRows.map<Centre>((r) => ({
        centre_id: r.centre_id,
        centre_name: r.centre_name,
        centre_type: r.centre_type,
        state: r.state,
        district: r.district,
        operational_status: r.operational_status,
        programme_subtype: null,
        latitude: r.latitude,
        longitude: r.longitude,
      })),
      unmapped: all.filter(
        (r) => !(r.is_mappable && num(r.latitude) !== null && num(r.longitude) !== null)
      ),
    };
  }, [rows]);

  const stateCount = useMemo(
    () => new Set(mapped.map((c) => c.state).filter(Boolean)).size,
    [mapped]
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-3">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-[460px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          Centre locations could not be loaded. Nothing is estimated in their place.
        </CardContent>
      </Card>
    );
  }

  const label = sportName ?? "this sport";

  if (mapped.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Where {label} is trained
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {linkedCount === 0
              ? "No training centre in the system currently lists this sport."
              : `${linkedCount} ${linkedCount === 1 ? "centre lists" : "centres list"} this sport, but none has verified coordinates yet, so nothing can be placed on the map. No position is ever approximated.`}
          </p>
          {unmapped.length > 0 && <UnmappedList rows={unmapped} />}
        </CardContent>
      </Card>
    );
  }

  const selectedCapacity = selected ? capacityByCentre?.get(selected.centre_id) ?? [] : [];
  const selectedRow = selected
    ? (rows ?? []).find((r) => r.centre_id === selected.centre_id)
    : undefined;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Where {label} is trained
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mapped.length} of {linkedCount} centres that list {label}, across {stateCount}{" "}
            {stateCount === 1 ? "state/UT" : "states/UTs"}. Click a pin for this sport's capacity
            at that centre.
          </p>
        </CardHeader>
        <CardContent>
          <IndiaMap
            centres={mapped}
            totalCentres={linkedCount}
            height="460px"
            showChoropleth={false}
            showProjects={false}
            showDistricts={false}
            fitToBounds
            onCentreClick={setSelected}
          />
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {selected.centre_name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {/* State always comes from the centre, never the capacity table. */}
              {[selectedRow?.district, selectedRow?.state ?? selected.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{selected.centre_type}</Badge>
              {selectedRow?.region_unit && (
                <Badge variant="secondary">{selectedRow.region_unit}</Badge>
              )}
            </div>
            {capacityError ? (
              <p className="text-sm text-muted-foreground">
                Capacity for this centre could not be loaded.
              </p>
            ) : selectedCapacity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sanctioned capacity is recorded for {label} at this centre.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedCapacity.map((cap, i) => {
                  const san = num(cap.san_grand_total);
                  const ex = num(cap.ex_grand_total);
                  const util = san && san > 0 && ex !== null ? Math.round((ex / san) * 100) : null;
                  return (
                    <div key={i} className="rounded-md border p-3 text-sm">
                      <div className="font-medium mb-1 flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        {cap.discipline_raw || label}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Sanctioned</div>
                          <div className="font-semibold tabular-nums">{fmt(san)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Existing</div>
                          <div className="font-semibold tabular-nums">{fmt(ex)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Utilisation</div>
                          <div className="font-semibold tabular-nums">
                            {util === null ? "—" : `${util}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  Capacity shown is for {label} at this centre only, not the centre's total across
                  all sports.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {unmapped.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <UnmappedList rows={unmapped} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const UnmappedList = ({ rows }: { rows: SportCentreRow[] }) => (
  <div>
    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-saffron" />
      {rows.length} {rows.length === 1 ? "centre has" : "centres have"} no verified coordinates
    </h4>
    <p className="text-xs text-muted-foreground mb-3">
      These are excluded from the map rather than placed at an approximate position.
    </p>
    <ul className="grid gap-1 sm:grid-cols-2">
      {rows.map((r) => (
        <li key={r.centre_id} className="text-sm flex items-start gap-2">
          <span className="text-muted-foreground">•</span>
          <span>
            {r.centre_name}
            <span className="text-muted-foreground"> — {r.state}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default SportMapTab;
