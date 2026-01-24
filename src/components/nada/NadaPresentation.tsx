import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NadaMasterSlide } from "./NadaMasterSlide";
import { NadaSlideNavigation } from "./NadaSlideNavigation";
import { NadaSlide1Cover } from "./slides/NadaSlide1Cover";

const TOTAL_SLIDES = 1;

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
  NadaSlide1Cover,
  // More slides will be added here
];

export const NadaPresentation = () => {
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
        const slideIndex = parseInt(e.key) - 1;
        if (slideIndex < TOTAL_SLIDES) goToSlide(slideIndex);
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
            x: { type: "tween", ease: "easeInOut", duration: 0.5 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0"
        >
          <NadaMasterSlide>
            <CurrentSlideComponent />
          </NadaMasterSlide>
        </motion.div>
      </AnimatePresence>

      <NadaSlideNavigation
        currentSlide={currentSlide}
        totalSlides={TOTAL_SLIDES}
        onPrev={() => paginate(-1)}
        onNext={() => paginate(1)}
        onGoTo={goToSlide}
      />
    </div>
  );
};
