import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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

// Shorter titles for sidebar display
const SECTION_SHORT_TITLES: Record<string, string> = {
  'identity': 'Centre Identity',
  'disciplines': 'Disciplines & Strength',
  'infrastructure': 'Infrastructure & FoP',
  'hostel': 'Hostel & Amenities',
  'staff': 'Coaches & Staff',
  'medical': 'Medical Services',
  'equipment': 'Equipment & S&C',
  'talent': 'Talent & Competitions',
  'disciplineSpecific': 'Discipline Questions',
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
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-background shadow-md"
        onClick={onToggle}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </Button>

      {/* Sidebar - sticky within flex container */}
      <aside className={cn(
        "sticky top-0 h-[calc(100vh-56px)] bg-card border-r border-border flex-shrink-0",
        "transition-all duration-300 ease-in-out",
        isOpen ? "w-72" : "w-16",
        // Mobile: fixed overlay
        "fixed lg:relative lg:translate-x-0 z-40",
        !isOpen && "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Overall Progress - fixed at top */}
          {isOpen && (
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Overall Progress</span>
                <span className="text-sm font-bold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Section Navigation - scrollable */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-1">
              {sections.map((section, index) => {
                const Icon = SECTION_ICONS[index] || FileCheck;
                const progress = sectionProgress[index] || 0;
                const hasErrors = Object.keys(validationErrors[index] || {}).length > 0;
                const isComplete = progress === 100 && !hasErrors;
                const isCurrent = index === currentSection;
                const shortTitle = SECTION_SHORT_TITLES[section.id] || section.title;

                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      "text-left group hover:bg-secondary/50",
                      isCurrent && "bg-primary/10 text-primary border-l-2 border-primary",
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
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium leading-tight">{shortTitle}</span>
                          <span className={cn(
                            "text-xs font-semibold flex-shrink-0",
                            isComplete && "text-accent",
                            hasErrors && "text-destructive"
                          )}>
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1 mt-1.5" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Review Section */}
              <div className="pt-3 mt-3 border-t border-border">
                <button
                  onClick={() => onSectionChange(sections.length)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    "text-left group hover:bg-secondary/50",
                    currentSection === sections.length && "bg-primary/10 text-primary border-l-2 border-primary",
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
              </div>
            </nav>
          </ScrollArea>

          {/* Collapse Toggle (Desktop) - fixed at bottom */}
          <div className="p-4 border-t border-border bg-card">
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex w-full justify-center"
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
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
