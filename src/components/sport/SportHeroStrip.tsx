import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SportPipelineRow } from "@/hooks/useSportPipeline";

interface Tile {
  label: string;
  value: string;
  sublabel?: string;
}

const DASH = "—";

const num = (v: number | null | undefined) => (v == null ? DASH : Number(v).toLocaleString());

const medalsLabel = (row: SportPipelineRow) => {
  if (row.india_medals == null) return DASH;
  if (row.india_medals === 0) return "None";
  return String(row.india_medals);
};

const medalsSub = (row: SportPipelineRow) => {
  if (!row.india_medals) return undefined;
  return row.india_gold ? `${row.india_gold}G of ${row.india_medals}` : "no gold yet";
};

const pct = (v: number | null | undefined, scale = 1) =>
  v == null ? DASH : `${(Number(v) * scale).toFixed(1)}%`;

export const buildHeroTiles = (row: SportPipelineRow): Tile[] => {
  const mapped: Tile = {
    label: "Centres mapped",
    value: row.centres_mappable == null ? DASH : String(row.centres_mappable),
    sublabel: row.centres_linked != null ? `of ${row.centres_linked} linked` : undefined,
  };
  const trainees: Tile = {
    label: "Trainees",
    value: num(row.existing_athletes),
    sublabel: row.sanctioned_capacity ? `of ${row.sanctioned_capacity.toLocaleString()} sanctioned` : undefined,
  };
  const states: Tile = { label: "States present", value: num(row.states) };

  switch (row.archetype) {
    case "C_non_olympic":
      return [
        { label: "AG2026 events", value: num(row.ag2026_events) },
        mapped,
        trainees,
        { label: "Sanctioned capacity", value: num(row.sanctioned_capacity) },
        states,
        { label: "Utilisation", value: pct(row.utilisation_pct) },
      ];
    case "D_no_pipeline":
      return [
        { label: "LA28 events", value: num(row.la28_events) },
        { label: "AG2026 events", value: num(row.ag2026_events) },
        { label: "Indian Olympians", value: num(row.india_olympians) },
        { label: "India medals", value: medalsLabel(row), sublabel: medalsSub(row) },
        states,
        { label: "Pipeline", value: DASH, sublabel: "No centre in the system" },
      ];
    default:
      return [
        { label: "LA28 events", value: num(row.la28_events) },
        { label: "India medals", value: medalsLabel(row), sublabel: medalsSub(row) },
        { label: "Indian Olympians", value: num(row.india_olympians) },
        mapped,
        trainees,
        {
          label: "Conversion rate",
          value: row.india_conversion == null ? DASH : pct(row.india_conversion, 100),
          sublabel: row.india_conversion == null ? "not measurable" : "medals per entry",
        },
      ];
  }
};

export const buildVerdict = (row: SportPipelineRow): string => {
  const sport = row.sport_name || "This sport";
  const trainees = (row.existing_athletes ?? 0).toLocaleString();
  const centres = row.centres_mappable ?? 0;
  const states = row.states ?? 0;
  const olympians = row.india_olympians ?? 0;

  switch (row.archetype) {
    case "B_no_india_record":
      return `${sport}: ${trainees} trainees across ${centres} centres in ${states} states, ${olympians} Olympians since ${row.india_first_year ?? DASH}, ${row.india_top8 ?? 0} top-8 finishes, no medal yet. ${row.world_nations_last3 ?? DASH} nations have medalled in the last three Games; ${row.world_leader_name ?? "the leader"} took ${row.world_leader_medals ?? DASH}.`;
    case "C_non_olympic":
      return `${sport}: not on the LA28 programme. ${trainees} trainees across ${centres} centres in ${states} states.`;
    case "D_no_pipeline":
      return `${sport}: ${row.la28_events ?? 0} LA28 events, ${olympians} Indian Olympians, and no centre currently in the system.`;
    default:
      return `${sport}: ${trainees} trainees across ${centres} centres in ${states} states, ${olympians} Olympians since ${row.india_first_year ?? DASH}, ${row.india_medals ?? 0} medals.`;
  }
};

export const SportHeroStrip = ({
  row,
  isLoading,
}: {
  row: SportPipelineRow | null | undefined;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!row) return null;

  const tiles = buildHeroTiles(row);

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="font-display text-2xl leading-tight mt-1">{t.value}</p>
              {t.sublabel && (
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{t.sublabel}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-muted-foreground mt-3">{buildVerdict(row)}</p>
    </div>
  );
};

export default SportHeroStrip;
