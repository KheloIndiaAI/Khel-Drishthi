import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  questionCount: number;
}

interface ProgressTrackerProps {
  sections: Section[];
  currentSection: number;
  currentQuestion: number;
  totalQuestions: number;
  completedSections: number[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  sections,
  currentSection,
  currentQuestion,
  totalQuestions,
  completedSections,
}) => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Section Pills */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto">
            {sections.map((section, idx) => {
              const isCompleted = completedSections.includes(idx);
              const isCurrent = idx === currentSection;
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    isCompleted && "bg-accent/20 text-accent",
                    isCurrent && !isCompleted && "bg-primary/20 text-primary",
                    !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Circle className="h-4 w-4 fill-current" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="hidden lg:inline whitespace-nowrap">{section.title}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile Section Indicator */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {sections[currentSection]?.title}
            </span>
          </div>

          {/* Progress Percentage & Milestones */}
          <div className="flex items-center gap-4">
            {/* Milestone Badges */}
            <div className="hidden sm:flex items-center gap-2">
              {[25, 50, 75, 100].map((milestone) => (
                <motion.div
                  key={milestone}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: progress >= milestone ? 1 : 0.8,
                    opacity: progress >= milestone ? 1 : 0.3
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                    progress >= milestone
                      ? "bg-gradient-to-br from-primary to-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {milestone === 100 ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    `${milestone}%`
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress Number */}
            <motion.div
              key={progress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-2xl font-display font-bold text-primary"
            >
              {progress}%
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
