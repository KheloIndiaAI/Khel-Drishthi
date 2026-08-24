import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, Crown, Info, LineChart, Timer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  eventKey,
  parseEventKey,
  parseEraWinners,
  parseTrail,
  useDisciplineAge,
  useEventBoard,
  useEventDominance,
  useEventRisers,
  useSportDisciplines,
  type EventBoardRow,
} from "@/hooks/useEventExplorer";


const DASH = "—";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const num = (v: number | null | undefined, digits = 0) =>
  isNum(v) ? v.toLocaleString("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : DASH;

const OPENNESS_TOOLTIP =
  "Openness is the Herfindahl index of medal concentration. Bands are the observed quartiles of live Summer events (p25 0.090, p75 0.197 across 367 events).";
const TIER_TOOLTIP =
  "Holding = has medalled in the last three Games. Slipping = has medalled but the trend is declining. Nearly = finished 4th–6th. Contending = finished 7th–8th. Developing = everything else.";

const PanelError = () => (
  <p className="text-sm text-muted-foreground">Could not load this panel.</p>
);

const TrendBadge = ({ trend }: { trend: string | null }) => {
  if (!trend) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    improving: { label: "Improving", cls: "border-transparent bg-india-green text-white" },
    declining: { label: "Declining", cls: "border-transparent bg-destructive text-destructive-foreground" },
    volatile: { label: "Volatile", cls: "border-transparent bg-saffron text-on-saffron" },
    steady: { label: "Steady", cls: "" },
    single_games: { label: "One Games only", cls: "" },
  };
  const cfg = map[trend] || { label: trend, cls: "" };
  return (
    <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs", cfg.cls)}>
      {cfg.label}
    </Badge>
  );
};

const OpennessBadge = ({ band }: { band: string | null }) => {
  if (!band) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Open", cls: "border-transparent bg-india-green text-white" },
    moderate: { label: "Moderate", cls: "" },
    concentrated: { label: "Concentrated", cls: "border-transparent bg-saffron text-on-saffron" },
  };
  const cfg = map[band] || { label: band, cls: "" };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs cursor-help", cfg.cls)}>
            {cfg.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{OPENNESS_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const TIER_ORDER = ["slipping", "nearly", "contending", "holding", "developing"];
const TierBadge = ({ tier }: { tier: string | null }) => {
  if (!tier) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    slipping: { label: "Slipping", cls: "border-transparent bg-destructive text-destructive-foreground" },
    nearly: { label: "Nearly", cls: "border-transparent bg-saffron text-on-saffron" },
    contending: { label: "Contending", cls: "border-transparent bg-primary text-primary-foreground" },
    holding: { label: "Holding", cls: "border-transparent bg-india-green text-white" },
    developing: { label: "Developing", cls: "" },
  };
  const cfg = map[tier] || { label: tier, cls: "" };
  return (
    <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs", cfg.cls)}>
      {cfg.label}
    </Badge>
  );
};

const TrailSteps = ({ trail }: { trail: string | null }) => {
  const steps = parseTrail(trail);
  if (steps.length === 0) return <span className="text-muted-foreground">{DASH}</span>;
  const best = Math.min(...steps.map((s) => s.place));
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="img" aria-label={`Finishing places: ${steps.map((s) => `${s.year} place ${s.place}`).join(", ")}`}>
      {steps.map((s, i) => (
        <span key={s.year} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-xs tabular-nums",
              s.place === best ? "border-transparent bg-india-green text-white" : "text-muted-foreground"
            )}
          >
            <span className="opacity-80">{s.year}</span> · {s.place}
          </span>
        </span>
      ))}
    </div>
  );
};

interface Props {
  sportId?: string;
  sportName?: string;
}

