import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type InsightTone = "neutral" | "positive" | "caution";

interface InsightCardProps {
  headline: string;
  sentence: string;
  tone?: InsightTone;
  footnote?: string;
}

const toneClasses: Record<InsightTone, { card: string; headline: string }> = {
  neutral: { card: "border-border", headline: "text-foreground" },
  positive: { card: "border-india-green/40 bg-india-green/5", headline: "text-india-green" },
  caution: { card: "border-saffron/40 bg-saffron/5", headline: "text-saffron" },
};

export const InsightCard = ({ headline, sentence, tone = "neutral", footnote }: InsightCardProps) => {
  const t = toneClasses[tone];
  return (
    <Card className={cn("h-full", t.card)}>
      <CardContent className="pt-4">
        <p className={cn("font-display text-lg leading-tight", t.headline)}>{headline}</p>
        <p className="text-sm text-muted-foreground mt-1.5">{sentence}</p>
        {footnote && <p className="text-[11px] text-muted-foreground mt-2">{footnote}</p>}
      </CardContent>
    </Card>
  );
};

export default InsightCard;
