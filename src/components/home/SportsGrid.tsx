import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Target, Trophy, MapPin, Users, Search,
  Waves, Bike, Dumbbell, Swords, Crosshair,
  Footprints, CircleDot, Medal, Sailboat, Mountain,
  Volleyball, Timer, Wind, Snowflake, Flag,
  Zap, Flame, Crown, Shield, type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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

// Sport to icon mapping
const getSportIcon = (sportName: string): LucideIcon => {
  const name = sportName.toLowerCase();
  
  // Water sports
  if (name.includes("aquatic") || name.includes("swim") || name.includes("diving") || name.includes("water polo")) return Waves;
  if (name.includes("rowing") || name.includes("canoe") || name.includes("kayak")) return Waves;
  if (name.includes("sailing") || name.includes("yacht")) return Sailboat;
  
  // Target sports
  if (name.includes("archery")) return Target;
  if (name.includes("shooting")) return Crosshair;
  
  // Combat sports
  if (name.includes("fencing")) return Swords;
  if (name.includes("boxing") || name.includes("wrestling") || name.includes("judo") || name.includes("taekwondo") || name.includes("karate")) return Shield;
  if (name.includes("wushu") || name.includes("martial")) return Zap;
  
  // Athletics & running
  if (name.includes("athletic") || name.includes("marathon") || name.includes("triathlon")) return Footprints;
  
  // Cycling
  if (name.includes("cycling") || name.includes("cycle")) return Bike;
  
  // Strength sports
  if (name.includes("weightlifting") || name.includes("powerlifting")) return Dumbbell;
  
  // Ball sports
  if (name.includes("badminton") || name.includes("tennis") || name.includes("squash")) return CircleDot;
  if (name.includes("volleyball") || name.includes("handball")) return Volleyball;
  if (name.includes("football") || name.includes("soccer") || name.includes("hockey") || name.includes("cricket") || name.includes("kabaddi") || name.includes("kho")) return CircleDot;
  if (name.includes("basketball") || name.includes("netball")) return CircleDot;
  if (name.includes("golf")) return Flag;
  if (name.includes("baseball") || name.includes("softball")) return CircleDot;
  
  // Winter sports
  if (name.includes("ski") || name.includes("ice") || name.includes("curling") || name.includes("snow")) return Snowflake;
  
  // Other
  if (name.includes("climbing") || name.includes("mountain")) return Mountain;
  if (name.includes("equestrian") || name.includes("horse")) return Crown;
  if (name.includes("gymnastics") || name.includes("trampoline")) return Flame;
  if (name.includes("modern pentathlon")) return Medal;
  if (name.includes("chess") || name.includes("bridge")) return Crown;
  
  // Default
  return Medal;
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
  const ncoe = sport.ncoe_centres || 0;
  const stc = sport.stc_centres || 0;
  const kic = sport.kic_centres || 0;
  const kisce = sport.kisce_centres || 0;
  const totalCentres = ncoe + stc + kic + kisce;
  
  const athletes = sport.existing_athletes || 0;
  const capacity = sport.sanctioned_capacity || 0;
  // Readiness = (existing athletes / sanctioned capacity) × 100
  const readiness = capacity > 0 ? Math.round((athletes / capacity) * 100) : 0;

  const sizeClasses = {
    large: "min-w-[260px] md:min-w-[280px] p-4",
    medium: "min-w-[220px] md:min-w-[240px] p-3",
    small: "min-w-[160px] md:min-w-[180px] p-2.5",
  };

  // Build centre breakdown for tooltip
  const centreBreakdown = [
    ncoe > 0 && `${ncoe} NCOE`,
    stc > 0 && `${stc} STC`,
    kic > 0 && `${kic} KIC`,
    kisce > 0 && `${kisce} KISCE`,
  ].filter(Boolean).join(" • ");

  const getReadinessColor = (pct: number) => {
    if (pct >= 80) return "text-india-green";
    if (pct >= 50) return "text-saffron";
    return "text-muted-foreground";
  };

  return (
    <Link
      to={`/sport/${sport.sport_id}`}
      className={cn(
        "group relative overflow-hidden rounded-xl bg-card shadow-sm border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-1 hover:border-primary/30",
        isGap && "border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
        sizeClasses[size],
        "animate-fade-in flex-shrink-0"
      )}
      style={{ animationDelay: `${Math.min(index, 20) * 40}ms` }}
    >
      {/* Top row: Games dots + Priority Badges */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {sport.present_la28 && (
            <div className="h-2 w-2 rounded-full bg-saffron" title="LA 2028" />
          )}
          {sport.present_ag2026 && (
            <div className="h-2 w-2 rounded-full bg-india-green" title="AG 2026" />
          )}
        </div>
        <div className="flex gap-1">
          {sport.is_tops && <PriorityBadge type="tops" />}
          {sport.is_tagg && <PriorityBadge type="tagg" />}
          {sport.is_teams && <PriorityBadge type="teams" />}
        </div>
      </div>

      {/* Icon + Name row */}
      <div className="flex items-start gap-2.5 mb-3">
        {(() => {
          const SportIcon = getSportIcon(sport.sport_name);
          return (
            <div className={cn(
              "flex items-center justify-center rounded-lg flex-shrink-0",
              "bg-gradient-to-br from-saffron/10 to-saffron/5 border border-saffron/20",
              size === "large" ? "h-10 w-10" : size === "medium" ? "h-9 w-9" : "h-7 w-7",
            )}>
              <SportIcon className={cn(
                "text-saffron", 
                size === "large" ? "h-5 w-5" : size === "medium" ? "h-4 w-4" : "h-3.5 w-3.5"
              )} />
            </div>
          );
        })()}
        
        <div className="min-w-0 flex-1">
          <h4 className={cn(
            "font-bold uppercase tracking-wide line-clamp-2 group-hover:text-saffron transition-colors leading-tight text-foreground",
            size === "large" ? "text-sm" : size === "medium" ? "text-xs" : "text-[11px]"
          )}>
            {sport.sport_name}
          </h4>
        </div>
      </div>

      {/* Stats Grid - compact 2-column layout */}
      <div className={cn(
        "grid gap-x-3 gap-y-1.5",
        size === "small" ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Events */}
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3 w-3 text-saffron flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{sport.la28_events || 0}</span> LA28
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy className="h-3 w-3 text-india-green flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{sport.ag2026_events || 0}</span> AG26
          </span>
        </div>

        {/* Centres */}
        <div className="flex items-center gap-1.5" title={centreBreakdown || undefined}>
          <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCentres}</span> centres
          </span>
        </div>

        {/* Readiness (capacity utilization) */}
        {size !== "small" && capacity > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
            <span className={cn("text-[10px] font-semibold", getReadinessColor(readiness))}>
              {readiness}%
            </span>
            <span className="text-[10px] text-muted-foreground">filled</span>
          </div>
        )}
      </div>

      {/* Capacity bar for large cards */}
      {size === "large" && capacity > 0 && (
        <div className="mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Athletes: {athletes.toLocaleString()}</span>
            <span>/ {capacity.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                readiness >= 80 ? "bg-india-green" : readiness >= 50 ? "bg-saffron" : "bg-primary"
              )}
              style={{ width: `${Math.min(readiness, 100)}%` }}
            />
          </div>
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
