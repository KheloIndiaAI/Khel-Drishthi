import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, PartyPopper, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface SectionTransitionProps {
  sectionTitle: string;
  sectionNumber: number;
  totalSections: number;
  onContinue: () => void;
  isLastSection?: boolean;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  sectionTitle,
  sectionNumber,
  totalSections,
  onContinue,
  isLastSection = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    const timer = setTimeout(() => {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9933', '#138808', '#000080'],
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-8 shadow-lg"
      >
        {isLastSection ? (
          <PartyPopper className="h-12 w-12 text-accent-foreground" />
        ) : (
          <Check className="h-12 w-12 text-accent-foreground" />
        )}
      </motion.div>

      {/* Celebration Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 mb-8"
      >
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-lg font-medium">Section Complete!</span>
          <Sparkles className="h-5 w-5" />
        </div>

        <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
          {isLastSection ? 'All Sections Complete!' : `${sectionTitle} Done!`}
        </h2>

        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          {isLastSection
            ? 'Great work! You have completed all sections. Click below to view your comprehensive STC report.'
            : `You've completed section ${sectionNumber} of ${totalSections}. Ready for the next one?`}
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mb-8"
      >
        {Array.from({ length: totalSections }).map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className={`w-3 h-3 rounded-full ${
              idx < sectionNumber
                ? 'bg-accent'
                : idx === sectionNumber && isLastSection
                ? 'bg-accent'
                : 'bg-muted'
            }`}
          />
        ))}
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-2 text-lg px-8 py-6"
        >
          {isLastSection ? (
            <>
              View Report
              <PartyPopper className="h-5 w-5" />
            </>
          ) : (
            <>
              Continue to Next Section
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Achievement Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium"
      >
        🏆 {sectionNumber} of {totalSections} sections completed
      </motion.div>
    </motion.div>
  );
};
