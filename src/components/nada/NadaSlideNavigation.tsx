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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0}
          className="rounded-full w-12 h-12 bg-background/90 border-2 border-[hsl(210,100%,40%)]/30 hover:bg-background hover:border-[hsl(210,100%,40%)]/50"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              className="relative w-3 h-3 rounded-full bg-[hsl(210,100%,40%)]/20 hover:bg-[hsl(210,100%,40%)]/40 transition-colors"
            >
              {currentSlide === index && (
                <motion.div
                  layoutId="nadaActiveDot"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
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
          className="rounded-full w-12 h-12 bg-background/90 border-2 border-[hsl(210,100%,40%)]/30 hover:bg-background hover:border-[hsl(210,100%,40%)]/50"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-12 text-base font-bold text-foreground z-20">
        {currentSlide + 1} / {totalSlides}
      </div>
    </>
  );
};
