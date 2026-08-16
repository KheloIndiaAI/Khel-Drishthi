import { useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Info,
  Medal,
  Search,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { SportPipelineRow } from "@/hooks/useSportPipeline";
import {
  MIN_SEARCH_LENGTH,
  PLACE_FOOTNOTE,
  ROSTER_PAGE_SIZE,
  useDebounced,
  useIndiaMedalists,
  useIndiaNearMiss,
  useIndiaOlympiansPage,
  useIndiaSportTimeline,
  useMostCapped,
  useSportBiometrics,
  type BiometricRow,
  type RosterSort,
} from "@/hooks/useIndiaSportRecord";

/** Compact number: 172 → "172", 166.5 → "166.5" */
const num = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

const DASH = "—";

/**
 * India's national top-8 → medal conversion rate: 41 Summer medals ÷ 132 top-8
 * finishes (both event grain, from oly_medal_tally and the corrected place parsing).
 */
export const NATIONAL_CONVERSION_PCT = 31.1;

const Footnote = () => (
  <p className="text-[11px] text-muted-foreground mt-3 flex gap-1.5 items-start">
    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
    <span>{PLACE_FOOTNOTE}</span>
  </p>
);

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const placeLabel = (p: number | null | undefined) => (p == null ? DASH : ordinal(p));


const MedalChips = ({
  gold,
  silver,
  bronze,
}: {
  gold?: number | null;
  silver?: number | null;
  bronze?: number | null;
}) => {
  const g = gold ?? 0;
  const s = silver ?? 0;
  const b = bronze ?? 0;
  if (g + s + b === 0) return <span className="text-muted-foreground">{DASH}</span>;
  return (
    <span className="flex gap-1">
      {g > 0 && <Badge className="medal-gold px-1.5 py-0 text-[11px]">{g}G</Badge>}
      {s > 0 && <Badge className="medal-silver px-1.5 py-0 text-[11px]">{s}S</Badge>}
      {b > 0 && <Badge className="medal-bronze px-1.5 py-0 text-[11px]">{b}B</Badge>}
    </span>
  );
};


/* ------------------------------- roster ---------------------------------- */

const SORT_COLUMNS: { key: RosterSort; label: string; numeric?: boolean }[] = [
  { key: "display_name", label: "Name" },
  { key: "first_year", label: "Games span", numeric: true },
  { key: "appearances", label: "Appearances", numeric: true },
  { key: "best_place", label: "Best finish", numeric: true },
  { key: "medals", label: "Medals", numeric: true },
];

const RosterTable = ({ sportId }: { sportId: string }) => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [sortKey, setSortKey] = useState<RosterSort>("medals");
  const [ascending, setAscending] = useState(false);
  const search = useDebounced(searchInput);
  const searchActive = search.length >= MIN_SEARCH_LENGTH;

  const { data, isLoading } = useIndiaOlympiansPage(sportId, {
    page,
    search,
    sortKey,
    ascending,
  });

  // The exact count only comes back on page 0 — cache and reuse it while paging.
  const totalRef = useRef(0);
  if (data?.total != null) totalRef.current = data.total;
  const total = totalRef.current;
  const pages = Math.max(1, Math.ceil(total / ROSTER_PAGE_SIZE));

  const toggleSort = (key: RosterSort) => {
    setPage(0);
    if (key === sortKey) {
      setAscending((a) => !a);
    } else {
      setSortKey(key);
      setAscending(key === "display_name" || key === "best_place" || key === "first_year");
    }
  };

  const SortHead = ({ col }: { col: (typeof SORT_COLUMNS)[number] }) => {
    const active = sortKey === col.key;
    const dir = ascending ? "ascending" : "descending";
    return (
      <TableHead
        className={col.numeric ? "text-right" : undefined}
        aria-sort={active ? (dir as "ascending" | "descending") : "none"}
      >
        <button
          type="button"
          onClick={() => toggleSort(col.key)}
          aria-label={`Sort by ${col.label.toLowerCase()}, ${active ? (ascending ? "descending" : "ascending") : "descending"}`}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          {col.label}
          {active && (ascending ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
        </button>
      </TableHead>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Indian Olympians ({total.toLocaleString()})
          </CardTitle>
          <div className="w-full sm:w-64">
            <label htmlFor="roster-search" className="sr-only">
              Search Indian Olympians by name
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="roster-search"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setPage(0);
                }}
                placeholder={`Search name (${MIN_SEARCH_LENGTH}+ characters)`}
                className="pl-8 h-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead col={SORT_COLUMNS[0]} />
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Born</TableHead>
                <SortHead col={SORT_COLUMNS[1]} />
                <SortHead col={SORT_COLUMNS[2]} />
                <TableHead className="text-right">Events</TableHead>
                <SortHead col={SORT_COLUMNS[3]} />
                <SortHead col={SORT_COLUMNS[4]} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && (data?.rows.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-6">
                    {searchActive
                      ? "No athlete matches that name."
                      : search.length > 0
                        ? `Type at least ${MIN_SEARCH_LENGTH} characters to search.`
                        : "No Indian Olympian recorded in this sport."}

                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                data?.rows.map((r) => (
                  <TableRow key={r.athlete_id}>
                    <TableCell className="font-medium">{r.display_name || DASH}</TableCell>
                    <TableCell className="text-muted-foreground">{r.gender || DASH}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {r.birth_year ?? DASH}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {r.first_year == null
                        ? DASH
                        : r.first_year === r.last_year
                          ? r.first_year
                          : `${r.first_year}–${r.last_year}`}
                    </TableCell>
                    <TableCell className="text-right">{r.appearances ?? DASH}</TableCell>
                    <TableCell className="text-right">{r.events_contested ?? DASH}</TableCell>
                    <TableCell className="text-right">{placeLabel(r.best_place)}</TableCell>
                    <TableCell className="text-right">
                      <span className="flex justify-end">
                        <MedalChips gold={r.gold} silver={r.silver} bronze={r.bronze} />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {total > ROSTER_PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Page {page + 1} of {pages} · showing {page * ROSTER_PAGE_SIZE + 1}–
              {Math.min((page + 1) * ROSTER_PAGE_SIZE, total)} of {total.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <Footnote />
      </CardContent>
    </Card>
  );
};

/* --------------------------------- tab ----------------------------------- */

interface Props {
  sportId: string;
  sportName: string;
  pipeline: SportPipelineRow | null | undefined;
  pipelineLoading?: boolean;
}

export const OlympicRecordTab = ({ sportId, sportName, pipeline, pipelineLoading }: Props) => {
  const { data: timeline, isLoading: timelineLoading } = useIndiaSportTimeline(sportId);
  const { data: medalists, isLoading: medalistsLoading } = useIndiaMedalists(sportId);
  const { data: nearMiss, isLoading: nearMissLoading } = useIndiaNearMiss(sportId);
  const { data: mostCapped, isLoading: mostCappedLoading } = useMostCapped(sportId);
  const { data: bio, isLoading: bioLoading } = useSportBiometrics(sportId);

  const summary = useMemo(() => {
    const rows = timeline ?? [];
    const sum = (k: keyof (typeof rows)[number]) =>
      rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    return {
      games: rows.length,
      first: rows.length ? rows[0].year : null,
      last: rows.length ? rows[rows.length - 1].year : null,
      // Athlete-entry grain — never mix with the event-grain figures from oly_v_pipeline.
      athleteEntries: sum("entries"),
      eventEntries: sum("events_contested"),
    };
  }, [timeline]);

  /** Display grouping only — never a medal count (two bronzes share an event). */
  const medalGroups = useMemo(() => {
    const map = new Map<
      string,
      { year: number; event: string; medal: string; athletes: string[] }
    >();
    (medalists ?? []).forEach((m) => {
      const key = `${m.year}|${m.canonical_discipline ?? ""}|${m.event ?? ""}|${m.medal_type}`;
      if (!map.has(key)) {
        map.set(key, {
          year: m.year,
          event: m.event || m.canonical_discipline || "Event",
          medal: (m.medal_type || "").toUpperCase(),
          athletes: [],
        });
      }
      if (m.athlete_name) map.get(key)!.athletes.push(m.athlete_name);
    });
    return [...map.values()].sort((a, b) => b.year - a.year);
  }, [medalists]);

  const biometrics = useMemo(() => {
    const rows = (bio ?? []).filter(
      (r) => (r.gender || "").toLowerCase() !== "unknown" && (r.n_height ?? 0) > 0
    );
    if (!rows.length) return null;
    // Sport-wide total — identical on every row for a sport.
    const sportN = Number(rows[0].sport_n_height ?? 0);
    if (sportN < 20) return null;

    const pick = (g: string) =>
      rows.find((r) => (r.gender || "").toLowerCase() === g.toLowerCase()) || null;
    const male = pick("Male");
    const female = pick("Female");
    const big = (r: typeof male) => !!r && (r.n_height ?? 0) >= 5;

    const genders = [
      { label: "Men", d: male },
      { label: "Women", d: female },
    ].filter((x) => big(x.d)) as { label: string; d: BiometricRow }[];

    // If neither gender clears the n>=5 bar, fall back to the sport-level figure.
    const dominant = rows.reduce((a, b) => ((b.n_height ?? 0) > (a.n_height ?? 0) ? b : a));
    const tooSmall = [
      { label: "Women", d: female },
      { label: "Men", d: male },
    ].filter((x) => x.d && !big(x.d)) as { label: string; d: BiometricRow }[];

    return { sportN, genders, dominant, tooSmall };
  }, [bio]);

  const coreLoading = timelineLoading || !!pipelineLoading;
  const hasOlympians = (pipeline?.india_olympians ?? 0) > 0 || (timeline?.length ?? 0) > 0;

  if (coreLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!hasOlympians) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Medal className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No Indian Olympian has ever competed in {sportName}. There is no Olympic record to show
            for this sport.
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = (timeline ?? []).map((r) => ({
    year: String(r.year),
    athletes: r.athletes ?? 0,
    medals: r.medals ?? 0,
    female: r.female_athletes ?? 0,
    male: r.male_athletes ?? 0,
    noPlace: r.entries_without_place ?? 0,
  }));

  const medalYears = chartData.filter((d) => d.medals > 0).map((d) => d.year);
  const timelineAriaLabel = `Indian athletes at each Summer Games in ${sportName}, ${
    summary.first ?? DASH
  } to ${summary.last ?? DASH}. ${medalYears.length} Games with a medal${
    medalYears.length ? `: ${medalYears.join(", ")}` : ""
  }.`;
  const genderAriaLabel = `Men and women among Indian athletes at each Summer Games in ${sportName}.`;

  const top8 = pipeline?.india_top8 ?? null;
  const fourth = pipeline?.india_fourth ?? null;
  const medalTotal = pipeline?.india_medals ?? null;
  const conversionReliable = pipeline?.india_conversion_is_reliable === true;
  const conversion =
    pipeline?.india_conversion == null ? null : Number(pipeline.india_conversion) * 100;
  const coverage = pipeline?.india_place_coverage_pct;


  return (
    <div className="space-y-6">
      {/* 1. Participation timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Participation timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64" role="img" aria-label={timelineAriaLabel}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RTooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v: number, n: string) => [v, n === "athletes" ? "Athletes" : n]}
                  labelFormatter={(l) => {
                    const row = chartData.find((d) => d.year === l);
                    return `${l}${row?.medals ? ` · ${row.medals} medal${row.medals > 1 ? "s" : ""}` : ""}`;
                  }}
                />
                <Bar dataKey="athletes" radius={[3, 3, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell
                      key={d.year}
                      fill={d.medals > 0 ? "hsl(var(--saffron, 33 100% 50%))" : "hsl(var(--primary))"}
                      fillOpacity={d.medals > 0 ? 1 : 0.45}
                      stroke={d.medals > 0 ? "hsl(var(--foreground))" : "none"}
                      strokeWidth={d.medals > 0 ? 1.5 : 0}
                      strokeDasharray={d.medals > 0 ? "3 2" : undefined}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Games where India medalled in {sportName} are highlighted and outlined with a dashed
            border.
          </p>
          <table className="sr-only">
            <caption>Indian athletes and medals at each Summer Games in {sportName}</caption>
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Athletes</th>
                <th scope="col">Medals</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((d) => (
                <tr key={d.year}>
                  <th scope="row">{d.year}</th>
                  <td>{d.athletes}</td>
                  <td>{d.medals}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Footnote />
        </CardContent>
      </Card>

      {/* 2. Summary strip — event-grain figures come from oly_v_pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Olympians all-time", value: (pipeline?.india_olympians ?? DASH).toLocaleString?.() ?? DASH },
          { label: "Games contested", value: summary.games },
          {
            label: "First / last",
            value: summary.first ? `${summary.first}–${summary.last}` : DASH,
          },
          { label: "Event entries", value: summary.eventEntries.toLocaleString() },
          { label: "Top-8 finishes", value: top8 == null ? DASH : top8.toLocaleString() },
          { label: "Fourth places", value: fourth == null ? DASH : fourth.toLocaleString() },
        ].map((t) => (
          <Card key={t.label}>
            <CardContent className="p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="font-display text-2xl leading-tight mt-1">{t.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground -mt-3 flex gap-1.5 items-start">
        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <span>
          Top-8 finishes and fourth places are counted per event, not per athlete.{" "}
          {PLACE_FOOTNOTE}
        </span>
      </p>


      {/* 3. Roster */}
      <RosterTable sportId={sportId} />

      {/* 4. Medalists */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Medalists
            {medalTotal != null && ` (${medalTotal} medal${medalTotal === 1 ? "" : "s"})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medalistsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : medalGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No Olympic medal in {sportName} yet.
            </p>
          ) : (

            <Accordion type="multiple" className="w-full">
              {medalGroups.map((g, i) => (
                <AccordionItem key={`${g.year}-${g.event}-${i}`} value={`${g.year}-${i}`}>
                  <AccordionTrigger className="py-2.5 hover:no-underline">
                    <div className="flex flex-1 items-center gap-3 pr-3 text-left">
                      <span className="font-semibold w-12 flex-shrink-0">{g.year}</span>
                      <Badge
                        className={
                          g.medal === "GOLD"
                            ? "medal-gold"
                            : g.medal === "SILVER"
                              ? "medal-silver"
                              : "medal-bronze"
                        }
                      >
                        {g.medal.charAt(0) + g.medal.slice(1).toLowerCase()}
                      </Badge>
                      <span className="text-sm truncate flex-1">{g.event}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {g.athletes.length} athlete{g.athletes.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {g.athletes.length ? g.athletes.join(", ") : "Roster not recorded"}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* 5. Near-miss board */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Near-miss board
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearMissLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (nearMiss?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No top-8 finish in {summary.games} Games.
            </p>
          ) : (

            <div className="space-y-2">
              {nearMiss!.map((r, i) => {
                const fourth = r.place === 4;
                return (
                  <div
                    key={`${r.year}-${r.event_name}-${i}`}
                    className={`flex items-center gap-3 rounded-md border p-2.5 ${
                      fourth ? "border-primary/50 bg-primary/5" : ""
                    }`}
                  >
                    <span
                      className={`font-display text-lg w-10 text-center flex-shrink-0 ${
                        fourth ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {placeLabel(r.place)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{r.event_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(r.athlete_count ?? 0) > 4
                          ? `${r.athlete_count} athletes`
                          : r.athletes || DASH}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground flex-shrink-0">{r.year}</span>
                  </div>
                );
              })}
            </div>
          )}
          <Footnote />
        </CardContent>
      </Card>

      {/* 6. Conversion funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Conversion funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Event entries", value: summary.eventEntries },
              { label: "Top-8 finishes", value: top8 },
              { label: "Medals", value: medalTotal },
            ].map((s) => (
              <div key={s.label} className="rounded-md border p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="font-display text-2xl mt-1">
                  {s.value == null ? DASH : Number(s.value).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            All three stages are counted per event, not per athlete.
          </p>
          {conversionReliable && conversion != null ? (
            <p className="text-sm mt-4">
              Conversion of top-8 finishes into medals:{" "}
              <span className="font-semibold">{conversion.toFixed(1)}%</span>{" "}
              <span className="text-muted-foreground">
                vs {NATIONAL_CONVERSION_PCT}% national average
                {conversion >= NATIONAL_CONVERSION_PCT ? " — above average" : " — below average"}
              </span>
            </p>
          ) : (
            <p className="text-sm mt-4 text-muted-foreground">
              Not enough recorded finishing places to measure conversion
              {coverage == null ? "" : ` (${Number(coverage).toFixed(1)}% of entries have a place)`}.
            </p>
          )}
          <Footnote />
        </CardContent>
      </Card>


      {/* 7. Gender split over time */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gender split over time</CardTitle>
          <p className="text-xs text-muted-foreground">
            Athletes at each Games — an athlete who competed at several Games is counted once per
            Games.
            {(pipeline?.india_female_olympians ?? null) != null && (
              <>
                {" "}
                India has fielded{" "}
                <span className="font-medium text-foreground">
                  {pipeline!.india_female_olympians}
                </span>{" "}
                distinct female athletes in this sport.
              </>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-56" role="img" aria-label={genderAriaLabel}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  label={{
                    value: "Athletes at each Games",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, textAnchor: "middle" },
                  }}
                />

                <RTooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="male"
                  name="Men"
                  stackId="g"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.5}
                />
                <Bar
                  dataKey="female"
                  name="Women"
                  stackId="g"
                  fill="hsl(var(--saffron, 33 100% 50%))"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 8. Most-capped athletes */}
      {mostCappedLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : (mostCapped?.length ?? 0) > 0 ? (

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most-capped athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Appearances</TableHead>
                    <TableHead className="text-right">Span</TableHead>
                    <TableHead className="text-right">Medals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mostCapped!.map((a) => (
                    <TableRow key={a.athlete_id}>
                      <TableCell className="font-medium">{a.display_name || DASH}</TableCell>
                      <TableCell className="text-right">{a.appearances ?? DASH}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {a.first_year == null
                          ? DASH
                          : a.first_year === a.last_year
                            ? a.first_year
                            : `${a.first_year}–${a.last_year}`}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="flex justify-end">
                          <MedalChips gold={a.gold} silver={a.silver} bronze={a.bronze} />
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* 9. Biometrics — only when the sport has 20+ recorded heights */}
      {bioLoading ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : biometrics ? (

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Biometrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-3">
              {(biometrics.genders.length
                ? biometrics.genders
                : [{ label: "All athletes", d: biometrics.dominant }]
              ).map((x) => (
                <div key={x.label} className="rounded-md border p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {x.label} (n={x.d.n_height ?? 0})
                  </p>
                  <p className="text-sm mt-1">
                    Median height:{" "}
                    <span className="font-semibold">
                      {x.d.median_height_cm == null
                        ? DASH
                        : `${num(x.d.median_height_cm)} cm (n=${x.d.n_height ?? 0})`}
                    </span>
                  </p>
                  <p className="text-sm">
                    Median weight:{" "}
                    <span className="font-semibold">
                      {x.d.median_weight_kg == null
                        ? DASH
                        : `${num(x.d.median_weight_kg)} kg (n=${x.d.n_weight ?? 0})`}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Based only on the {biometrics.sportN} athletes in this sport with a recorded height;
              most Indian Olympians have none.
              {biometrics.tooSmall.length > 0 &&
                ` ${biometrics.tooSmall
                  .map((x) => `${x.label.toLowerCase()} (n=${x.d.n_height ?? 0})`)
                  .join(" and ")} — sample too small to report separately.`}
            </p>
          </CardContent>
        </Card>
      ) : null}

    </div>
  );
};

export default OlympicRecordTab;
