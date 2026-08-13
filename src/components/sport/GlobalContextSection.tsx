import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Trophy } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  sportId: string;
}

type TallyRow = {
  year: number;
  country_noc: string;
  country_name: string | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  total: number | null;
};

const SELECT = "year,country_noc,country_name,gold,silver,bronze,total";

const MedalChip = ({ label, value, className }: { label: string; value: number; className: string }) => (
  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${className}`}>
    <span className="text-xs uppercase tracking-wide opacity-80">{label}</span>
    <span className="text-lg font-display leading-none">{value}</span>
  </div>
);

export const GlobalContextSection = ({ sportId }: Props) => {
  const { data: indiaRows, isLoading: indiaLoading } = useQuery({
    queryKey: ["oly-tally-india", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_medal_tally")
        .select(SELECT)
        .eq("kd_sport_id", sportId)
        .eq("season", "Summer")
        .eq("country_noc", "IND");
      if (error) throw error;
      return (data || []) as TallyRow[];
    },
  });

  const { data: sportRows, isLoading: sportLoading } = useQuery({
    queryKey: ["oly-tally-sport", sportId],
    staleTime: Infinity,
    enabled: !!sportId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oly_medal_tally")
        .select(SELECT)
        .eq("kd_sport_id", sportId)
        .eq("season", "Summer");
      if (error) throw error;
      return (data || []) as TallyRow[];
    },
  });

  const loading = indiaLoading || sportLoading;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Global Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!sportRows || sportRows.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Global Context
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          This sport has no Olympic medal history yet.
        </CardContent>
      </Card>
    );
  }

  const india = indiaRows || [];
  const indiaGold = india.reduce((s, r) => s + (r.gold || 0), 0);
  const indiaSilver = india.reduce((s, r) => s + (r.silver || 0), 0);
  const indiaBronze = india.reduce((s, r) => s + (r.bronze || 0), 0);
  const indiaTotal = india.reduce((s, r) => s + (r.total || 0), 0);

  const indiaByYear = Object.values(
    india.reduce((acc: Record<number, { year: number; gold: number; silver: number; bronze: number }>, r) => {
      if (!acc[r.year]) acc[r.year] = { year: r.year, gold: 0, silver: 0, bronze: 0 };
      acc[r.year].gold += r.gold || 0;
      acc[r.year].silver += r.silver || 0;
      acc[r.year].bronze += r.bronze || 0;
      return acc;
    }, {})
  )
    .filter((d) => d.gold + d.silver + d.bronze > 0)
    .sort((a, b) => a.year - b.year);

  const aggregate = (rows: TallyRow[]) =>
    Object.values(
      rows.reduce(
        (
          acc: Record<string, { noc: string; name: string; gold: number; silver: number; bronze: number; total: number }>,
          r
        ) => {
          const key = r.country_noc;
          if (!acc[key])
            acc[key] = { noc: key, name: r.country_name || key, gold: 0, silver: 0, bronze: 0, total: 0 };
          acc[key].gold += r.gold || 0;
          acc[key].silver += r.silver || 0;
          acc[key].bronze += r.bronze || 0;
          acc[key].total += r.total || 0;
          return acc;
        },
        {}
      )
    );

  const recent = aggregate(sportRows.filter((r) => [2016, 2020, 2024].includes(r.year)))
    .sort((a, b) => b.total - a.total || b.gold - a.gold)
    .slice(0, 5);

  const allTime = aggregate(sportRows).sort((a, b) => b.total - a.total || b.gold - a.gold)[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Globe className="h-4 w-4" /> Global Context
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* India in this sport */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-saffron" /> India in this sport
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <MedalChip label="Gold" value={indiaGold} className="medal-gold" />
            <MedalChip label="Silver" value={indiaSilver} className="medal-silver" />
            <MedalChip label="Bronze" value={indiaBronze} className="medal-bronze" />
            <MedalChip label="Total" value={indiaTotal} className="bg-muted text-foreground" />
          </div>
          {indiaByYear.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={indiaByYear} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <RTooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="gold" stackId="m" fill="hsl(var(--gold))" name="Gold" />
                  <Bar dataKey="silver" stackId="m" fill="hsl(var(--silver))" name="Silver" />
                  <Bar dataKey="bronze" stackId="m" fill="hsl(var(--bronze))" name="Bronze" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center rounded-lg bg-muted/30">
              India has not won an Olympic medal in this sport yet.
            </p>
          )}
        </div>

        {/* Who leads this sport */}
        <div>
          <h3 className="text-sm font-medium mb-3">Who leads this sport</h3>
          {recent.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase text-muted-foreground">
                    <th className="text-left font-medium py-1.5">Nation</th>
                    <th className="text-right font-medium py-1.5">G</th>
                    <th className="text-right font-medium py-1.5">S</th>
                    <th className="text-right font-medium py-1.5">B</th>
                    <th className="text-right font-medium py-1.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((c) => (
                    <tr key={c.noc} className="border-t border-border/60">
                      <td className="py-1.5 pr-2 font-medium">{c.name}</td>
                      <td className="py-1.5 text-right tabular-nums text-[hsl(var(--gold))]">{c.gold}</td>
                      <td className="py-1.5 text-right tabular-nums text-[hsl(var(--silver))]">{c.silver}</td>
                      <td className="py-1.5 text-right tabular-nums text-[hsl(var(--bronze))]">{c.bronze}</td>
                      <td className="py-1.5 text-right tabular-nums font-semibold">{c.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No medals recorded in the last three Summer Games.</p>
          )}
          {allTime && (
            <p className="text-xs text-muted-foreground mt-3">
              All-time: {allTime.name} leads with {allTime.total} medals
            </p>
          )}
          <p className="text-[11px] text-muted-foreground mt-1">
            Leaders computed over Paris 2024, Tokyo 2020 and Rio 2016.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalContextSection;
