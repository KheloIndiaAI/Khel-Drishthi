import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Building2,
  Clock,
  HardHat,
  Info,
  IndianRupee,
  MapPin,
  Medal,
  Target,
  Users,
} from "lucide-react";
import type { SportPipelineRow } from "@/hooks/useSportPipeline";
import { useSportStates, summariseSportStates } from "@/hooks/useSportStates";
import {
  useLa28Events,
  useSportCentreCapacity,
  useSportFunds,
  useSportProjects,
} from "@/hooks/useSportDelivery";
import { formatINR } from "@/hooks/useKisce";

const DASH = "—";
const n = (v: number | null | undefined) =>
  v == null ? DASH : Number(v).toLocaleString("en-IN");

const ErrorNote = ({ what }: { what: string }) => (
  <p className="text-xs text-destructive flex items-center gap-1.5">
    <AlertTriangle className="h-3 w-3" /> {what} could not be loaded.
  </p>
);

/** Status → non-colour-only treatment: every chip carries its label. */
const statusTone = (status: string | null) => {
  const s = (status || "").toLowerCase();
  if (s.includes("complet")) return "bg-india-green/15 text-india-green border-india-green/40";
  if (s.includes("progress") || s.includes("ongoing"))
    return "bg-saffron/15 text-saffron-ink border-saffron/40";
  if (s.includes("hold") || s.includes("stall") || s.includes("stop"))
    return "bg-destructive/10 text-destructive border-destructive/40";
  return "bg-muted text-muted-foreground border-border";
};

interface Props {
  sportId: string;
  sportName: string;
  pipeline: SportPipelineRow | null | undefined;
  pipelineLoading: boolean;
  /** Jump to the Map tab — used from mappable centre rows. */
  onOpenMap?: () => void;
  mapAvailable?: boolean;
}

