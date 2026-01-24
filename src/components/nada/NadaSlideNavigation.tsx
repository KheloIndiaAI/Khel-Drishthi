import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface NadaSlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onExport?: () => void;
  isExporting?: boolean;
  exportProgress?: number;
}

export const NadaSlideNavigation = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoTo,
  onExport,
  isExporting = false,
  exportProgress = 0,
}: NadaSlideNavigationProps) => {
  return (
    <>
      {/* Previous/Next buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={currentSlide === 0 || isExporting}
          className="rounded-full bg-background/80 backdrop-blur-sm border-[hsl(210,100%,40%)]/20 hover:bg-background hover:border-[hsl(210,100%,40%)]/40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => onGoTo(index)}
              disabled={isExporting}
              className="relative w-2 h-2 rounded-full bg-[hsl(210,100%,40%)]/20 hover:bg-[hsl(210,100%,40%)]/40 transition-colors disabled:opacity-50"
            >
              {currentSlide === index && (
                <motion.div
                  layoutId="nadaActiveDot"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]"
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
          disabled={currentSlide === totalSlides - 1 || isExporting}
          className="rounded-full bg-background/80 backdrop-blur-sm border-[hsl(210,100%,40%)]/20 hover:bg-background hover:border-[hsl(210,100%,40%)]/40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Export button */}
      {onExport && (
        <div className="absolute bottom-8 left-8 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="gap-2 bg-background/80 backdrop-blur-sm border-[hsl(210,100%,40%)]/20 hover:bg-background hover:border-[hsl(210,100%,40%)]/40"
          >
            <Download className="h-4 w-4" />
            {isExporting ? `Exporting ${exportProgress}%` : "Export PDF"}
          </Button>
        </div>
      )}

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 text-sm text-muted-foreground z-20">
        {currentSlide + 1} / {totalSlides}
      </div>
    </>
  );
};
