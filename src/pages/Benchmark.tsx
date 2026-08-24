import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageSEO from "@/components/seo/PageSEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Globe, Info, Trophy } from "lucide-react";
import {
  ERA_CHART_LABEL,
  ERA_OPTIONS,
  EraKey,
  makeEraFilter,
  useCountryStrike,
  useEventRisers,
} from "@/hooks/useBenchmark";
import StrikeRateCard from "@/components/benchmark/StrikeRateCard";
import MomentumCard from "@/components/benchmark/MomentumCard";
import SportDrilldownDialog from "@/components/benchmark/SportDrilldownDialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type TallyRow = {
  year: number;
  country_noc: string;
  canonical_discipline: string | null;
  kd_sport_id: string | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  total: number | null;
};

const PEERS = [
  { noc: "CHN", name: "China" },
  { noc: "USA", name: "United States" },
  { noc: "GBR", name: "Great Britain" },
  { noc: "JPN", name: "Japan" },
  { noc: "KOR", name: "South Korea" },
  { noc: "AUS", name: "Australia" },
  { noc: "FRA", name: "France" },
  { noc: "GER", name: "Germany" },
  { noc: "RUS", name: "Russia" },
];

const NAMES: Record<string, string> = {
  IND: "India",
  ...Object.fromEntries(PEERS.map((p) => [p.noc, p.name])),
};

const MAX_PEERS = 5;

const PALETTE = [
  "hsl(var(--saffron))",
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 200 80% 45%))",
  "hsl(var(--chart-3, 280 60% 55%))",
  "hsl(var(--chart-4, 150 60% 40%))",
  "hsl(var(--chart-5, 340 70% 55%))",
];

