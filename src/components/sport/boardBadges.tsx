import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { parseTrail } from "@/hooks/useEventExplorer";

export const DASH = "—";

export const OPENNESS_TOOLTIP =
  "Openness is the Herfindahl index of medal concentration. Bands are the observed quartiles of live Summer events (p25 0.090, p75 0.197 across 367 events).";
export const TIER_TOOLTIP =
  "Holding = has medalled in the last three Games. Slipping = has medalled but the trend is declining. Nearly = finished 4th–6th. Contending = finished 7th–8th. Developing = everything else.";

export const TIER_ORDER = ["slipping", "nearly", "contending", "holding", "developing"];

export const TIER_LABELS: Record<string, string> = {
  slipping: "Slipping",
  nearly: "Nearly",
  contending: "Contending",
  holding: "Holding",
  developing: "Developing",
};

export const TrendBadge = ({ trend }: { trend: string | null }) => {
  if (!trend) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    improving: { label: "Improving", cls: "border-transparent bg-india-green text-white" },
    declining: { label: "Declining", cls: "border-transparent bg-destructive text-destructive-foreground" },
    volatile: { label: "Volatile", cls: "border-transparent bg-saffron text-on-saffron" },
    steady: { label: "Steady", cls: "" },
    single_games: { label: "One Games only", cls: "" },
  };
  const cfg = map[trend] || { label: trend, cls: "" };
  return (
    <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs", cfg.cls)}>
      {cfg.label}
    </Badge>
  );
};

export const OpennessBadge = ({ band }: { band: string | null }) => {
  if (!band) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Open", cls: "border-transparent bg-india-green text-white" },
    moderate: { label: "Moderate", cls: "" },
    concentrated: { label: "Concentrated", cls: "border-transparent bg-saffron text-on-saffron" },
  };
  const cfg = map[band] || { label: band, cls: "" };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs cursor-help", cfg.cls)}>
            {cfg.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{OPENNESS_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const TierBadge = ({ tier }: { tier: string | null }) => {
  if (!tier) return <span className="text-muted-foreground">{DASH}</span>;
  const map: Record<string, { label: string; cls: string }> = {
    slipping: { label: "Slipping", cls: "border-transparent bg-destructive text-destructive-foreground" },
    nearly: { label: "Nearly", cls: "border-transparent bg-saffron text-on-saffron" },
    contending: { label: "Contending", cls: "border-transparent bg-primary text-primary-foreground" },
    holding: { label: "Holding", cls: "border-transparent bg-india-green text-white" },
    developing: { label: "Developing", cls: "" },
  };
  const cfg = map[tier] || { label: tier, cls: "" };
  return (
    <Badge variant={cfg.cls ? "default" : "secondary"} className={cn("text-xs", cfg.cls)}>
      {cfg.label}
    </Badge>
  );
};

export const TrailSteps = ({ trail }: { trail: string | null }) => {
  const steps = parseTrail(trail);
  if (steps.length === 0) return <span className="text-muted-foreground">{DASH}</span>;
  const best = Math.min(...steps.map((s) => s.place));
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      role="img"
      aria-label={`Finishing places: ${steps.map((s) => `${s.year} place ${s.place}`).join(", ")}`}
    >
      {steps.map((s, i) => (
        <span key={s.year} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground text-xs">→</span>}
          <span
            className={cn(
              "rounded-md border px-1.5 py-0.5 text-xs tabular-nums",
              s.place === best ? "border-transparent bg-india-green text-white" : "text-muted-foreground"
            )}
          >
            <span className="opacity-80">{s.year}</span> · {s.place}
          </span>
        </span>
      ))}
    </div>
  );
};
