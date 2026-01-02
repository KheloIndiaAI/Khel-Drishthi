import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Target, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { REGION_COLORS, getRegionDisplayName } from "@/lib/regionMapping";

export interface RegionStats {
  regionName: string;
  states: string[];
  ncoe: number;
  stc: number;
  kic: number;
  kisce: number;
  totalCentres: number;
  sportsCount: number;
  sanctionedCapacity: number;
  existingCapacity: number;
}

interface RegionalCentreCardProps {
  region: RegionStats;
  onClick: () => void;
  isSelected?: boolean;
}

export const RegionalCentreCard = ({ region, onClick, isSelected }: RegionalCentreCardProps) => {
  const colors = REGION_COLORS[region.regionName] || { 
    bg: "bg-muted", 
    text: "text-muted-foreground", 
    border: "border-border" 
  };
  
  const utilizationPct = region.sanctionedCapacity > 0 
    ? Math.round((region.existingCapacity / region.sanctionedCapacity) * 100) 
    : 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
        colors.border,
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <Building2 className={cn("h-5 w-5", colors.text)} />
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Region Name */}
        <h3 className="font-semibold text-lg mb-1">
          {getRegionDisplayName(region.regionName)}
        </h3>

        {/* States covered */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {region.states.length} {region.states.length === 1 ? 'state' : 'states'}
          </span>
        </div>

        {/* Centre type breakdown */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center justify-between bg-saffron/10 rounded px-2 py-1">
            <span className="text-xs text-saffron font-medium">NCOE</span>
            <span className="text-sm font-bold">{region.ncoe}</span>
          </div>
          <div className="flex items-center justify-between bg-india-green/10 rounded px-2 py-1">
            <span className="text-xs text-india-green font-medium">STC</span>
            <span className="text-sm font-bold">{region.stc}</span>
          </div>
          <div className="flex items-center justify-between bg-purple-500/10 rounded px-2 py-1">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">KIC</span>
            <span className="text-sm font-bold">{region.kic}</span>
          </div>
          <div className="flex items-center justify-between bg-india-navy/10 rounded px-2 py-1">
            <span className="text-xs text-india-navy dark:text-blue-400 font-medium">KISCE</span>
            <span className="text-sm font-bold">{region.kisce}</span>
          </div>
        </div>

        {/* Sports count */}
        <div className="flex items-center gap-2 text-sm border-t pt-3">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Sports:</span>
          <Badge variant="secondary" className="ml-auto">
            {region.sportsCount}
          </Badge>
        </div>

        {/* Total centres summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <span>Total Centres: <span className="font-semibold text-foreground">{region.totalCentres}</span></span>
          {region.sanctionedCapacity > 0 && (
            <span>{utilizationPct}% capacity</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