const Benchmark = () => {
  const [selectedPeers, setSelectedPeers] = useState<string[]>(["CHN", "GBR", "JPN"]);
  const [merged, setMerged] = useState(false);
  const [era, setEra] = useState<EraKey>("all");
  const [drillSport, setDrillSport] = useState<string | null>(null);

  const countries = useMemo(() => ["IND", ...selectedPeers], [selectedPeers]);

  const { data: groups } = useQuery({
    queryKey: ["oly-country-groups"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_country_groups")
        .select("original_noc, modern_noc");
      if (error) throw error;
      return data || [];
    },
  });

  // modern_noc -> [original_noc]
  const historicalMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    (groups || []).forEach((g) => {
      map[g.modern_noc] = [...(map[g.modern_noc] || []), g.original_noc];
    });
    return map;
  }, [groups]);

  const fetchNocs = useMemo(() => {
    const set = new Set<string>(countries);
    if (merged) {
      countries.forEach((c) => (historicalMap[c] || []).forEach((o) => set.add(o)));
    }
    return [...set].sort();
  }, [countries, merged, historicalMap]);

  // original_noc -> modern_noc (only for selected countries)
  const reverseMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (merged) {
      countries.forEach((c) => (historicalMap[c] || []).forEach((o) => (map[o] = c)));
    }
    return map;
  }, [countries, merged, historicalMap]);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["benchmark-tally", fetchNocs.join(",")],
    staleTime: Infinity,
    enabled: fetchNocs.length > 0 && groups !== undefined,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_medal_tally")
        .select("year, country_noc, canonical_discipline, kd_sport_id, gold, silver, bronze, total")
        .eq("season", "Summer")
        .in("country_noc", fetchNocs);
      if (error) throw error;
      return (data || []) as TallyRow[];
    },
  });

  const strike = useCountryStrike(fetchNocs);
  const risers = useEventRisers(fetchNocs);

  // The three most recent Summer years present in the data.
  const lastThreeYears = useMemo(() => {
    const years = [...new Set((rows || []).map((r) => r.year))].sort((a, b) => b - a);
    return years.slice(0, 3);
  }, [rows]);

  const eraFilter = useMemo(() => makeEraFilter(era, lastThreeYears), [era, lastThreeYears]);
  const eraLabel = ERA_CHART_LABEL[era];

  const keyed = useMemo(
    () =>
      (rows || [])
        .map((r) => ({ ...r, noc: reverseMap[r.country_noc] || r.country_noc }))
        .filter((r) => countries.includes(r.noc) && eraFilter(r.year)),
    [rows, reverseMap, countries, eraFilter]
  );

  const colorFor = (noc: string) =>
    noc === "IND" ? "hsl(var(--saffron))" : PALETTE[(countries.indexOf(noc) % (PALETTE.length - 1)) + 1];

  // Chart A: medals per games
  const trendData = useMemo(() => {
    const byYear: Record<number, Record<string, number>> = {};
    keyed.forEach((r) => {
      byYear[r.year] = byYear[r.year] || {};
      byYear[r.year][r.noc] = (byYear[r.year][r.noc] || 0) + (r.total || 0);
    });
    return Object.entries(byYear)
      .map(([year, v]) => ({ year: Number(year), ...v }))
      .sort((a, b) => a.year - b.year);
  }, [keyed]);

  // Chart B: by sport (top 8 in the selected era)
  const sportData = useMemo(() => {
    const bySport: Record<string, { label: string; totals: Record<string, number>; combined: number }> = {};
    keyed
      .filter((r) => r.kd_sport_id)
      .forEach((r) => {
        const key = r.kd_sport_id as string;
        const label = r.canonical_discipline || key;
        if (!bySport[key]) bySport[key] = { label, totals: {}, combined: 0 };
        bySport[key].totals[r.noc] = (bySport[key].totals[r.noc] || 0) + (r.total || 0);
        bySport[key].combined += r.total || 0;
      });
    return Object.values(bySport)
      .sort((a, b) => b.combined - a.combined)
      .slice(0, 8)
      .map((s) => ({ sport: s.label, ...s.totals }));
  }, [keyed]);

  // Summary strip
  const summary = useMemo(
    () =>
      countries.map((noc) => {
        const rs = keyed.filter((r) => r.noc === noc);
        return {
          noc,
          name: NAMES[noc] || noc,
          hasData: rs.length > 0,
          gold: rs.reduce((s, r) => s + (r.gold || 0), 0),
          silver: rs.reduce((s, r) => s + (r.silver || 0), 0),
          bronze: rs.reduce((s, r) => s + (r.bronze || 0), 0),
          total: rs.reduce((s, r) => s + (r.total || 0), 0),
        };
      }),
    [keyed, countries]
  );

  const togglePeer = (noc: string) => {
    setSelectedPeers((prev) =>
      prev.includes(noc)
        ? prev.filter((p) => p !== noc)
        : prev.length >= MAX_PEERS
        ? prev
        : [...prev, noc]
    );
  };

  return (
    <DashboardLayout>
      <PageSEO
        title="Global Benchmark — India vs the world | Khel Drishti"
        description="Compare India's Olympic performance against peer nations by era, with strike rate — medals per event contested — and depth-adjusted momentum."
        canonicalPath="/benchmark"
        keywords={["Olympic benchmark", "India vs China Olympics", "medal comparison", "strike rate"]}
      />


      <div className="space-y-6 pb-20 md:pb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-7 w-7 text-saffron" />
            Global Benchmark
          </h1>
          <p className="text-muted-foreground mt-1">
            India's Summer Olympic performance compared with peer nations (1896–2024).
          </p>
        </div>

        {/* Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Compare with</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-saffron text-on-saffron hover:bg-saffron">India (IND)</Badge>
              {PEERS.map((p) => {
                const active = selectedPeers.includes(p.noc);
                const disabled = !active && selectedPeers.length >= MAX_PEERS;
                return (
                  <button
                    key={p.noc}
                    onClick={() => togglePeer(p.noc)}
                    disabled={disabled}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border",
                      disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Up to {MAX_PEERS} peers at a time for chart readability.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-lg border p-1">
                {(["Historical", "Merged"] as const).map((mode) => {
                  const active = merged === (mode === "Merged");
                  return (
                    <Button
                      key={mode}
                      size="sm"
                      variant={active ? "default" : "ghost"}
                      onClick={() => setMerged(mode === "Merged")}
                    >
                      {mode}
                    </Button>
                  );
                })}
              </div>
              {merged && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Merged view combines historical delegations (e.g. USSR→Russia, East+West Germany→Germany) under their modern nation.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="inline-flex flex-wrap rounded-lg border p-1">
                {ERA_OPTIONS.map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    variant={era === opt.key ? "default" : "ghost"}
                    onClick={() => setEra(opt.key)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Era cuts follow Olympic history: the post-war resumption of the Games in 1948 and
                the post-Soviet reordering of the medal table from 1992. The era filter and the
                Historical/Merged toggle apply independently.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Summary strip */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {isLoading
            ? countries.map((c) => <Skeleton key={c} className="h-28 w-full" />)
            : summary.map((s) => (
                <Card key={s.noc} className={cn(s.noc === "IND" && "border-saffron")}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{s.name}</span>
                      <span className="text-xs text-muted-foreground">{s.noc}</span>
                    </div>
                    {s.hasData ? (
                      <>
                        <div className="text-2xl font-bold mt-1">{s.total}</div>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span style={{ color: "hsl(var(--gold))" }}>G {s.gold}</span>
                          <span style={{ color: "hsl(var(--silver))" }}>S {s.silver}</span>
                          <span style={{ color: "hsl(var(--bronze))" }}>B {s.bronze}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No data in this era</p>
                    )}
                  </CardContent>
                </Card>

              ))}
        </div>

        {/* Chart A */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4" /> Medals per Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  {countries.map((noc) => (
                    <Line
                      key={noc}
                      type="monotone"
                      dataKey={noc}
                      name={NAMES[noc] || noc}
                      stroke={colorFor(noc)}
                      strokeWidth={noc === "IND" ? 3 : 2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart B */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By sport ({eraLabel})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Click any bar to open that sport's detail.
            </p>
            {isLoading ? (
              <Skeleton className="h-[420px] w-full" />
            ) : sportData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sport-level data for the selected countries in this era.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={420}>
                <BarChart
                  data={sportData}
                  layout="vertical"
                  margin={{ left: 20 }}
                  role="img"
                  aria-label={`Medals by sport, ${eraLabel}, for the selected countries`}
                  className="cursor-pointer"
                  onClick={(state: { activeLabel?: string }) =>
                    state?.activeLabel && setDrillSport(state.activeLabel)
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="sport"
                    width={130}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <RTooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  {countries.map((noc) => (
                    <Bar
                      key={noc}
                      dataKey={noc}
                      name={NAMES[noc] || noc}
                      fill={colorFor(noc)}
                      cursor="pointer"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <StrikeRateCard
          rows={strike.data}
          isLoading={strike.isLoading}
          isError={strike.isError}
          countries={countries}
          names={NAMES}
          colorFor={colorFor}
          reverseMap={reverseMap}
          eraFilter={eraFilter}
          eraLabel={eraLabel}
        />

        <MomentumCard
          rows={risers.data}
          isLoading={risers.isLoading}
          isError={risers.isError}
          countries={countries}
          names={NAMES}
          reverseMap={reverseMap}
        />

        <SportDrilldownDialog
          sport={drillSport}
          onClose={() => setDrillSport(null)}
          rows={keyed}
          countries={countries}
          names={NAMES}
          colorFor={colorFor}
          eraLabel={eraLabel}
        />
      </div>

    </DashboardLayout>
  );
};

export default Benchmark;
