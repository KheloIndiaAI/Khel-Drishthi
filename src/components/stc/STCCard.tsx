import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Award, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface STCCardProps {
  centreId: string;
  centreName: string;
  state: string;
  disciplines: string[];
  athleteCount: number;
  formProgress: number;
  onClick: () => void;
}

export const STCCard: React.FC<STCCardProps> = ({
  centreId,
  centreName,
  state,
  disciplines,
  athleteCount,
  formProgress,
  onClick,
}) => {
  const isComplete = formProgress === 100;
  const isStarted = formProgress > 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 overflow-hidden",
          "hover:shadow-lg hover:border-primary/50",
          isComplete && "border-accent/50 bg-accent/5"
        )}
        onClick={onClick}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-foreground line-clamp-1">
                {centreName}
              </h3>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="text-sm">{state}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isComplete ? (
                <Badge variant="default" className="bg-accent text-accent-foreground gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
                </Badge>
              ) : isStarted ? (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  In Progress
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium">{athleteCount}</span>
              <span className="text-muted-foreground">athletes</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Award className="h-4 w-4 text-accent" />
              <span className="font-medium">{disciplines.length}</span>
              <span className="text-muted-foreground">disciplines</span>
            </div>
          </div>

          {/* Disciplines */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {disciplines.slice(0, 3).map((discipline) => (
              <Badge key={discipline} variant="outline" className="text-xs">
                {discipline}
              </Badge>
            ))}
            {disciplines.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{disciplines.length - 3} more
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Form completion</span>
              <span className="font-medium text-foreground">{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>

          {/* Action */}
          <div className="flex items-center justify-end mt-4 text-primary">
            <span className="text-sm font-medium">
              {isComplete ? 'View Report' : isStarted ? 'Continue' : 'Start Form'}
            </span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
