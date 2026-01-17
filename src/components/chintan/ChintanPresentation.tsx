import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MasterSlide } from "./MasterSlide";
import { SlideNavigation } from "./SlideNavigation";
import { Slide1Cover } from "./slides/Slide1Cover";
import { Slide2Journey } from "./slides/Slide2Journey";
import { Slide3Anchor } from "./slides/Slide3Anchor";
import { Slide4Framework } from "./slides/Slide4Framework";
import { Slide5Pillars } from "./slides/Slide5Pillars";
import { Slide6Timing } from "./slides/Slide6Timing";
import { Slide7Venues } from "./slides/Slide7Venues";
import { Slide8Logistics } from "./slides/Slide8Logistics";
import { Slide9Decisions } from "./slides/Slide9Decisions";
import { Slide10Branding } from "./slides/Slide10Branding";

const TOTAL_SLIDES = 10;

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
  Slide1Cover,
  Slide2Journey,
  Slide3Anchor,
  Slide4Framework,
  Slide5Pillars,
  Slide6Timing,
  Slide7Venues,
  Slide8Logistics,
  Slide9Decisions,
  Slide10Branding,
];

export const ChintanPresentation = () => {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);

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
        goToSlide(parseInt(e.key) - 1);
      } else if (e.key === "0") {
        goToSlide(9);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paginate, goToSlide]);

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

  return (
    <div className="relative h-screen w-screen overflow-hidden chintan-mesh-bg">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          <MasterSlide>
            <CurrentSlideComponent />
          </MasterSlide>
        </motion.div>
      </AnimatePresence>

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onGoTo={goToSlide}
      />
    </div>
  );
};
