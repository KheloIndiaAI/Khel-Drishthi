import InsightCard, { InsightTone } from "./InsightCard";
import type { SportPipelineRow } from "@/hooks/useSportPipeline";
import { PLACE_FOOTNOTE } from "@/hooks/useIndiaSportRecord";

/** Single canonical source — never re-word this locally. */
const PLACES_FOOTNOTE = PLACE_FOOTNOTE;


interface Insight {
  key: string;
  headline: string;
  sentence: string;
  tone: InsightTone;
  footnote?: string;
}

/** Rule-driven — never a hardcoded list of sports. Max 4, in priority order. */
export const buildInsights = (row: SportPipelineRow): Insight[] => {
  const out: Insight[] = [];
  const n = (v: number | null | undefined) => v ?? 0;

  if (n(row.india_top8_no_medal) >= 3) {
    out.push({
      key: "near-miss",
      headline: `${row.india_top8_no_medal} top-8 finishes without a medal`,
      sentence: `${n(row.india_fourth)} of them fourth place.`,
      tone: "caution",
      footnote: PLACES_FOOTNOTE,
    });
  }

  if (row.world_nations_last3 != null && row.world_nations_last3 <= 20 && n(row.india_medals) === 0) {
    out.push({
      key: "closed-shop",
      headline: `Only ${row.world_nations_last3} nations have medalled here in the last three Games`,
      sentence: row.world_leader_name
        ? `${row.world_leader_name} took ${n(row.world_leader_medals)}.`
        : "Leadership is concentrated in a handful of nations.",
      tone: "caution",
    });
  }

  if (n(row.la28_events) >= 15 && n(row.india_medals) === 0) {
    out.push({
      key: "opportunity",
      headline: `${row.la28_events} LA28 events, no Indian medal ever`,
      sentence: `${n(row.existing_athletes).toLocaleString()} trainees currently in the system.`,
      tone: "neutral",
    });
  }

  if (n(row.india_medals) > 0 && row.medals_per_100_trainees != null) {
    out.push({
      key: "efficiency",
      headline: `${row.india_medals} medals from ${n(row.existing_athletes).toLocaleString()} trainees`,
      sentence: `${Number(row.medals_per_100_trainees).toFixed(2)} medals per 100 trainees.`,
      tone: "positive",
    });
  }

  if (row.india_last_year != null && row.india_last_year < 2000) {
    out.push({
      key: "dormant",
      headline: `India last competed here in ${row.india_last_year}`,
      sentence: "No Indian entry in this sport at a Summer Games since then.",
      tone: "caution",
    });
  }

  return out.slice(0, 4);
};

export const SportInsights = ({ row }: { row: SportPipelineRow | null | undefined }) => {
  if (!row) return null;
  const insights = buildInsights(row);
  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((i) => (
        <InsightCard key={i.key} headline={i.headline} sentence={i.sentence} tone={i.tone} footnote={i.footnote} />
      ))}
    </div>
  );
};

export default SportInsights;
