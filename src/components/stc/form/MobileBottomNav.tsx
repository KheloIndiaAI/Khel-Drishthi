import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, ChevronRight, Menu, CheckCircle2, Save, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileBottomNavProps {
  currentSection: number;
  totalSections: number;
  sectionProgress: number[];
  onPrevious: () => void;
  onNext: () => void;
  onOpenSidebar: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isReviewSection: boolean;
}

export function MobileBottomNav({
  currentSection,
  totalSections,
  sectionProgress,
  onPrevious,
  onNext,
  onOpenSidebar,
  saveStatus,
  isReviewSection,
}: MobileBottomNavProps) {
  const overallProgress = sectionProgress.length > 0
    ? Math.round(sectionProgress.reduce((a, b) => a + b, 0) / sectionProgress.length)
    : 0;

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Progress bar at top of nav */}
      <div className="h-1 bg-secondary">
        <motion.div 
          className={cn(
            "h-full transition-colors duration-300",
            overallProgress < 30 && "bg-destructive",
            overallProgress >= 30 && overallProgress < 70 && "bg-warning",
            overallProgress >= 70 && "bg-accent"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      
      <div className="bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 safe-area-bottom">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Save Status */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl touch-target"
              onClick={onOpenSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={saveStatus}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                {saveStatus === 'saving' && (
                  <>
                    <Save className="h-3.5 w-3.5 animate-pulse text-primary" />
                    <span>Saving</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                    <span>Saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    <span>Error</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: Section indicator */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalSections + 1 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === currentSection ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30",
                  i < currentSection && sectionProgress[i] === 100 && "bg-accent/60"
                )}
                layoutId={`dot-${i}`}
              />
            ))}
          </div>

          {/* Right: Navigation buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl touch-target"
              onClick={onPrevious}
              disabled={currentSection === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              size="icon"
              className="h-11 w-11 rounded-xl touch-target"
              onClick={onNext}
              disabled={isReviewSection}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
