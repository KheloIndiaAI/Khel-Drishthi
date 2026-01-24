import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NadaSlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
}

export const NadaSlideNavigation = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoTo,
}: NadaSlideNavigationProps) => {
  return (
    <>
      {/* Previous/Next buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              className="relative w-2 h-2 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors"
            >
              {currentSlide === index && (
                <motion.div
                  layoutId="nadaActiveDot"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentSlide === totalSlides - 1}
          className="rounded-full bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 text-sm text-muted-foreground z-20">
        {currentSlide + 1} / {totalSlides}
      </div>
    </>
  );
};
