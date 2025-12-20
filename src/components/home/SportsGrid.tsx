import { useState } from "react";
import { Link } from "react-router-dom";
import { Target, Trophy, MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Sport {
  sport_id: string;
  sport_name: string;
  present_la28: boolean;
  present_ag2026: boolean;
  la28_events: number;
  ag2026_events: number;
  ncoe_centres: number;
  stc_centres: number;
}

interface SportsGridProps {
  sports: Sport[];
}

const INITIAL_VISIBLE = 18;

const SportsGrid = ({ sports }: SportsGridProps) => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredSports = sports.filter((sport) =>
    sport.sport_name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleSports = showAll ? filteredSports : filteredSports.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredSports.length > INITIAL_VISIBLE;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {visibleSports.map((sport, index) => (
          <Link
            key={sport.sport_id}
            to={`/sport/${sport.sport_id}`}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-border/50",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${Math.min(index, 17) * 30}ms` }}
          >
            {/* Games Badges */}
            <div className="absolute top-2 right-2 flex gap-1">
              {sport.present_la28 && (
                <div className="h-2 w-2 rounded-full bg-saffron" title="LA 2028" />
              )}
              {sport.present_ag2026 && (
                <div className="h-2 w-2 rounded-full bg-india-green" title="AG 2026" />
              )}
            </div>

            {/* Sport Icon */}
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
              <Target className="h-5 w-5 text-primary" />
            </div>

            {/* Sport Name */}
            <h4 className="font-medium text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {sport.sport_name}
            </h4>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5" title="Events">
                <Trophy className="h-3 w-3" />
                <span>{(sport.la28_events || 0) + (sport.ag2026_events || 0)}</span>
              </div>
              <div className="flex items-center gap-0.5" title="Centres">
                <MapPin className="h-3 w-3" />
                <span>{(sport.ncoe_centres || 0) + (sport.stc_centres || 0)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show More/Less Button */}
      {hasMore && !search && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All {filteredSports.length} Sports
              </>
            )}
          </Button>
        </div>
      )}

      {/* No results */}
      {filteredSports.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No sports found matching "{search}"
        </p>
      )}
    </div>
  );
};

export default SportsGrid;
