import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { StrikeRow } from "@/hooks/useBenchmark";

interface Props {
  rows: StrikeRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  countries: string[];
  names: Record<string, string>;
  colorFor: (noc: string) => string;
  /** original_noc -> modern_noc, only populated in Merged mode */
  reverseMap: Record<string, string>;
  eraFilter: (year: number) => boolean;
  eraLabel: string;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
};

export const StrikeRateCard = ({
  rows,
  isLoading,
  isError,
  countries,
  names,
  colorFor,
  reverseMap,
  eraFilter,
  eraLabel,
}: Props) => {
  // Roll historical NOCs into their modern NOC, then re-derive the rate from
  // summed numerators/denominators — never average percentages.
  const keyed = useMemo(
    () =>
      (rows || [])
        .map((r) => ({ ...r, noc: reverseMap[r.country_noc] || r.country_noc }))
        .filter((r) => countries.includes(r.noc) && eraFilter(r.year)),
    [rows, reverseMap, countries, eraFilter]
  );

  const chartData = useMemo(() => {
    const byYear: Record<number, Record<string, { c: number; m: number }>> = {};
    keyed.forEach((r) => {
      if (r.events_contested == null) return;
      byYear[r.year] = byYear[r.year] || {};
      const cur = byYear[r.year][r.noc] || { c: 0, m: 0 };
      cur.c += r.events_contested;
      cur.m += r.events_medalled ?? 0;
      byYear[r.year][r.noc] = cur;
    });
    return Object.entries(byYear)
      .map(([year, v]) => {
        const point: Record<string, number> = { year: Number(year) };
        Object.entries(v).forEach(([noc, agg]) => {
          if (agg.c > 0) point[noc] = Number(((agg.m / agg.c) * 100).toFixed(1));
        });
        return point;
      })
      .sort((a, b) => a.year - b.year);
  }, [keyed]);

  const table = useMemo(
    () =>
      countries
        .map((noc) => {
          const rs = keyed.filter((r) => r.noc === noc);
          const contested = rs.reduce((s, r) => s + (r.events_contested ?? 0), 0);
          const medalled = rs.reduce((s, r) => s + (r.events_medalled ?? 0), 0);
          return {
            noc,
            name: names[noc] || noc,
            hasData: rs.length > 0 && contested > 0,
            contested,
            medalled,
            rate: contested > 0 ? (medalled / contested) * 100 : null,
          };
        })
        .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1)),
    [keyed, countries, names]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" /> Strike rate — medals per event contested
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Could not load this panel.</p>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No strike-rate data for the selected countries in this era.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              role="img"
              aria-label={`Strike rate by Games, ${eraLabel}, for ${countries
                .map((c) => names[c] || c)
                .join(", ")}`}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                unit="%"
                width={48}
              />
              <RTooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
              <Legend />
              {countries.map((noc) => (
                <Line
                  key={noc}
                  type="monotone"
                  dataKey={noc}
                  name={names[noc] || noc}
                  stroke={colorFor(noc)}
                  strokeWidth={noc === "IND" ? 3 : 2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-4 font-medium">Country</th>
                <th className="py-2 pr-4 font-medium text-right">Events contested</th>
                <th className="py-2 pr-4 font-medium text-right">Events medalled</th>
                <th className="py-2 font-medium text-right">Strike rate</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.noc} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{r.name}</td>
                  {r.hasData ? (
                    <>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.contested}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{r.medalled}</td>
                      <td className="py-2 text-right tabular-nums">
                        {r.rate!.toFixed(1)}%
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="py-2 text-right text-muted-foreground">
                      No data in this era
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Medal counts confound performance with opportunity — a delegation that enters more
          events has more chances to medal. Strike rate is the share of events entered that
          produced a medal. India contested 60 events in 2016 and 60 in 2024, but converted 2
          and 6 of them: the same breadth, three times the conversion.
        </p>
      </CardContent>
    </Card>
  );
};

export default StrikeRateCard;
