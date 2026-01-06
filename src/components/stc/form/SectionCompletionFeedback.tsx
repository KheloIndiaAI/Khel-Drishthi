import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ArrowRight, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface SectionCompletionFeedbackProps {
  isComplete: boolean;
  sectionTitle: string;
  onNextSection: () => void;
  isLastSection: boolean;
}

export function SectionCompletionFeedback({
  isComplete,
  sectionTitle,
  onNextSection,
  isLastSection,
}: SectionCompletionFeedbackProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isComplete && !hasTriggeredConfetti) {
      setShowFeedback(true);
      setHasTriggeredConfetti(true);
      
      // Trigger subtle confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF9933', '#138808', '#000080'],
        disableForReducedMotion: true,
      });
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShowFeedback(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasTriggeredConfetti]);

  // Reset when section changes
  useEffect(() => {
    if (!isComplete) {
      setHasTriggeredConfetti(false);
      setShowFeedback(false);
    }
  }, [isComplete]);

  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 lg:bottom-8"
        >
          <div className="bg-accent text-accent-foreground rounded-xl px-5 py-3 shadow-lg flex items-center gap-3">
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <PartyPopper className="h-5 w-5" />
            </motion.div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {sectionTitle} complete!
              </span>
            </div>
            
            {!isLastSection && (
              <Button
                size="sm"
                variant="secondary"
                className="ml-2 h-7 text-xs bg-accent-foreground/10 hover:bg-accent-foreground/20 text-accent-foreground"
                onClick={() => {
                  setShowFeedback(false);
                  onNextSection();
                }}
              >
                Next
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
