import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Globe, Info, Scale, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RECENT_YEARS,
  WORLD_SCOPE_FOOTNOTE,
  useIndiaRca,
  useIndiaRcaAll,
  useSportCountryYear,
  useSportWorld,
  type SportCountryYearRow,
} from "@/hooks/useSportWorld";

const DASH = "—";
const num = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined || Number.isNaN(v) ? DASH : v.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits });

const ErrorNote = ({ label }: { label: string }) => (
  <p className="text-sm text-muted-foreground flex items-center gap-2">
    <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
    {label} could not be loaded.
  </p>
);

interface Props {
  sportId?: string;
  sportName?: string;
}

const RCA_BAR_CAP = 12; // bars beyond this are drawn full-width and marked clipped

export const WorldContextTab = ({ sportId, sportName }: Props) => {
  const world = useSportWorld(sportId);
  const cy = useSportCountryYear(sportId);
  const rca = useIndiaRca(sportId);
  const rcaAll = useIndiaRcaAll();

  const last3 = world.data?.find((r) => r.era === "last3");
  const allTime = world.data?.find((r) => r.era === "all");
  const label = sportName || last3?.sport_name || allTime?.sport_name || "This sport";

  const rows = cy.data || [];

  /* ---------- 1. Who owns this sport (last three Games) ---------- */
  const ownership = useMemo(() => {
    const recent = rows.filter((r) => RECENT_YEARS.includes(r.year));
    const byNoc = new Map<string, { noc: string; name: string; gold: number; silver: number; bronze: number; total: number }>();
    recent.forEach((r) => {
      const e = byNoc.get(r.country_noc) || {
        noc: r.country_noc,
        name: r.country_name || r.country_noc,
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
      };
      e.gold += r.gold || 0;
      e.silver += r.silver || 0;
      e.bronze += r.bronze || 0;
      e.total += r.total || 0;
      byNoc.set(r.country_noc, e);
    });
    const ranked = [...byNoc.values()]
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total || b.gold - a.gold);
    const pool = ranked.reduce((s, c) => s + c.total, 0);
    const withRank = ranked.map((c, i) => ({ ...c, rank: i + 1, share: pool ? (c.total / pool) * 100 : 0 }));
    const top10 = withRank.slice(0, 10);
    const india = withRank.find((c) => c.noc === "IND");
    return { top10, india, indiaInTop10: top10.some((c) => c.noc === "IND"), pool };
  }, [rows]);

  /* ---------- 4. Event supply trend ---------- */
  const supply = useMemo(() => {
    const byYear = new Map<number, number>();
    rows.forEach((r) => byYear.set(r.year, (byYear.get(r.year) || 0) + (r.gold || 0)));
    return [...byYear.entries()]
      .map(([year, events]) => ({ year, events }))
      .sort((a, b) => a.year - b.year);
  }, [rows]);

  /* ---------- 5. Peer overlay ---------- */
  const peerOptions = useMemo(() => {
    const byNoc = new Map<string, { noc: string; name: string; total: number }>();
    rows.forEach((r) => {
      if (r.country_noc === "IND") return;
      const e = byNoc.get(r.country_noc) || { noc: r.country_noc, name: r.country_name || r.country_noc, total: 0 };
      e.total += r.total || 0;
      byNoc.set(r.country_noc, e);
    });
    return [...byNoc.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [rows]);

  const defaultPeer = allTime?.leader_noc && allTime.leader_noc !== "IND" ? allTime.leader_noc : peerOptions[0]?.noc;
  const [peerChoice, setPeerChoice] = useState<string | undefined>(undefined);
  const peer = peerChoice || defaultPeer;
  const peerName = peerOptions.find((p) => p.noc === peer)?.name || peer;

  const overlay = useMemo(() => {
    const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
    const sum = (list: SportCountryYearRow[]) => list.reduce((s, r) => s + (r.total || 0), 0);
    return years.map((y) => ({
      year: y,
      India: sum(rows.filter((r) => r.year === y && r.country_noc === "IND")),
      Peer: sum(rows.filter((r) => r.year === y && r.country_noc === peer)),
    }));
  }, [rows, peer]);

  /* ---------- 3. RCA ---------- */
  const sportRca = rca.data?.[0];
  const rcaList = useMemo(
    () =>
      (rcaAll.data || [])
        .filter((r) => r.rca !== null)
        .sort((a, b) => (b.rca || 0) - (a.rca || 0))
        .slice(0, 8),
    [rcaAll.data]
  );

  /* ---------- 2. Openness verdict ---------- */
  const verdict = useMemo(() => {
    if (!last3) return null;
    const nations = last3.nations_medalling ?? 0;
    const hhi = last3.hhi ?? 0;
    const leader = last3.leader_name || last3.leader_noc || "the leading nation";
    if (hhi >= 0.15 || nations <= 15) {
      return `${label} is one of the more closed sports on the programme — only ${nations} nations have medalled in the last three Games, and ${leader} took ${num(last3.leader_medals)} medals.`;
    }
    if (hhi <= 0.08) {
      return `${label} is one of the most open sports on the programme — ${nations} different nations medalled in the last three Games, with ${leader} on just ${num(last3.leader_medals)} of ${num(last3.medals)} medals.`;
    }
    return `${label} sits mid-field on openness — ${nations} nations medalled in the last three Games, with ${leader} leading on ${num(last3.leader_medals)} medals.`;
  }, [last3, label]);

  const loading = world.isLoading || cy.isLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared caveat, once for the whole tab */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
        <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">{WORLD_SCOPE_FOOTNOTE}</p>
      </div>

      {/* 1. Who owns this sport */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Who owns this sport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Medals over the last three Summer Games (2016, 2020, 2024) — {num(ownership.pool)} medals in the pool.
          </p>
          {cy.isError ? (
            <ErrorNote label="World medal history" />
          ) : ownership.top10.length === 0 ? (
            <p className="text-sm text-muted-foreground">No medals recorded in the last three Games.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted-foreground">
                    <th className="text-left font-medium py-1.5 w-10">#</th>
                    <th className="text-left font-medium py-1.5">Nation</th>
                    <th className="text-right font-medium py-1.5">G</th>
                    <th className="text-right font-medium py-1.5">S</th>
                    <th className="text-right font-medium py-1.5">B</th>
                    <th className="text-right font-medium py-1.5">Medals</th>
                    <th className="text-right font-medium py-1.5">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {ownership.top10.map((c) => {
                    const isIndia = c.noc === "IND";
                    return (
                      <tr
                        key={c.noc}
                        className={cn(
                          "border-t border-border/60",
                          isIndia && "bg-primary/10 font-semibold"
                        )}
                      >
                        <td className="py-1.5 tabular-nums text-muted-foreground">{c.rank}</td>
                        <td className="py-1.5 pr-2">
                          {c.name}
                          {isIndia && (
                            <Badge className="ml-2 align-middle" variant="default">
                              India
                            </Badge>
                          )}
                        </td>
                        <td className="py-1.5 text-right tabular-nums">{num(c.gold)}</td>
                        <td className="py-1.5 text-right tabular-nums">{num(c.silver)}</td>
                        <td className="py-1.5 text-right tabular-nums">{num(c.bronze)}</td>
                        <td className="py-1.5 text-right tabular-nums font-semibold">{num(c.total)}</td>
                        <td className="py-1.5 text-right tabular-nums">{c.share.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                {!ownership.indiaInTop10 && (
                  <tfoot>
                    <tr className="border-t-2 border-border bg-primary/10 font-semibold">
                      <td className="py-1.5 tabular-nums">{ownership.india ? ownership.india.rank : DASH}</td>
                      <td className="py-1.5 pr-2">
                        India
                        <Badge className="ml-2 align-middle" variant="default">
                          India
                        </Badge>
                      </td>
                      <td className="py-1.5 text-right tabular-nums">{ownership.india ? num(ownership.india.gold) : DASH}</td>
                      <td className="py-1.5 text-right tabular-nums">{ownership.india ? num(ownership.india.silver) : DASH}</td>
                      <td className="py-1.5 text-right tabular-nums">{ownership.india ? num(ownership.india.bronze) : DASH}</td>
                      <td className="py-1.5 text-right tabular-nums">{ownership.india ? num(ownership.india.total) : DASH}</td>
                      <td className="py-1.5 text-right tabular-nums">
                        {ownership.india ? `${ownership.india.share.toFixed(1)}%` : DASH}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
              {!ownership.indiaInTop10 && !ownership.india && (
                <p className="text-xs text-muted-foreground mt-2">
                  India has not medalled in {label} in the last three Games.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Openness */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Openness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {world.isError ? (
            <ErrorNote label="Sport-level world summary" />
          ) : !last3 ? (
            <p className="text-sm text-muted-foreground">No world summary available for this sport.</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Nations medalling</div>
                  <div className="text-3xl font-bold mt-1 tabular-nums">{num(last3.nations_medalling)}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    against {num(last3.gold_events)} gold events available across the last three Games.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    The more nations that reach a podium relative to the events on offer, the harder the sport is for
                    any one country to dominate.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Concentration (HHI)</div>
                  <div className="text-3xl font-bold mt-1 tabular-nums">
                    {last3.hhi === null ? DASH : last3.hhi.toFixed(3)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sum of squared national medal shares over the last three Games.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    A low HHI means medals are spread widely across many nations; a high HHI means a few nations take
                    almost everything.
                  </p>
                </div>
              </div>
              {verdict && (
                <p className="text-sm rounded-lg bg-muted/50 border border-border p-3">{verdict}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 3. India's comparative advantage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4" /> India's comparative advantage (RCA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            RCA is the share of India's Olympic medals coming from this sport, divided by that sport's share of all
            Olympic medals — above 1.0 means India over-indexes on it.
          </p>
          {rca.isError ? (
            <ErrorNote label="Comparative advantage" />
          ) : !sportRca || sportRca.rca === null ? (
            <p className="text-sm text-muted-foreground rounded-lg bg-muted/40 border border-border p-3">
              No Indian medal in this sport — RCA is undefined.
            </p>
          ) : (
            <div className="rounded-lg border border-border p-4">
              <div className="text-4xl font-bold tabular-nums">{sportRca.rca.toFixed(2)}×</div>
              <p className="text-sm text-muted-foreground mt-1">
                {num(sportRca.medals)} of India's {num(sportRca.country_medals)} Olympic medals come from{" "}
                {label} ({((sportRca.sport_share_of_country || 0) * 100).toFixed(1)}% of India's total, against{" "}
                {((sportRca.world_sport_share || 0) * 100).toFixed(1)}% of all Olympic medals).
              </p>
            </div>
          )}

          {/* Comparison strip — bars capped so Hockey's 51× does not flatten the rest */}
          {rcaAll.isError ? (
            <ErrorNote label="India RCA comparison" />
          ) : rcaList.length > 0 ? (
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                India across sports (bars capped at {RCA_BAR_CAP}× — clipped bars are labelled)
              </div>
              <ul className="space-y-2">
                {rcaList.map((r) => {
                  const value = r.rca || 0;
                  const clipped = value > RCA_BAR_CAP;
                  const pct = Math.min(value / RCA_BAR_CAP, 1) * 100;
                  const isCurrent = r.kd_sport_id === sportId;
                  return (
                    <li key={r.kd_sport_id || r.canonical_discipline} className="text-sm">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className={cn(isCurrent && "font-semibold")}>
                          {r.canonical_discipline}
                          {isCurrent && <span className="text-muted-foreground"> (this sport)</span>}
                        </span>
                        <span className="tabular-nums font-medium">
                          {value.toFixed(2)}×{clipped && <span className="text-muted-foreground"> · clipped</span>}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted mt-1 overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", isCurrent ? "bg-primary" : "bg-muted-foreground/50")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Bars longer than {RCA_BAR_CAP}× are drawn at full width and marked "clipped"; the exact figure is
                always shown as text.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 4. Event supply trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Event supply per Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Gold events contested in {label} at each Summer Games — is the medal pool growing?
          </p>
          {cy.isError ? (
            <ErrorNote label="Event supply" />
          ) : supply.length === 0 ? (
            <p className="text-sm text-muted-foreground">No event history available.</p>
          ) : (
            <div
              className="h-[280px]"
              role="img"
              aria-label={`Bar chart of gold events contested in ${label} per Summer Games, from ${supply[0].year} (${supply[0].events} events) to ${supply[supply.length - 1].year} (${supply[supply.length - 1].events} events).`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supply} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="events" name="Gold events" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Peer overlay */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">India vs a peer nation</CardTitle>
        </CardHeader>
        <CardContent>
          {cy.isError ? (
            <ErrorNote label="Peer comparison" />
          ) : peerOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No peer nations with medals in this sport.</p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Compare India with</span>
                <Select value={peer} onValueChange={setPeerChoice}>
                  <SelectTrigger className="w-[240px]" aria-label="Choose peer nation">
                    <SelectValue placeholder="Choose a nation" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {peerOptions.map((p) => (
                      <SelectItem key={p.noc} value={p.noc}>
                        {p.name} ({p.total})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div
                className="h-[300px]"
                role="img"
                aria-label={`Line chart comparing medals per Summer Games in ${label}: India (solid line) against ${peerName} (dashed line), from ${overlay[0]?.year ?? DASH} to ${overlay[overlay.length - 1]?.year ?? DASH}.`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={overlay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <RTooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="India"
                      name="India"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Peer"
                      name={peerName || "Peer"}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                India is the solid line; {peerName} is the dashed line — the two series differ in line style as well as
                colour.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldContextTab;