const PipelineTab = ({
  sportId,
  sportName,
  pipeline,
  pipelineLoading,
  onOpenMap,
  mapAvailable,
}: Props) => {
  const archetype = pipeline?.archetype ?? null;
  const noPipeline = archetype === "D_no_pipeline";
  const nonOlympic = archetype === "C_non_olympic";

  const capacityQ = useSportCentreCapacity(noPipeline ? undefined : sportId);
  const statesQ = useSportStates(noPipeline ? undefined : sportId);
  const projectsQ = useSportProjects(noPipeline ? undefined : sportId);
  const fundsQ = useSportFunds(noPipeline ? undefined : sportId);
  const la28Q = useLa28Events(sportId, noPipeline);

  const centres = capacityQ.data ?? [];
  const stateSummary = summariseSportStates(statesQ.data);
  const projects = projectsQ.data ?? [];
  const funds = fundsQ.data ?? [];

  const cap = useMemo(() => {
    const sum = (k: keyof (typeof centres)[number]) =>
      centres.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const sanctioned = sum("sanctioned");
    const existing = sum("existing");
    return {
      sanctioned,
      existing,
      sanctionedGirls: sum("sanctioned_girls"),
      existingGirls: sum("existing_girls"),
      utilisation: sanctioned > 0 ? Math.round((existing / sanctioned) * 100) : null,
      girlsShare: existing > 0 ? Math.round((sum("existing_girls") / existing) * 100) : null,
      centreCount: centres.length,
    };
  }, [centres]);

  const projectStats = useMemo(() => {
    const byStatus = new Map<string, number>();
    const byType = new Map<string, number>();
    for (const p of projects) {
      const s = p.status || "Unknown";
      byStatus.set(s, (byStatus.get(s) || 0) + 1);
      const t = p.infra_type || "Unspecified";
      byType.set(t, (byType.get(t) || 0) + 1);
    }
    const inProgress = projects
      .filter((p) => (p.status || "").toLowerCase().includes("progress") || (p.progress ?? 0) > 0)
      .filter((p) => !(p.status || "").toLowerCase().includes("complet"))
      .sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0))
      .slice(0, 15);
    return {
      total: projects.length,
      byStatus: [...byStatus.entries()].sort((a, b) => b[1] - a[1]),
      byType: [...byType.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count })),
      inProgress,
    };
  }, [projects]);

  const conversionReliable = pipeline?.india_conversion_is_reliable === true;
  const conversion =
    pipeline?.india_conversion == null ? null : Number(pipeline.india_conversion) * 100;

  /* ---------------------------------------------------------- D_no_pipeline */
  if (pipelineLoading) return <Skeleton className="h-64 w-full" />;

  if (noPipeline) {
    const evts = la28Q.data ?? [];
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-saffron-ink" />
            No delivery pipeline recorded
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            No training centre in the system currently lists {sportName}. There is no
            sanctioned capacity, no trainee headcount, no linked infrastructure project
            and no fund release to report.
          </p>
          <div className="rounded-lg border p-4 bg-muted/30">
            <p className="font-medium mb-2">
              {evts.length || pipeline?.la28_events || 0} events at LA28
            </p>
            {la28Q.isError ? (
              <ErrorNote what="LA28 events" />
            ) : evts.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground text-xs">
                {evts.map((e) => (
                  <li key={e}>• {e}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">{DASH}</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Medal opportunity exists on the LA28 programme; domestic delivery capacity
              for it does not appear anywhere in this portal's records.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ----------------------------------------------------------------- Funnel */
  const funnelToday = [
    { label: "Sanctioned capacity", value: cap.sanctioned || pipeline?.sanctioned_capacity || 0, icon: Building2 },
    { label: "Current trainees", value: cap.existing || pipeline?.existing_athletes || 0, icon: Users },
  ];
  const funnelHistoric = [
    { label: "Indian Olympians", value: pipeline?.india_olympians ?? null, icon: Users },
    { label: "Top-8 finishes", value: pipeline?.india_top8 ?? null, icon: Target },
    { label: "Olympic medals", value: pipeline?.india_medals ?? null, icon: Medal },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" /> Delivery system at a glance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid gap-4 ${nonOlympic ? "" : "lg:grid-cols-2"}`}>
            <div className="rounded-lg border-2 border-saffron/40 bg-saffron/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-saffron-ink mb-3">
                Capacity today
              </p>
              <div className="grid grid-cols-2 gap-3">
                {funnelToday.map((s) => (
                  <div key={s.label} className="rounded-md bg-background p-3 border">
                    <s.icon className="h-4 w-4 text-muted-foreground mb-1" />
                    <p className="text-2xl font-bold">{n(s.value)}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {!nonOlympic && (
              <div className="rounded-lg border-2 border-india-green/40 bg-india-green/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-india-green mb-3">
                  Olympic record to date (since 1900)
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {funnelHistoric.map((s) => (
                    <div key={s.label} className="rounded-md bg-background p-3 border">
                      <s.icon className="h-4 w-4 text-muted-foreground mb-1" />
                      <p className="text-2xl font-bold">{n(s.value)}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs">
                  {conversionReliable && conversion != null ? (
                    <span>
                      Top-8 → medal conversion:{" "}
                      <span className="font-semibold">{conversion.toFixed(1)}%</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Conversion not shown — too few recorded finishing places
                      {pipeline?.india_place_coverage_pct != null
                        ? ` (${Number(pipeline.india_place_coverage_pct).toFixed(1)}% place coverage)`
                        : ""}
                      .
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground flex gap-1.5 items-start">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              These two groups use different time bases. Capacity and trainees are
              today's headcount; Olympians, top-8 finishes and medals are the whole
              historical record since 1900. They are not stages of one cohort, and
              today's trainees cannot be read as having produced — or failed to produce —
              past results.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* 2. Capacity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {capacityQ.isError ? (
            <ErrorNote what="Capacity" />
          ) : capacityQ.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : cap.centreCount === 0 ? (
            <p className="text-sm text-muted-foreground">
              No centre records capacity for this sport.
            </p>
          ) : (
            <div className="grid sm:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">{n(cap.sanctioned || null)}</p>
                <p className="text-xs text-muted-foreground">Sanctioned</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{n(cap.existing)}</p>
                <p className="text-xs text-muted-foreground">Existing trainees</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cap.utilisation == null ? DASH : `${cap.utilisation}%`}
                </p>
                <p className="text-xs text-muted-foreground">Utilisation</p>
                {cap.utilisation != null && (
                  <Progress value={Math.min(cap.utilisation, 100)} className="h-1.5 mt-1" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {n(cap.existingGirls)}
                  {cap.girlsShare != null && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      ({cap.girlsShare}%)
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Girls in training{" "}
                  {cap.sanctionedGirls > 0 ? `· ${n(cap.sanctionedGirls)} sanctioned` : ""}
                </p>
              </div>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-3">
            {cap.centreCount} centres record capacity for {sportName}. Where sanctioned
            capacity is not recorded it shows as an em-dash, never as 0% utilisation.
          </p>
        </CardContent>
      </Card>

      {/* 3. Centres by type and state */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Centres by type and state
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {statesQ.isError ? (
            <ErrorNote what="State footprint" />
          ) : statesQ.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !stateSummary ? (
            <p className="text-sm text-muted-foreground">No linked centres.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                {[
                  ["Linked centres", stateSummary.centres],
                  ["States", stateSummary.statesLinked],
                  ["NCOE", (statesQ.data ?? []).reduce((a, r) => a + (r.ncoe || 0), 0)],
                  ["STC", (statesQ.data ?? []).reduce((a, r) => a + (r.stc || 0), 0)],
                  ["KIC", (statesQ.data ?? []).reduce((a, r) => a + (r.kic || 0), 0)],
                  ["KISCE", (statesQ.data ?? []).reduce((a, r) => a + (r.kisce || 0), 0)],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-md border p-3">
                    <p className="text-xl font-bold">{n(value as number)}</p>
                    <p className="text-xs text-muted-foreground">{label as string}</p>
                  </div>
                ))}
              </div>

              <div className="max-h-80 overflow-y-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Centres</TableHead>
                      <TableHead className="text-right">Mapped</TableHead>
                      <TableHead className="text-right">Sanctioned</TableHead>
                      <TableHead className="text-right">Trainees</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(statesQ.data ?? [])
                      .slice()
                      .sort((a, b) => (b.centres || 0) - (a.centres || 0))
                      .map((r) => (
                        <TableRow key={r.state}>
                          <TableCell className="font-medium">{r.state}</TableCell>
                          <TableCell className="text-right">{n(r.centres)}</TableCell>
                          <TableCell className="text-right">{n(r.centres_mappable)}</TableCell>
                          <TableCell className="text-right">
                            {r.sanctioned ? n(r.sanctioned) : DASH}
                          </TableCell>
                          <TableCell className="text-right">
                            {r.existing ? n(r.existing) : DASH}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {centres.length > 0 && (
                <div className="max-h-80 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Centre</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead className="text-right">Trainees / Sanctioned</TableHead>
                        <TableHead className="text-right">Map</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {centres
                        .slice()
                        .sort((a, b) => (b.existing || 0) - (a.existing || 0))
                        .map((c) => (
                          <TableRow key={c.centre_id}>
                            <TableCell className="font-medium">
                              {c.centre_name}
                              {c.has_para && (
                                <Badge variant="outline" className="ml-2 text-[10px] h-4">
                                  Para
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{c.centre_type ?? DASH}</TableCell>
                            <TableCell>{c.state ?? DASH}</TableCell>
                            <TableCell className="text-right">
                              {n(c.existing)} / {c.sanctioned ? n(c.sanctioned) : DASH}
                            </TableCell>
                            <TableCell className="text-right">
                              {c.is_mappable && mapAvailable ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2"
                                  onClick={onOpenMap}
                                >
                                  <MapPin className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Not mapped
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 4. Projects */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <HardHat className="h-4 w-4" /> Infrastructure projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {projectsQ.isError ? (
            <ErrorNote what="Projects" />
          ) : projectsQ.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : projectStats.total === 0 ? (
            <p className="text-sm text-muted-foreground">
              No infrastructure project is linked to a centre hosting this sport.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-sm">
                  {projectStats.total} linked projects
                </Badge>
                {projectStats.byStatus.map(([status, count]) => (
                  <Badge key={status} variant="outline" className={`text-sm ${statusTone(status)}`}>
                    {status}: {count}
                  </Badge>
                ))}
              </div>

              <div
                className="h-56"
                role="img"
                aria-label={`Bar chart of ${projectStats.total} infrastructure projects by type: ${projectStats.byType
                  .map((t) => `${t.type} ${t.count}`)
                  .join(", ")}`}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectStats.byType.slice(0, 10)} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={11} />
                    <YAxis type="category" dataKey="type" width={140} fontSize={11} />
                    <RTooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {projectStats.inProgress.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> In progress — least advanced first
                  </p>
                  <div className="rounded-md border divide-y max-h-72 overflow-y-auto">
                    {projectStats.inProgress.map((p) => (
                      <div key={p.project_code} className="p-2.5 flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.project_name ?? p.project_code}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.state ?? DASH}
                            {p.parent_facility_name ? ` · ${p.parent_facility_name}` : ""}
                            {p.infra_type ? ` · ${p.infra_type}` : ""}
                          </p>
                        </div>
                        <div className="w-32 flex-shrink-0 text-right">
                          <span className="text-xs text-muted-foreground">
                            {p.progress == null ? DASH : `${p.progress}%`}
                          </span>
                          {p.progress != null && (
                            <Progress value={p.progress} className="h-1.5 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <p className="text-[11px] text-muted-foreground flex gap-1.5 items-start">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>
              Projects link to a <em>centre</em> that hosts {sportName}, so one project may
              serve several sports. This is not sport-specific spend.
            </span>
          </p>
        </CardContent>
      </Card>

      {/* 5. KISCE funds — omitted entirely when empty */}
      {!fundsQ.isError && funds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4" /> KISCE fund releases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">{funds.length} releases</Badge>
              <Badge variant="outline">
                {formatINR(funds.reduce((a, f) => a + (Number(f.funds_released) || 0), 0))} total
              </Badge>
              <Badge variant="outline">
                {funds.filter((f) => f.uc_pending).length} with UC pending
              </Badge>
            </div>
            <div className="rounded-md border max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>FY</TableHead>
                    <TableHead>Centre</TableHead>
                    <TableHead>Head</TableHead>
                    <TableHead className="text-right">Released</TableHead>
                    <TableHead>UC status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funds
                    .slice()
                    .sort((a, b) => (b.financial_year ?? "").localeCompare(a.financial_year ?? ""))
                    .map((f) => (
                      <TableRow key={f.fund_id}>
                        <TableCell>{f.financial_year ?? DASH}</TableCell>
                        <TableCell className="font-medium">
                          {f.centre_name ?? DASH}
                          {f.state ? (
                            <span className="text-xs text-muted-foreground"> · {f.state}</span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-xs">{f.head ?? DASH}</TableCell>
                        <TableCell className="text-right">
                          {f.funds_released == null ? DASH : formatINR(Number(f.funds_released))}
                        </TableCell>
                        <TableCell>
                          {f.uc_pending ? (
                            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/40">
                              UC pending
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {f.uc_status ?? DASH}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PipelineTab;
