import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageSEO from "@/components/seo/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Target, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DASH,
  TIER_ORDER,
  TIER_LABELS,
  TrendBadge,
  OpennessBadge,
  TierBadge,
  TrailSteps,
} from "@/components/sport/boardBadges";
import { useOpportunityBoard, type OpportunityRow } from "@/hooks/useOpportunityBoard";

const num = (v: number | null | undefined) =>
  typeof v === "number" && Number.isFinite(v) ? v.toLocaleString("en-IN") : DASH;

type SortKey = "best_place_recent" | "nations_medalling_recent" | "games_contested_recent" | null;

const tierRank = (t: string | null) => {
  const i = TIER_ORDER.indexOf(t || "");
  return i === -1 ? TIER_ORDER.length : i;
};

const Opportunities = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOpportunityBoard();

  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sport, setSport] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows = useMemo(() => data ?? [], [data]);

  const tierCounts = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const t = r.board_tier || "";
      m.set(t, (m.get(t) ?? 0) + 1);
    });
    return m;
  }, [rows]);

  const sportOptions = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => s.add(r.sportLabel));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const headline = useMemo(
    () =>
      rows
        .filter((r) => r.board_tier === "nearly" && r.openness_band === "open")
        .sort((a, b) => (a.best_place_recent ?? 99) - (b.best_place_recent ?? 99)),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (tierFilter && r.board_tier !== tierFilter) return false;
      if (sport !== "all" && r.sportLabel !== sport) return false;
      if (q) {
        const hay = `${r.canonical_event ?? ""} ${r.sportLabel} ${r.canonical_discipline ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...out];
    if (sortKey) {
      sorted.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const an = typeof av === "number" && Number.isFinite(av) ? av : Number.POSITIVE_INFINITY;
        const bn = typeof bv === "number" && Number.isFinite(bv) ? bv : Number.POSITIVE_INFINITY;
        if (an === bn) return (a.canonical_event ?? "").localeCompare(b.canonical_event ?? "");
        return sortDir === "asc" ? an - bn : bn - an;
      });
    } else {
      sorted.sort((a, b) => {
        const t = tierRank(a.board_tier) - tierRank(b.board_tier);
        if (t !== 0) return t;
        return (a.best_place_recent ?? 999) - (b.best_place_recent ?? 999);
      });
    }
    return sorted;
  }, [rows, tierFilter, sport, text, sortKey, sortDir]);

  const toggleSort = (key: Exclude<SortKey, null>) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortHead = ({ label, k, className }: { label: string; k: Exclude<SortKey, null>; className?: string }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label={`Sort by ${label}`}
      >
        {label}
        {sortKey === k ? (
          sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <span className="text-muted-foreground/40 text-xs">↕</span>
        )}
      </button>
    </TableHead>
  );

  const openSport = (r: OpportunityRow) => {
    if (r.kd_sport_id) navigate(`/sport/${r.kd_sport_id}`);
  };

  return (
    <DashboardLayout>
      <PageSEO
        title="Opportunity Board — where India's next medals are | Khel Drishti"
        description="Every Olympic event India has contested in the last three Games, ranked by how close a medal is and how open the field is."
        canonicalPath="/opportunities"
      />

      <div className="space-y-6">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron">
              <Target className="h-5 w-5 text-on-saffron" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl tracking-wide">Opportunity Board</h1>
              <p className="text-sm text-muted-foreground">
                Every event India has contested in the last three Games, ranked by how close a medal is and how open the field is.
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-4xl">
            This board ranks opportunity, not probability. It says where India is already close and where no single
            nation controls the podium — it does not model who will win. Openness bands are the observed quartiles of
            live Summer events. Tiers are a stated rule, not a score.
          </p>
        </header>

        {isError && (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">Could not load the opportunity board.</p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Tier tiles */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {TIER_ORDER.map((t) => {
                const active = tierFilter === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(active ? null : t)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors hover:bg-muted/50",
                      active && "border-primary bg-primary/5"
                    )}
                  >
                    <p className="text-2xl font-semibold tabular-nums">{tierCounts.get(t) ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">{TIER_LABELS[t]}</p>
                  </button>
                );
              })}
            </div>

            {/* Headline callout */}
            <Card className="border-saffron/40">
              <CardHeader>
                <CardTitle className="text-lg">Closest to a medal in the most open fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {headline.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events currently sit in this combination.</p>
                ) : (
                  <ul className="space-y-3">
                    {headline.map((r) => (
                      <li
                        key={r.rowKey}
                        className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.canonical_event ?? DASH}</p>
                          <p className="text-xs text-muted-foreground">{r.sportLabel}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <TrailSteps trail={r.trail} />
                          <TrendBadge trend={r.trend} />
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {num(r.nations_medalling_recent)} nations medalling
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  Fourth to sixth place, in events where no single nation controls the podium.
                </p>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Filter by event, sport or discipline"
                className="md:max-w-sm"
                aria-label="Filter events"
              />
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="md:w-64" aria-label="Filter by sport">
                  <SelectValue placeholder="All sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sports</SelectItem>
                  {sportOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                {filtered.length} of {rows.length} events
              </span>
            </div>

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Event</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead>Tier</TableHead>
                        <SortHead label="Best place" k="best_place_recent" />
                        <TableHead className="min-w-[180px]">Trail</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Openness</TableHead>
                        <SortHead label="Nations medalling" k="nations_medalling_recent" />
                        <SortHead label="Games contested" k="games_contested_recent" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((r) => {
                        const clickable = !!r.kd_sport_id;
                        return (
                          <TableRow
                            key={r.rowKey}
                            onClick={() => openSport(r)}
                            tabIndex={clickable ? 0 : undefined}
                            onKeyDown={(e) => {
                              if (clickable && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                openSport(r);
                              }
                            }}
                            className={cn(clickable && "cursor-pointer")}
                          >
                            <TableCell className="font-medium">{r.canonical_event ?? DASH}</TableCell>
                            <TableCell className="text-muted-foreground">{r.sportLabel}</TableCell>
                            <TableCell><TierBadge tier={r.board_tier} /></TableCell>
                            <TableCell className="tabular-nums">
                              {typeof r.best_place_recent === "number" ? (
                                <>
                                  {r.best_place_recent}
                                  {r.best_year ? (
                                    <span className="text-muted-foreground text-xs"> ({r.best_year})</span>
                                  ) : null}
                                </>
                              ) : (
                                <span className="text-muted-foreground">{DASH}</span>
                              )}
                            </TableCell>
                            <TableCell><TrailSteps trail={r.trail} /></TableCell>
                            <TableCell><TrendBadge trend={r.trend} /></TableCell>
                            <TableCell><OpennessBadge band={r.openness_band} /></TableCell>
                            <TableCell className="tabular-nums">{num(r.nations_medalling_recent)}</TableCell>
                            <TableCell className="tabular-nums">{num(r.games_contested_recent)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* How to read this */}
            <Collapsible>
              <Card>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                  <span className="font-medium">How to read this</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 text-sm text-muted-foreground space-y-2">
                    <p>Holding — India has medalled in this event in the last three Games.</p>
                    <p>Slipping — India has medalled recently, but the trend is declining.</p>
                    <p>Nearly — India's best recent finish was 4th to 6th.</p>
                    <p>Contending — India's best recent finish was 7th or 8th.</p>
                    <p>Developing — everything else.</p>
                    <p>
                      Openness — the Herfindahl index of medal concentration across all editions. Open, moderate and
                      concentrated are the observed quartiles of live Summer events (p25 0.090, p75 0.197 across 367
                      events).
                    </p>
                    <p>
                      Trend — computed from India's placing across the last three Games it contested: improving,
                      declining, volatile, steady, or one Games only.
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Opportunities;
