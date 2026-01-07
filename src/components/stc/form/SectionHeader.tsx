import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Building2, Users, Dumbbell, Home, UserCheck, 
  Wrench, Trophy, Eye, Paperclip, CheckCircle2
} from "lucide-react";

const SECTION_ICONS = [
  Building2,   // Identity
  Users,       // Disciplines
  Dumbbell,    // Infrastructure
  Home,        // Hostel
  UserCheck,   // HR
  Wrench,      // Equipment
  Trophy,      // Talent
  Eye,         // Vision
  Paperclip,   // Attachments
];

interface SectionHeaderProps {
  title: string;
  description?: string;
  sectionIndex: number;
  progress: number;
  isComplete: boolean;
}

export function SectionHeader({
  title,
  description,
  sectionIndex,
  progress,
  isComplete,
}: SectionHeaderProps) {
  const Icon = SECTION_ICONS[sectionIndex] || Building2;
  
  const getProgressColor = (value: number) => {
    if (value === 100) return "bg-accent";
    if (value >= 70) return "bg-accent/80";
    if (value >= 30) return "bg-warning";
    return "bg-destructive/70";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border pb-5 mb-6"
    >
      <div className="flex items-start gap-4">
        {/* Icon container */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
          "bg-primary/10 text-primary transition-colors",
          isComplete && "bg-accent/10 text-accent"
        )}>
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <CheckCircle2 className="h-6 w-6" />
            </motion.div>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {title}
            </h2>
            <Badge 
              variant={isComplete ? "default" : "secondary"}
              className={cn(
                "transition-colors",
                isComplete && "bg-accent text-accent-foreground"
              )}
            >
              {progress}% Complete
            </Badge>
          </div>
          
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
          
          {/* Progress bar */}
          <div className="mt-3 max-w-md">
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <motion.div
                className={cn("h-full rounded-full", getProgressColor(progress))}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
