import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Target, Trophy, MapPin, Users, Search, Medal, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Sport {
  sport_id: string;
  sport_name: string;
  present_la28: boolean;
  present_ag2026: boolean;
  la28_events: number;
  ag2026_events: number;
  ncoe_centres: number;
  stc_centres: number;
  kic_centres?: number;
  kisce_centres?: number;
  is_tops?: boolean;
  is_tagg?: boolean;
  is_teams?: boolean;
  sport_category?: string;
  existing_athletes?: number;
  sanctioned_capacity?: number;
}

interface SportsGridProps {
  sports: Sport[];
}

type FilterType = "all" | "tops" | "tagg" | "teams" | "gaps";

const FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "" },
  { key: "tops", label: "TOPS", emoji: "🏆" },
  { key: "tagg", label: "TAGG", emoji: "🎯" },
  { key: "teams", label: "TEAMS", emoji: "👥" },
  { key: "gaps", label: "Gaps", emoji: "⚠️" },
];

const SECTION_HEADERS: Record<string, { title: string; subtitle: string; emoji: string }> = {
  tops: { title: "TOPS", subtitle: "Target Olympic Podium Scheme", emoji: "🏆" },
  tagg: { title: "TAGG", subtitle: "Target Asian Games Group", emoji: "🎯" },
  teams: { title: "TEAMS", subtitle: "Training of Elite Athlete Management Support", emoji: "👥" },
  gaps: { title: "Infrastructure Gaps", subtitle: "Sports with demand but limited supply", emoji: "⚠️" },
  other: { title: "Other Sports", subtitle: "", emoji: "" },
};

// Priority badge component
const PriorityBadge = ({ type }: { type: "tops" | "tagg" | "teams" }) => {
  const config = {
    tops: { label: "TOPS", bg: "bg-yellow-500", text: "text-yellow-900" },
    tagg: { label: "TAGG", bg: "bg-blue-500", text: "text-white" },
    teams: { label: "TEAMS", bg: "bg-purple-500", text: "text-white" },
  };
  const { label, bg, text } = config[type];
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", bg, text)}>
      {label}
    </span>
  );
};

// Sport Card Component
interface SportCardProps {
  sport: Sport;
  size: "large" | "medium" | "small";
  index: number;
  isGap?: boolean;
}

const SportCard = ({ sport, size, index, isGap }: SportCardProps) => {
  const totalCentres = (sport.ncoe_centres || 0) + (sport.stc_centres || 0) + (sport.kic_centres || 0) + (sport.kisce_centres || 0);
  const athletes = sport.existing_athletes || 0;
  const capacity = sport.sanctioned_capacity || 0;
  const readiness = capacity > 0 ? Math.round((athletes / capacity) * 100) : 0;

  const sizeClasses = {
    large: "min-w-[280px] md:min-w-[300px] p-4",
    medium: "min-w-[240px] md:min-w-[260px] p-3",
    small: "min-w-[180px] md:min-w-[200px] p-3",
  };

  const iconSizes = {
    large: "h-10 w-10",
    medium: "h-8 w-8",
    small: "h-6 w-6",
  };

  return (
    <Link
      to={`/sport/${sport.sport_id}`}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-sm border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-1",
        isGap && "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
        sizeClasses[size],
        "animate-fade-in flex-shrink-0"
      )}
      style={{ animationDelay: `${Math.min(index, 20) * 40}ms` }}
    >
      {/* Priority Badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {sport.is_tops && <PriorityBadge type="tops" />}
        {sport.is_tagg && <PriorityBadge type="tagg" />}
        {sport.is_teams && <PriorityBadge type="teams" />}
      </div>

      {/* Games indicators */}
      <div className="absolute top-2 left-2 flex gap-1">
        {sport.present_la28 && (
          <div className="h-2.5 w-2.5 rounded-full bg-saffron" title="LA 2028" />
        )}
        {sport.present_ag2026 && (
          <div className="h-2.5 w-2.5 rounded-full bg-india-green" title="AG 2026" />
        )}
      </div>

      {/* Icon + Name */}
      <div className="mt-4 mb-3">
        <div className={cn(
          "mb-2 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/10",
          iconSizes[size],
          size === "large" && "h-12 w-12",
        )}>
          <Target className={cn("text-primary", size === "large" ? "h-6 w-6" : size === "medium" ? "h-5 w-5" : "h-4 w-4")} />
        </div>
        <h4 className={cn(
          "font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight",
          size === "large" ? "text-base" : size === "medium" ? "text-sm" : "text-xs"
        )}>
          {sport.sport_name}
        </h4>
      </div>

      {/* Events */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <Trophy className="h-3 w-3" />
        <span>LA28: {sport.la28_events || 0}</span>
        <span className="text-border">|</span>
        <span>AG26: {sport.ag2026_events || 0}</span>
      </div>

      {/* Centres */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <MapPin className="h-3 w-3" />
        <span>{totalCentres} centres</span>
      </div>

      {/* Athletes / Capacity */}
      {(size === "large" || size === "medium") && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Users className="h-3 w-3" />
          <span>{athletes.toLocaleString()} / {capacity.toLocaleString()} capacity</span>
        </div>
      )}

      {/* Readiness Progress */}
      {size === "large" && capacity > 0 && (
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Readiness</span>
            <span className={cn(
              "font-semibold",
              readiness >= 80 ? "text-india-green" : readiness >= 50 ? "text-saffron" : "text-destructive"
            )}>
              {readiness}%
            </span>
          </div>
          <Progress 
            value={readiness} 
            className="h-1.5"
          />
        </div>
      )}
    </Link>
  );
};

