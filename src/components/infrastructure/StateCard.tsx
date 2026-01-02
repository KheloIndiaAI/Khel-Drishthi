import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRegionDisplayName } from "@/lib/regionMapping";

export interface StateStats {
  stateName: string;
  regionName: string | null;
  ncoe: number;
  stc: number;
  kic: number;
  kisce: number;
  totalCentres: number;
  sportsCount: number;
  sanctionedCapacity: number;
  existingCapacity: number;
}

interface StateCardProps {
  state: StateStats;
  onClick: () => void;
  isSelected?: boolean;
  compact?: boolean;
}

export const StateCard = ({ state, onClick, isSelected, compact = false }: StateCardProps) => {
  const utilizationPct = state.sanctionedCapacity > 0 
    ? Math.round((state.existingCapacity / state.sanctionedCapacity) * 100) 
    : 0;

  if (compact) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{state.stateName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs">
                {state.totalCentres}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">{state.stateName}</h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Region */}
        {state.regionName && (
          <p className="text-xs text-muted-foreground mb-3">
            {getRegionDisplayName(state.regionName)}
          </p>
        )}

        {/* Centre type breakdown */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          <div className="text-center bg-saffron/10 rounded py-1 px-1">
            <p className="text-xs font-bold">{state.ncoe}</p>
            <p className="text-[10px] text-saffron">NCOE</p>
          </div>
          <div className="text-center bg-india-green/10 rounded py-1 px-1">
            <p className="text-xs font-bold">{state.stc}</p>
            <p className="text-[10px] text-india-green">STC</p>
          </div>
          <div className="text-center bg-purple-500/10 rounded py-1 px-1">
            <p className="text-xs font-bold">{state.kic}</p>
            <p className="text-[10px] text-purple-600 dark:text-purple-400">KIC</p>
          </div>
          <div className="text-center bg-india-navy/10 rounded py-1 px-1">
            <p className="text-xs font-bold">{state.kisce}</p>
            <p className="text-[10px] text-india-navy dark:text-blue-400">KISCE</p>
          </div>
        </div>

        {/* Sports and capacity */}
        <div className="flex items-center justify-between text-xs border-t pt-2">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span>{state.sportsCount} sports</span>
          </div>
          {state.sanctionedCapacity > 0 && (
            <span className="text-muted-foreground">{utilizationPct}% capacity</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
