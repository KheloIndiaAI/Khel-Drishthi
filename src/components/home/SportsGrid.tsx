import { Link } from "react-router-dom";
import { Target, Users, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

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

const SportsGrid = ({ sports }: SportsGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {sports.map((sport, index) => (
        <Link
          key={sport.sport_id}
          to={`/sport/${sport.sport_id}`}
          className={cn(
            "group relative overflow-hidden rounded-xl bg-card p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50",
            "animate-fade-in"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
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
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
            <Target className="h-6 w-6 text-primary" />
          </div>

          {/* Sport Name */}
          <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {sport.sport_name}
          </h4>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1" title="Events">
              <Trophy className="h-3 w-3" />
              <span>{(sport.la28_events || 0) + (sport.ag2026_events || 0)}</span>
            </div>
            <div className="flex items-center gap-1" title="Centres">
              <MapPin className="h-3 w-3" />
              <span>{(sport.ncoe_centres || 0) + (sport.stc_centres || 0)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SportsGrid;
