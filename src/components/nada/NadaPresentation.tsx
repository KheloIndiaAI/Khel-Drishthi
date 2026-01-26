import { useState, useCallback, useEffect } from "react";
// NADA Presentation Component
import { AnimatePresence, motion } from "framer-motion";
import { NadaMasterSlide } from "./NadaMasterSlide";
import { NadaSlideNavigation } from "./NadaSlideNavigation";
import { NadaFullscreenToggle } from "./NadaFullscreenToggle";
import { NadaKeyboardShortcuts } from "./NadaKeyboardShortcuts";
import { NadaSlide1Title } from "./slides/NadaSlide1Title";
import { NadaSlide2Statistics } from "./slides/NadaSlide2Statistics";
import { NadaSlide3Disciplines } from "./slides/NadaSlide3Disciplines";
import { NadaSlide4Education } from "./slides/NadaSlide4Education";
import { NadaSlide5Infrastructure } from "./slides/NadaSlide5Infrastructure";
import { NadaSlide6ASP } from "./slides/NadaSlide6ASP";
import { NadaSlide7Employment } from "./slides/NadaSlide7Employment";
import { NadaSlide8Deterrence } from "./slides/NadaSlide8Deterrence";
import { NadaSlide9Global } from "./slides/NadaSlide9Global";
import { NadaSlide10Practices } from "./slides/NadaSlide10Practices";
import { NadaSlide11Proposal } from "./slides/NadaSlide11Proposal";
import { NadaSlide12Legal } from "./slides/NadaSlide12Legal";
import { NadaSlide13Synergy } from "./slides/NadaSlide13Synergy";
import { NadaSlide14Roadmap } from "./slides/NadaSlide14Roadmap";
import { NadaSlide15Closing } from "./slides/NadaSlide15Closing";

const TOTAL_SLIDES = 15;

const slideTitles = [
  "", // Title slide - no header
  "Statistical Progress",
  "High-Risk Disciplines",
  "Education & Outreach",
  "Infrastructure",
  "ASP Accountability",
  "Employment Deterrence",
  "Field Intelligence",
  "Global Approaches",
  "Best Practices",
  "Proposal",
  "Legal Framework",
  "Inter-Agency Synergy",
  "Roadmap",
  "", // Closing slide - no header
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const slideComponents = [
  NadaSlide1Title,
  NadaSlide2Statistics,
  NadaSlide3Disciplines,
  NadaSlide4Education,
  NadaSlide5Infrastructure,
  NadaSlide6ASP,
  NadaSlide7Employment,
  NadaSlide8Deterrence,
  NadaSlide9Global,
  NadaSlide10Practices,
  NadaSlide11Proposal,
  NadaSlide12Legal,
  NadaSlide13Synergy,
  NadaSlide14Roadmap,
  NadaSlide15Closing,
];

export const NadaPresentation = () => {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const paginate = useCallback((newDirection: number) => {
    setSlide(([current]) => {
      const next = current + newDirection;
      if (next < 0 || next >= TOTAL_SLIDES) return [current, 0];
      return [next, newDirection];
    });
  }, []);

  const goToSlide = useCallback((index: number) => {
    setSlide(([current]) => [index, index > current ? 1 : -1]);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        paginate(-1);
      } else if (e.key >= "1" && e.key <= "9") {
        const slideIndex = parseInt(e.key) - 1;
        if (slideIndex < TOTAL_SLIDES) goToSlide(slideIndex);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowShortcuts(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, goToSlide, toggleFullscreen]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) paginate(1);
        else paginate(-1);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [paginate]);

  const CurrentSlideComponent = slideComponents[currentSlide];
  const currentSlideTitle = slideTitles[currentSlide];

  return (
    <div className="relative h-screen w-screen overflow-hidden nada-mesh-bg">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", ease: "easeInOut", duration: 0.4 },
            opacity: { duration: 0.3 },
          }}
          className="absolute inset-0"
        >
          <NadaMasterSlide slideTitle={currentSlideTitle}>
            <CurrentSlideComponent />
          </NadaMasterSlide>
        </motion.div>
      </AnimatePresence>

      <NadaFullscreenToggle />
      
      <NadaSlideNavigation
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onGoTo={goToSlide}
      />

      <NadaKeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};
