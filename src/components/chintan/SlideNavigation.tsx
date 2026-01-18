import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  onExportPDF?: () => void;
  isExporting?: boolean;
  exportProgress?: number;
}

export const SlideNavigation = ({
  currentSlide,
  totalSlides,
  onPrev,
  onNext,
  onGoTo,
  onExportPDF,
  isExporting = false,
  exportProgress = 0,
}: SlideNavigationProps) => {
  const canGoPrev = currentSlide > 0;
  const canGoNext = currentSlide < totalSlides - 1;

  return (
    <>
      {/* Prev Button */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full 
          chintan-glass-card transition-all duration-300
          ${canGoPrev ? "opacity-100 hover:scale-110" : "opacity-30 cursor-not-allowed"}`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-[#000080]" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full 
          chintan-glass-card transition-all duration-300
          ${canGoNext ? "opacity-100 hover:scale-110" : "opacity-30 cursor-not-allowed"}`}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-[#000080]" />
      </button>

      {/* Dot Navigation */}
      <nav
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 
          chintan-glass-card px-4 py-2 rounded-full"
        aria-label="Slide navigation"
      >
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => onGoTo(index)}
            className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-[#FF9933] scale-125"
                : "bg-[#000080]/30 hover:bg-[#000080]/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? "true" : "false"}
          >
            {index === currentSlide && (
              <motion.div
                layoutId="activeDot"
                className="absolute inset-0 rounded-full bg-[#FF9933]"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Right Controls */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Export PDF Button */}
        {onExportPDF && (
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className={`chintan-glass-card px-4 py-2 rounded-lg flex items-center gap-2 
              transition-all duration-300 ${
                isExporting 
                  ? "opacity-70 cursor-wait" 
                  : "hover:scale-105 hover:shadow-lg"
              }`}
            aria-label="Export to PDF"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#000080]" />
                <span className="text-sm font-medium text-[#000080]">
                  {exportProgress}/{totalSlides}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#000080]" />
                <span className="text-sm font-medium text-[#000080]">PDF</span>
              </>
            )}
          </button>
        )}

        {/* Slide Counter */}
        <div className="chintan-glass-card px-3 py-1.5 rounded-lg">
          <span className="text-sm font-medium text-[#000080]">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>
    </>
  );
};