export const EventExplorerTab = ({ sportId, sportName }: Props) => {
  const discQ = useSportDisciplines(sportId);
  const disciplines = useMemo(
    () => (discQ.data || []).map((d) => d.canonical_discipline).filter((d): d is string => !!d),
    [discQ.data]
  );

  const dominanceQ = useEventDominance(disciplines);
  const boardQ = useEventBoard(sportId);
  const ageQ = useDisciplineAge(disciplines);

  const [selected, setSelected] = useState<string | null>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const boardRows = useMemo(() => boardQ.data || [], [boardQ.data]);
  const dominanceRows = useMemo(() => dominanceQ.data || [], [dominanceQ.data]);

  const boardByEvent = useMemo(() => {
    const m = new Map<string, EventBoardRow>();
    boardRows.forEach(
      (r) => r.canonical_event && m.set(eventKey(r.canonical_discipline, r.canonical_event), r)
    );
    return m;
  }, [boardRows]);

  const multiDiscipline = disciplines.length > 1;

  const eventOptions = useMemo(() => {
    const rows = dominanceRows.filter((r) => !!r.canonical_event);
    const has = (r: typeof rows[number]) => boardByEvent.has(eventKey(r.canonical_discipline, r.canonical_event));
    const contested = rows.filter(has);
    const rest = rows.filter((r) => !has(r));
    const byName = (a: typeof rows[number], b: typeof rows[number]) =>
      (a.canonical_event || "").localeCompare(b.canonical_event || "") ||
      (a.canonical_discipline || "").localeCompare(b.canonical_discipline || "");
    return [...contested.sort(byName), ...rest.sort(byName)];
  }, [dominanceRows, boardByEvent]);

  // Default selection.
  useEffect(() => {
    if (selected || eventOptions.length === 0) return;
    const withPlace = boardRows.filter((r) => isNum(r.best_place_recent) && r.canonical_event);
    if (withPlace.length > 0) {
      const best = withPlace.reduce((a, b) => (b.best_place_recent! < a.best_place_recent! ? b : a));
      setSelected(eventKey(best.canonical_discipline, best.canonical_event));
      return;
    }
    const byRecency = [...eventOptions].sort((a, b) => (b.last_year || 0) - (a.last_year || 0));
    const first = byRecency[0];
    setSelected(first ? eventKey(first.canonical_discipline, first.canonical_event) : null);
  }, [selected, eventOptions, boardRows]);

  const { discipline: selectedDiscipline, event: selectedEvent } = useMemo(
    () => parseEventKey(selected),
    [selected]
  );

  const risersQ = useEventRisers(selectedDiscipline || null, selectedEvent || null);

  const dom = useMemo(
    () =>
      dominanceRows.find(
        (r) => r.canonical_discipline === selectedDiscipline && r.canonical_event === selectedEvent
      ),
    [dominanceRows, selectedDiscipline, selectedEvent]
  );
  const board = selected ? boardByEvent.get(selected) : undefined;

  /* ---------- age panel state ---------- */
  const allAgeRows = useMemo(() => ageQ.data || [], [ageQ.data]);
  const ageRows = useMemo(
    () =>
      selectedDiscipline
        ? allAgeRows.filter((r) => r.canonical_discipline === selectedDiscipline)
        : allAgeRows,
    [allAgeRows, selectedDiscipline]
  );
  const eras = useMemo(() => ageRows.map((r) => r.era).filter((e): e is string => !!e), [ageRows]);
  const [era, setEra] = useState<string | null>(null);
  useEffect(() => {
    if (eras.length === 0) return;
    if (era && eras.includes(era)) return;
    setEra(eras.includes("last3") ? "last3" : eras.includes("2000-2024") ? "2000-2024" : eras[0]);
  }, [era, eras]);
  const ageRow = ageRows.find((r) => r.era === era);


  if (discQ.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (discQ.isError) {
    return (
      <Card>
        <CardContent className="py-6">
          <PanelError />
        </CardContent>
      </Card>
    );
  }

  if (disciplines.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            This sport has no mapped Olympic discipline, so event-level analysis is not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* ---------- opportunity board rows ---------- */
  const boardSorted = [...boardRows].sort((a, b) => {
    const ta = TIER_ORDER.indexOf(a.board_tier || "");
    const tb = TIER_ORDER.indexOf(b.board_tier || "");
    const ra = ta === -1 ? TIER_ORDER.length : ta;
    const rb = tb === -1 ? TIER_ORDER.length : tb;
    if (ra !== rb) return ra - rb;
    const pa = isNum(a.best_place_recent) ? a.best_place_recent : Number.MAX_SAFE_INTEGER;
    const pb = isNum(b.best_place_recent) ? b.best_place_recent : Number.MAX_SAFE_INTEGER;
    return pa - pb;
  });

  /* ---------- momentum ---------- */
  const risers = (risersQ.data || []).filter((r) => !!r.country_noc);
  const rankedRisers = [...risers].sort(
    (a, b) => (b.topdecile_gain ?? -Infinity) - (a.topdecile_gain ?? -Infinity)
  );
  const topRisers = rankedRisers.slice(0, 8);
  const indiaRiser = rankedRisers.find((r) => r.country_noc === "IND");
  const indiaOutside = indiaRiser && !topRisers.includes(indiaRiser);

  const ageOk =
    !!ageRow && isNum(ageRow.medallists_n) && isNum(ageRow.medal_age_p10) && isNum(ageRow.medal_age_p50) && isNum(ageRow.medal_age_p90);
  const indiaAgeOk = !!ageRow && isNum(ageRow.india_entrants_n) && ageRow.india_entrants_n >= 8 && isNum(ageRow.india_age_p50);
  const axisMin = ageOk ? Math.min(ageRow!.medal_age_p10!, indiaAgeOk ? ageRow!.india_age_p50! : ageRow!.medal_age_p10!) - 2 : 0;
  const axisMax = ageOk ? Math.max(ageRow!.medal_age_p90!, indiaAgeOk ? ageRow!.india_age_p50! : ageRow!.medal_age_p90!) + 2 : 1;
  const pos = (v: number) => ((v - axisMin) / Math.max(axisMax - axisMin, 0.0001)) * 100;

  const eraChips = parseEraWinners(dom?.era_winners);

  return (
    <div className="space-y-6">
      {/* Picker */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LineChart className="h-4 w-4 text-saffron" aria-hidden="true" />
            Event Explorer{sportName ? ` — ${sportName}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dominanceQ.isLoading ? (
            <Skeleton className="h-10 w-full max-w-md" />
          ) : dominanceQ.isError ? (
            <PanelError />
          ) : eventOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No Olympic events found for this discipline.</p>
          ) : (
            <Select value={selected || undefined} onValueChange={setSelected}>
              <SelectTrigger className="w-full max-w-xl">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {eventOptions.map((e) => {
                  const k = eventKey(e.canonical_discipline, e.canonical_event);
                  return (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2">
                        <span>{e.canonical_event}</span>
                        {multiDiscipline && e.canonical_discipline && (
                          <span className="text-muted-foreground">· {e.canonical_discipline}</span>
                        )}
                        {boardByEvent.has(k) && (
                          <Badge variant="secondary" className="text-[10px]">India contests</Badge>
                        )}
                      </span>
                    </SelectItem>
                  );
                })}

              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Panels */}
      <div ref={panelsRef} className="grid gap-4 lg:grid-cols-2 items-start">
        <div className="space-y-4">
          {/* Panel 1 — Dominance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4 w-4 text-saffron" aria-hidden="true" /> Dominance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {dominanceQ.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : dominanceQ.isError ? (
                <PanelError />
              ) : !dom ? (
                <p className="text-muted-foreground">No dominance data for this event.</p>
              ) : (
                <>
                  <p>
                    <span className="font-semibold tabular-nums">{num(dom.editions)}</span> editions
                    {isNum(dom.first_year) && isNum(dom.last_year) ? ` · ${dom.first_year}–${dom.last_year}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">{num(dom.medalist_nations)}</span> nations have ever medalled
                  </p>
                  <div className="rounded-lg border p-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">All-time leader</p>
                    <p>
                      <span className="font-semibold">{dom.alltime_leader_noc || DASH}</span>
                      {" · "}
                      {num(dom.alltime_leader_medals)} medals
                      {isNum(dom.alltime_leader_share_pct) ? ` · ${num(dom.alltime_leader_share_pct, 1)}% share` : ""}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 space-y-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last three Games leader</p>
                    <p>
                      <span className="font-semibold">{dom.last3_leader_noc || DASH}</span>
                      {isNum(dom.last3_leader_medals) ? ` · ${num(dom.last3_leader_medals)} medals` : ""}
                      {isNum(dom.last3_leader_golds) ? ` · ${num(dom.last3_leader_golds)} gold` : ""}
                    </p>
                  </div>
                  {isNum(dom.gold_streak_len) && dom.gold_streak_len > 1 && dom.gold_streak_noc && (
                    <p className="text-muted-foreground">
                      Longest gold streak:{" "}
                      <span className="text-foreground font-medium">
                        {dom.gold_streak_noc}, {dom.gold_streak_len} straight golds
                        {isNum(dom.gold_streak_from) && isNum(dom.gold_streak_to)
                          ? `, ${dom.gold_streak_from}–${dom.gold_streak_to}`
                          : ""}
                      </span>
                    </p>
                  )}
                  {eraChips.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Decade winners</p>
                      <div className="flex flex-wrap gap-2">
                        {eraChips.map((c) => (
                          <div
                            key={c.decade}
                            className={cn(
                              "rounded-md border px-2 py-1 text-center",
                              c.noc === "IND" && "border-transparent bg-india-green text-white"
                            )}
                          >
                            <div className={cn("text-[10px]", c.noc === "IND" ? "text-white/80" : "text-muted-foreground")}>
                              {c.decade}
                            </div>
                            <div className="text-xs font-semibold">{c.noc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Panel 3 — Momentum */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-saffron" aria-hidden="true" /> Momentum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {risersQ.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : risersQ.isError ? (
                <PanelError />
              ) : topRisers.length === 0 ? (
                <p className="text-muted-foreground">No momentum data for this event.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {topRisers.map((r) => (
                      <div
                        key={r.country_noc!}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs",
                          r.country_noc === "IND" && "border-transparent bg-saffron text-on-saffron"
                        )}
                      >
                        <span className="font-semibold">{r.country_noc}</span>{" "}
                        <span className="tabular-nums">
                          {isNum(r.topdecile_gain) ? (r.topdecile_gain > 0 ? `+${num(r.topdecile_gain)}` : num(r.topdecile_gain)) : DASH}
                        </span>
                      </div>
                    ))}
                  </div>
                  {indiaOutside && indiaRiser && (
                    <div className="border-t pt-2">
                      <div className="inline-block rounded-md border-transparent bg-saffron text-on-saffron px-2 py-1 text-xs">
                        <span className="font-semibold">IND</span>{" "}
                        <span className="tabular-nums">
                          {isNum(indiaRiser.topdecile_gain)
                            ? indiaRiser.topdecile_gain > 0
                              ? `+${num(indiaRiser.topdecile_gain)}`
                              : num(indiaRiser.topdecile_gain)
                            : DASH}
                        </span>
                      </div>
                      <span className="ml-2 text-xs text-muted-foreground">outside the top 8</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Top-decile is depth-normalised — it adjusts for how much the field grew. Raw top-8 counts can rise
                    simply because more athletes entered.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Panel 2 — India's line */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-saffron" aria-hidden="true" /> India&apos;s line
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {boardQ.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : boardQ.isError ? (
                <PanelError />
              ) : !board ? (
                <p className="text-muted-foreground">India has not contested this event in the last three Games.</p>
              ) : (
                <>
                  <TrailSteps trail={board.trail} />
                  <div className="flex flex-wrap items-center gap-2">
                    <TrendBadge trend={board.trend} />
                    <OpennessBadge band={board.openness_band} />
                    <TierBadge tier={board.board_tier} />
                  </div>
                  <p className="text-muted-foreground">
                    Best recent finish:{" "}
                    <span className="text-foreground font-medium tabular-nums">
                      {isNum(board.best_place_recent) ? board.best_place_recent : DASH}
                    </span>
                    {isNum(board.best_year) ? ` in ${board.best_year}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {board.distance_to_podium === 0
                      ? "Has medalled here recently"
                      : isNum(board.distance_to_podium)
                      ? `${board.distance_to_podium} places from a medal`
                      : `Distance to a medal ${DASH}`}
                  </p>
                  <p className="text-muted-foreground">
                    Games contested (recent):{" "}
                    <span className="text-foreground tabular-nums">{num(board.games_contested_recent)}</span>
                    {isNum(board.games_held_recent) ? ` of ${board.games_held_recent}` : ""}
                    {" · "}Nations medalling: <span className="text-foreground tabular-nums">{num(board.nations_medalling_recent)}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Panel 4 — Age window */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4 text-saffron" aria-hidden="true" /> Age window
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ageQ.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : ageQ.isError ? (
                <PanelError />
              ) : ageRows.length === 0 ? (
                <p className="text-muted-foreground">
                  Not enough medallists in this discipline to publish an age curve.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Age figures are for the whole {selectedDiscipline || "discipline"} discipline, not this single
                    event.
                  </p>

                  {eras.length > 1 && (
                    <Select value={era || undefined} onValueChange={setEra}>
                      <SelectTrigger className="w-48 h-8 text-xs">
                        <SelectValue placeholder="Era" />
                      </SelectTrigger>
                      <SelectContent>
                        {eras.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e === "last3" ? "Last three Games" : e === "all" ? "All time" : e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {!ageOk ? (
                    <p className="text-muted-foreground">
                      Not enough medallists in this discipline to publish an age curve.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div
                        className="relative h-10"
                        role="img"
                        aria-label={`Medallist age window from ${ageRow!.medal_age_p10} to ${ageRow!.medal_age_p90}, median ${ageRow!.medal_age_p50}${
                          indiaAgeOk ? `, India median ${ageRow!.india_age_p50}` : ""
                        }`}
                      >
                        <div className="absolute top-4 h-2 w-full rounded-full bg-muted" />
                        <div
                          className="absolute top-4 h-2 rounded-full bg-india-green/40"
                          style={{
                            left: `${pos(ageRow!.medal_age_p10!)}%`,
                            width: `${pos(ageRow!.medal_age_p90!) - pos(ageRow!.medal_age_p10!)}%`,
                          }}
                        />
                        <div
                          className="absolute top-2 h-6 w-0.5 bg-india-green"
                          style={{ left: `${pos(ageRow!.medal_age_p50!)}%` }}
                        />
                        {indiaAgeOk && (
                          <div
                            className="absolute top-1 h-8 w-1 rounded bg-saffron"
                            style={{ left: `${pos(ageRow!.india_age_p50!)}%` }}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>p10 {num(ageRow!.medal_age_p10, 1)}</span>
                        <span className="text-india-green font-medium">Medallist median {num(ageRow!.medal_age_p50, 1)}</span>
                        <span>p90 {num(ageRow!.medal_age_p90, 1)}</span>
                        {indiaAgeOk && (
                          <span className="text-saffron font-medium">India median {num(ageRow!.india_age_p50, 1)}</span>
                        )}
                      </div>
                      {!indiaAgeOk ? (
                        <p className="text-muted-foreground">Too few Indian entrants to publish a comparison.</p>
                      ) : isNum(ageRow!.age_gap_yrs) ? (
                        <p>
                          India&apos;s entrants are{" "}
                          <span className="font-semibold">
                            {num(Math.abs(ageRow!.age_gap_yrs!), 1)} years{" "}
                            {ageRow!.age_gap_yrs! < 0 ? "younger" : "older"}
                          </span>{" "}
                          than the typical medallist
                        </p>
                      ) : null}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Born around this year to peak for LA 2028</p>
                      <p className="text-xl font-bold tabular-nums">
                        {isNum(ageRow?.birth_cohort_for_2028) ? ageRow!.birth_cohort_for_2028 : DASH}
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">…for 2036</p>
                      <p className="text-xl font-bold tabular-nums">
                        {isNum(ageRow?.birth_cohort_for_2036) ? ageRow!.birth_cohort_for_2036 : DASH}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Opportunity board */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full text-left">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-base">Opportunity board</CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {boardQ.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : boardQ.isError ? (
                <PanelError />
              ) : boardSorted.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  India has not contested any event in this sport in the last three Games.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                Tier <Info className="h-3 w-3" aria-hidden="true" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-xs">{TIER_TOOLTIP}</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead>Best place</TableHead>
                        <TableHead>Trail</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Openness</TableHead>
                        <TableHead className="text-right">Nations medalling</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {boardSorted.map((r) => (
                        <TableRow
                          key={r.canonical_event!}
                          className="cursor-pointer"
                          onClick={() => {
                            setSelected(r.canonical_event!);
                            panelsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                        >
                          <TableCell className="whitespace-nowrap">{r.canonical_event}</TableCell>
                          <TableCell><TierBadge tier={r.board_tier} /></TableCell>
                          <TableCell className="whitespace-nowrap tabular-nums">
                            {isNum(r.best_place_recent) ? r.best_place_recent : DASH}
                            {isNum(r.best_year) ? ` (${r.best_year})` : ""}
                          </TableCell>
                          <TableCell><TrailSteps trail={r.trail} /></TableCell>
                          <TableCell><TrendBadge trend={r.trend} /></TableCell>
                          <TableCell><OpennessBadge band={r.openness_band} /></TableCell>
                          <TableCell className="text-right tabular-nums">{num(r.nations_medalling_recent)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default EventExplorerTab;
