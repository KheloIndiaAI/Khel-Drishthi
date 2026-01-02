import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  MapPin, 
  Users, 
  Target, 
  ChevronLeft,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { REGION_COLORS, getRegionDisplayName } from "@/lib/regionMapping";
import { RegionStats } from "./RegionalCentreCard";
import { StateStats, StateCard } from "./StateCard";

interface Centre {
  centre_id: string;
  centre_name: string;
  centre_type: string;
  state: string;
  district?: string;
  region_unit?: string;
}

interface RegionalCentreDetailProps {
  region: RegionStats;
  centres: Centre[];
  stateStats: StateStats[];
  sportsList: { sportName: string; centreCount: number }[];
  onClose: () => void;
  onCentreClick: (centre: Centre) => void;
  onStateClick: (state: StateStats) => void;
  capacityMap: Map<string, { existing: number; sanctioned: number }>;
  centreSportsMap: Map<string, string[]>;
}

const centreTypeColors: Record<string, string> = {
  NCOE: "bg-saffron text-white",
  STC: "bg-india-green text-white",
  KISCE: "bg-india-navy text-white",
  KIC: "bg-purple-600 text-white",
};

export const RegionalCentreDetail = ({
  region,
  centres,
  stateStats,
  sportsList,
  onClose,
  onCentreClick,
  onStateClick,
  capacityMap,
  centreSportsMap,
}: RegionalCentreDetailProps) => {
  const colors = REGION_COLORS[region.regionName] || { 
    bg: "bg-muted", 
    text: "text-muted-foreground", 
    border: "border-border" 
  };

  const utilizationPct = region.sanctionedCapacity > 0 
    ? Math.round((region.existingCapacity / region.sanctionedCapacity) * 100) 
    : 0;

  // Group centres by type
  const centresByType = useMemo(() => {
    const grouped: Record<string, Centre[]> = {
      NCOE: [],
      STC: [],
      KIC: [],
      KISCE: [],
    };
    centres.forEach(c => {
      if (grouped[c.centre_type]) {
        grouped[c.centre_type].push(c);
      }
    });
    return grouped;
  }, [centres]);

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-display">{getRegionDisplayName(region.regionName)}</h2>
          <p className="text-muted-foreground text-sm">Regional Centre Details</p>
        </div>
        <Button variant="outline" size="icon" onClick={onClose} className="md:hidden">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={cn(colors.border, colors.bg)}>
          <CardContent className="p-4">
            <p className={cn("text-xs font-medium mb-1", colors.text)}>Total Centres</p>
            <p className="text-2xl font-bold">{region.totalCentres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">States Covered</p>
            <p className="text-2xl font-bold">{region.states.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Sports</p>
            <p className="text-2xl font-bold">{region.sportsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Capacity</p>
            <p className="text-2xl font-bold">{utilizationPct}%</p>
            <Progress value={utilizationPct} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>

      {/* Centre Type Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Centre Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-saffron/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-saffron">{region.ncoe}</p>
              <p className="text-xs text-saffron font-medium">NCOE</p>
            </div>
            <div className="bg-india-green/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-india-green">{region.stc}</p>
              <p className="text-xs text-india-green font-medium">STC</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{region.kic}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">KIC</p>
            </div>
            <div className="bg-india-navy/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-india-navy dark:text-blue-400">{region.kisce}</p>
              <p className="text-xs text-india-navy dark:text-blue-400 font-medium">KISCE</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* States in Region */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            States in Region ({stateStats.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stateStats.map(state => (
              <StateCard 
                key={state.stateName}
                state={state}
                onClick={() => onStateClick(state)}
                compact
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sports Coverage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sports Coverage ({sportsList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sportsList.slice(0, 20).map(sport => (
              <Badge key={sport.sportName} variant="secondary" className="text-xs">
                {sport.sportName}
                <span className="ml-1 opacity-70">({sport.centreCount})</span>
              </Badge>
            ))}
            {sportsList.length > 20 && (
              <Badge variant="outline" className="text-xs">
                +{sportsList.length - 20} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Centres List by Type */}
      {["NCOE", "STC", "KIC", "KISCE"].map(type => {
        const typeCentres = centresByType[type];
        if (typeCentres.length === 0) return null;

        return (
          <Card key={type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge className={cn("text-xs", centreTypeColors[type])}>
                  {type}
                </Badge>
                <span>Centres ({typeCentres.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {typeCentres.map(centre => {
                    const capacity = capacityMap.get(centre.centre_id);
                    const sports = centreSportsMap.get(centre.centre_id) || [];
                    const isClickable = centre.centre_type === "NCOE" || centre.centre_type === "STC";

                    return (
                      <div 
                        key={centre.centre_id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
                          isClickable && "cursor-pointer"
                        )}
                        onClick={() => isClickable && onCentreClick(centre)}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{centre.centre_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {centre.district ? `${centre.district}, ` : ""}{centre.state}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {sports.length > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {sports.length} sports
                            </Badge>
                          )}
                          {capacity && capacity.sanctioned > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                              <Users className="h-3 w-3" />
                              <span>{capacity.existing}/{capacity.sanctioned}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
