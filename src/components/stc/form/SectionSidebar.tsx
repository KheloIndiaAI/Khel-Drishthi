import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Users, Dumbbell, Home, UserCheck, Heart, 
  Wrench, Trophy, Target, Paperclip, FileCheck, ChevronLeft,
  ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";
import type { FormSection } from "../utils/formConfig";

const SECTION_ICONS = [
  Building2,
  Users,
  Dumbbell,
  Home,
  UserCheck,
  Heart,
  Wrench,
  Trophy,
  Target,
  Paperclip,
];

const SECTION_SHORT_TITLES: Record<string, string> = {
  'identity': 'Centre Identity',
  'disciplines': 'Disciplines',
  'infrastructure': 'Infrastructure',
  'hostel': 'Hostel',
  'staff': 'Staff',
  'medical': 'Medical',
  'equipment': 'Equipment',
  'talent': 'Talent',
  'disciplineSpecific': 'Discipline',
  'attachments': 'Attachments',
};

interface SectionSidebarProps {
  sections: FormSection[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  sectionProgress: number[];
  validationErrors: Record<number, Record<string, string>>;
  isOpen: boolean;
  onToggle: () => void;
}

function getProgressColor(value: number): string {
  if (value === 100) return "bg-accent";
  if (value >= 70) return "bg-accent/70";
  if (value >= 30) return "bg-warning";
  return "bg-destructive/60";
}

export function SectionSidebar({
  sections,
  currentSection,
  onSectionChange,
  sectionProgress,
  validationErrors,
  isOpen,
  onToggle,
}: SectionSidebarProps) {
  const overallProgress = sectionProgress.length > 0
    ? Math.round(sectionProgress.reduce((a, b) => a + b, 0) / sectionProgress.length)
    : 0;

  return (
    <>
      {/* Toggle Button (Mobile) - Always visible */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-20 left-3 z-50 lg:hidden bg-card shadow-md h-10 w-10 touch-target",
          isOpen && "hidden"
        )}
        onClick={onToggle}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "sticky top-0 h-[calc(100vh-56px)] bg-card border-r border-border flex-shrink-0",
        "transition-all duration-300 ease-in-out z-40",
        isOpen ? "w-64 lg:w-72" : "w-0 lg:w-16",
        "fixed lg:relative lg:translate-x-0",
        !isOpen && "-translate-x-full lg:translate-x-0",
        "overflow-hidden"
      )}>
        <div className="flex flex-col h-full w-64 lg:w-auto">
          {/* Header with toggle */}
          <div className="p-3 border-b border-border flex items-center justify-between bg-card">
            {isOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-foreground"
              >
                Sections
              </motion.span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 ml-auto"
              onClick={onToggle}
            >
              {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          {/* Overall Progress */}
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 border-b border-border bg-secondary/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Overall Progress</span>
                <span className={cn(
                  "text-sm font-bold",
                  overallProgress < 30 && "text-destructive",
                  overallProgress >= 30 && overallProgress < 70 && "text-warning",
                  overallProgress >= 70 && "text-accent"
                )}>
                  {overallProgress}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className={cn("h-full rounded-full", getProgressColor(overallProgress))}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {/* Section Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-2 space-y-1">
              {sections.map((section, index) => {
                const Icon = SECTION_ICONS[index] || FileCheck;
                const progress = sectionProgress[index] || 0;
                const hasErrors = Object.keys(validationErrors[index] || {}).length > 0;
                const isComplete = progress === 100 && !hasErrors;
                const isCurrent = index === currentSection;
                const shortTitle = SECTION_SHORT_TITLES[section.id] || section.title;

                return (
                  <motion.button
                    key={section.id}
                    onClick={() => onSectionChange(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target",
                      "text-left group",
                      isCurrent && "bg-primary/10 text-primary shadow-sm",
                      !isCurrent && "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {/* Icon with status indicator */}
                    <div className={cn(
                      "relative flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      isCurrent && "bg-primary text-primary-foreground",
                      isComplete && !isCurrent && "bg-accent/20 text-accent",
                      hasErrors && "bg-destructive/10 text-destructive",
                      !isCurrent && !isComplete && !hasErrors && "bg-secondary text-secondary-foreground"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : hasErrors ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      
                      {/* Progress ring for non-complete sections */}
                      {!isComplete && !isOpen && (
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${progress} 100`}
                            className="opacity-30"
                          />
                        </svg>
                      )}
                    </div>

                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{shortTitle}</span>
                          <span className={cn(
                            "text-xs font-semibold flex-shrink-0 tabular-nums",
                            isComplete && "text-accent",
                            hasErrors && "text-destructive",
                            !isComplete && !hasErrors && "text-muted-foreground"
                          )}>
                            {progress}%
                          </span>
                        </div>
                        {/* Progress bar with color gradient */}
                        <div className="relative h-1.5 mt-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className={cn("h-full rounded-full", getProgressColor(progress))}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}

              {/* Review Section */}
              <div className="pt-3 mt-2 border-t border-border">
                <motion.button
                  onClick={() => onSectionChange(sections.length)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target",
                    "text-left group",
                    currentSection === sections.length && "bg-primary/10 text-primary shadow-sm",
                    currentSection !== sections.length && "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
                    currentSection === sections.length && "bg-primary text-primary-foreground",
                    currentSection !== sections.length && "bg-secondary text-secondary-foreground"
                  )}>
                    <FileCheck className="h-4 w-4" />
                  </div>
                  {isOpen && (
                    <span className="text-sm font-medium">Review & Submit</span>
                  )}
                </motion.button>
              </div>
            </nav>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
