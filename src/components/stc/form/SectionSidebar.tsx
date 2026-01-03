import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, Users, Dumbbell, Home, UserCheck, Heart, 
  Wrench, Trophy, Target, Paperclip, FileCheck, ChevronLeft,
  ChevronRight, AlertCircle, CheckCircle2
} from "lucide-react";
import type { FormSection } from "../utils/formConfig";

const SECTION_ICONS = [
  Building2,   // Section 1: Centre Identity
  Users,       // Section 2: Disciplines & Strength
  Dumbbell,    // Section 3: Infrastructure
  Home,        // Section 4: Hostel
  UserCheck,   // Section 5: Staff
  Heart,       // Section 6: Medical
  Wrench,      // Section 7: Equipment
  Trophy,      // Section 8: Talent & Competitions
  Target,      // Section 9: Discipline-Specific
  Paperclip,   // Section 10: Attachments
];

interface SectionSidebarProps {
  sections: FormSection[];
  currentSection: number;
  onSectionChange: (index: number) => void;
  sectionProgress: number[];
  validationErrors: Record<number, Record<string, string>>;
  isOpen: boolean;
  onToggle: () => void;
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
      {/* Toggle Button (Mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 left-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-card border-r border-border",
        "transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-16",
        "lg:translate-x-0",
        !isOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Overall Progress */}
          {isOpen && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Section Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {sections.map((section, index) => {
              const Icon = SECTION_ICONS[index] || FileCheck;
              const progress = sectionProgress[index] || 0;
              const hasErrors = Object.keys(validationErrors[index] || {}).length > 0;
              const isComplete = progress === 100 && !hasErrors;
              const isCurrent = index === currentSection;

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-left group hover:bg-secondary/50",
                    isCurrent && "bg-primary/10 text-primary border border-primary/20",
                    !isCurrent && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    isCurrent && "bg-primary text-primary-foreground",
                    isComplete && !isCurrent && "bg-accent text-accent-foreground",
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
                  </div>

                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{section.title}</span>
                        <span className={cn(
                          "text-xs font-semibold",
                          isComplete && "text-accent",
                          hasErrors && "text-destructive"
                        )}>
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-1 mt-1" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Review Section */}
            <button
              onClick={() => onSectionChange(sections.length)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                "text-left group hover:bg-secondary/50 mt-4 border-t border-border pt-4",
                currentSection === sections.length && "bg-primary/10 text-primary border border-primary/20",
                currentSection !== sections.length && "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                currentSection === sections.length && "bg-primary text-primary-foreground",
                currentSection !== sections.length && "bg-secondary text-secondary-foreground"
              )}>
                <FileCheck className="h-4 w-4" />
              </div>
              {isOpen && (
                <span className="text-sm font-medium">Review & Submit</span>
              )}
            </button>
          </nav>

          {/* Collapse Toggle (Desktop) */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex mt-4 justify-center"
            onClick={onToggle}
          >
            {isOpen ? (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
