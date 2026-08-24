import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export type DrilldownRow = {
  year: number;
  noc: string;
  kd_sport_id: string | null;
  canonical_discipline: string | null;
  gold: number | null;
  silver: number | null;
  bronze: number | null;
  total: number | null;
};

interface Props {
  sport: string | null;
  onClose: () => void;
  /** Era-filtered, merge-resolved tally rows already fetched by the page. */
  rows: DrilldownRow[];
  countries: string[];
  names: Record<string, string>;
  colorFor: (noc: string) => string;
  eraLabel: string;
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
};

export const SportDrilldownDialog = ({
  sport,
  onClose,
  rows,
  countries,
  names,
  colorFor,
  eraLabel,
}: Props) => {
  const scoped = useMemo(
    () => rows.filter((r) => (r.canonical_discipline || r.kd_sport_id) === sport),
    [rows, sport]
  );

  const trend = useMemo(() => {
    const byYear: Record<number, Record<string, number>> = {};
    scoped.forEach((r) => {
      byYear[r.year] = byYear[r.year] || {};
      byYear[r.year][r.noc] = (byYear[r.year][r.noc] || 0) + (r.total ?? 0);
    });
    return Object.entries(byYear)
      .map(([year, v]) => ({ year: Number(year), ...v }))
      .sort((a, b) => a.year - b.year);
  }, [scoped]);

  const totals = useMemo(
    () =>
      countries.map((noc) => {
        const rs = scoped.filter((r) => r.noc === noc);
        return {
          noc,
          name: names[noc] || noc,
          hasData: rs.length > 0,
          gold: rs.reduce((s, r) => s + (r.gold ?? 0), 0),
          silver: rs.reduce((s, r) => s + (r.silver ?? 0), 0),
          bronze: rs.reduce((s, r) => s + (r.bronze ?? 0), 0),
          total: rs.reduce((s, r) => s + (r.total ?? 0), 0),
        };
      }),
    [scoped, countries, names]
  );

  return (
    <Dialog open={!!sport} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{sport}</DialogTitle>
          <DialogDescription>
            Medals by Games for the selected countries — {eraLabel}.
          </DialogDescription>
        </DialogHeader>

        {trend.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No medals in this sport for the selected countries and era.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={trend}
              role="img"
              aria-label={`Medals per Games in ${sport} for the selected countries`}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} width={36} />
              <RTooltip contentStyle={tooltipStyle} />
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
          <table className="w-full text-sm min-w-[380px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-4 font-medium">Country</th>
                <th className="py-2 pr-4 font-medium text-right">Gold</th>
                <th className="py-2 pr-4 font-medium text-right">Silver</th>
                <th className="py-2 pr-4 font-medium text-right">Bronze</th>
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {totals.map((t) => (
                <tr key={t.noc} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{t.name}</td>
                  {t.hasData ? (
                    <>
                      <td className="py-2 pr-4 text-right tabular-nums">{t.gold}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{t.silver}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{t.bronze}</td>
                      <td className="py-2 text-right tabular-nums font-semibold">{t.total}</td>
                    </>
                  ) : (
                    <td colSpan={4} className="py-2 text-right text-muted-foreground">
                      No data in this era
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SportDrilldownDialog;