// Section Component
interface SectionProps {
  sectionKey: string;
  sports: Sport[];
  size: "large" | "medium" | "small";
}

const Section = ({ sectionKey, sports, size }: SectionProps) => {
  if (sports.length === 0) return null;
  
  const header = SECTION_HEADERS[sectionKey];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {header.emoji && <span className="text-xl">{header.emoji}</span>}
        <div>
          <h3 className="font-display text-lg font-semibold">{header.title}</h3>
          {header.subtitle && (
            <p className="text-xs text-muted-foreground">{header.subtitle}</p>
          )}
        </div>
        <span className="ml-auto text-sm text-muted-foreground">{sports.length} sports</span>
      </div>
      
      {/* Horizontal scrollable container for TAGG/TEAMS/Other, grid for TOPS */}
      {size === "large" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sports.map((sport, index) => (
            <SportCard 
              key={sport.sport_id} 
              sport={sport} 
              size={size} 
              index={index}
              isGap={sectionKey === "gaps"}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
          {sports.map((sport, index) => (
            <SportCard 
              key={sport.sport_id} 
              sport={sport} 
              size={size} 
              index={index}
              isGap={sectionKey === "gaps"}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SportsGrid = ({ sports }: SportsGridProps) => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Calculate filter counts
  const filterCounts = useMemo(() => ({
    all: sports.length,
    tops: sports.filter(s => s.is_tops).length,
    tagg: sports.filter(s => s.is_tagg).length,
    teams: sports.filter(s => s.is_teams).length,
    gaps: sports.filter(s => s.sport_category === "DemandOnly").length,
  }), [sports]);

  // Filter sports based on active filter and search
  const filteredSports = useMemo(() => {
    let result = sports;
    
    // Apply filter
    if (activeFilter === "tops") result = result.filter(s => s.is_tops);
    else if (activeFilter === "tagg") result = result.filter(s => s.is_tagg);
    else if (activeFilter === "teams") result = result.filter(s => s.is_teams);
    else if (activeFilter === "gaps") result = result.filter(s => s.sport_category === "DemandOnly");
    
    // Apply search
    if (search) {
      result = result.filter(s => 
        s.sport_name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return result;
  }, [sports, activeFilter, search]);

  // Group sports by category for grouped view
  const groupedSports = useMemo(() => {
    if (activeFilter !== "all" || search) {
      // When filtering, show flat list
      return null;
    }
    
    const tops = sports.filter(s => s.is_tops);
    const tagg = sports.filter(s => s.is_tagg && !s.is_tops);
    const teams = sports.filter(s => s.is_teams && !s.is_tops && !s.is_tagg);
    const gaps = sports.filter(s => s.sport_category === "DemandOnly" && !s.is_tops && !s.is_tagg && !s.is_teams);
    const other = sports.filter(s => !s.is_tops && !s.is_tagg && !s.is_teams && s.sport_category !== "DemandOnly");
    
    return { tops, tagg, teams, gaps, other };
  }, [sports, activeFilter, search]);

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                "border border-border/50",
                activeFilter === filter.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-accent/50"
              )}
            >
              {filter.emoji && <span className="mr-1">{filter.emoji}</span>}
              {filter.label}
              <span className="ml-1.5 text-xs opacity-70">({filterCounts[filter.key]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grouped View (default) */}
      {groupedSports ? (
        <>
          <Section sectionKey="tops" sports={groupedSports.tops} size="large" />
          <Section sectionKey="tagg" sports={groupedSports.tagg} size="medium" />
          <Section sectionKey="teams" sports={groupedSports.teams} size="medium" />
          <Section sectionKey="gaps" sports={groupedSports.gaps} size="medium" />
          <Section sectionKey="other" sports={groupedSports.other} size="small" />
        </>
      ) : (
        /* Flat filtered view */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredSports.map((sport, index) => (
            <SportCard 
              key={sport.sport_id} 
              sport={sport} 
              size={activeFilter === "tops" ? "large" : "medium"} 
              index={index}
              isGap={sport.sport_category === "DemandOnly"}
            />
          ))}
        </div>
      )}

      {/* No results */}
      {filteredSports.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No sports found matching "{search}"
        </p>
      )}
    </div>
  );
};

export default SportsGrid;
