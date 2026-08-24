import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MomentumRow, RiserRow } from "@/hooks/useBenchmark";

interface Props {
  rows: MomentumRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
  divergenceRows: RiserRow[] | undefined;
  countries: string[];
  names: Record<string, string>;
  reverseMap: Record<string, string>;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
};

export const MomentumCard = ({
  rows,
  isLoading,
  isError,
  divergenceRows,
  countries,
  names,
  reverseMap,
}: Props) => {
  const [open, setOpen] = useState(false);

  // Cache rows are already summed across events. Merging historical NOCs into a
  // modern one sums counts — correct here, unlike the strike-rate ratio.
  const chartData = useMemo(() => {
    const keyed = (rows || [])
      .map((r) => ({ ...r, noc: reverseMap[r.country_noc || ""] || r.country_noc || "" }))
      .filter((r) => countries.includes(r.noc));
    return countries.map((noc) => {
      const rs = keyed.filter((r) => r.noc === noc);
      return {
        country: names[noc] || noc,
        noc,
        hasData: rs.length > 0,
        raw: rs.reduce((s, r) => s + (r.top8_gain ?? 0), 0),
        normalised: rs.reduce((s, r) => s + (r.topdecile_gain ?? 0), 0),
        divergent: rs.reduce((s, r) => s + (r.divergent_events ?? 0), 0),
      };
    });
  }, [rows, reverseMap, countries, names]);

  const divergence = useMemo(
    () =>
      (divergenceRows || [])
        .filter(
          (r) =>
            (r.top8_gain ?? 0) > 0 && r.topdecile_gain != null && r.topdecile_gain <= 0
        )
        .sort((a, b) => (b.top8_gain ?? 0) - (a.top8_gain ?? 0)),
    [divergenceRows]
  );

  const noData = chartData.every((c) => !c.hasData);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" /> Momentum, adjusted for field depth
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-[320px] w-full" />
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Could not load this panel.</p>
        ) : noData ? (
          <p className="text-sm text-muted-foreground">
            No 2024 event momentum data for the selected countries.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              role="img"
              aria-label="Raw top-8 gain compared with depth-normalised gain, by country, across events last contested in 2024"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <RTooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="raw" name="Raw top-8 gain" fill="hsl(var(--saffron))" />
              <Bar
                dataKey="normalised"
                name="Depth-normalised gain"
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Raw top-8 counts rise when the field grows. The depth-normalised measure adjusts for
          how many athletes actually competed, so it reflects a change in standing rather than a
          change in field size.
        </p>

        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted">
            <span>Where the two measures disagree for India</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            {divergence.length === 0 ? (
              <p className="text-sm text-muted-foreground">No divergence in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 pr-4 font-medium">Discipline</th>
                      <th className="py-2 pr-4 font-medium">Event</th>
                      <th className="py-2 pr-4 font-medium text-right">Raw gain</th>
                      <th className="py-2 font-medium text-right">Normalised gain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divergence.map((r, i) => (
                      <tr
                        key={`${r.canonical_discipline}|${r.canonical_event}|${i}`}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 pr-4">{r.canonical_discipline ?? "—"}</td>
                        <td className="py-2 pr-4">{r.canonical_event ?? "—"}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {r.top8_gain ?? "—"}
                        </td>
                        <td className="py-2 text-right tabular-nums">
                          {r.topdecile_gain ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default MomentumCard;
