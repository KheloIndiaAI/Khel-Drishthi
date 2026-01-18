import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { ChevronLeft, ChevronRight, MapPin, Building, Star, Plane } from "lucide-react";

const venues = [
  {
    city: "Bhuj",
    state: "Gujarat",
    properties: "Rann Utsav - Tent City",
    type: "Unique Desert Experience",
    transit: "80 km",
    transitType: "from Airport",
    highlight: "White Desert Grandeur",
  },
  {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    properties: "Novotel / Radisson",
    type: "Urban Powerhouse",
    transit: "30 min",
    transitType: "from Airport",
    highlight: "Coastal City Dynamics",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    properties: "Ananta Spa & Resorts",
    type: "Grand Scale Unified Campus",
    transit: "60 min",
    transitType: "from Airport",
    highlight: "Heritage & Hospitality",
  },
  {
    city: "Konark / Puri",
    state: "Odisha",
    properties: "Eco Retreat",
    type: "Focus Retreat Format",
    transit: "81 km",
    transitType: "from Airport",
    highlight: "Serene & Focused",
  },
  {
    city: "Bekal",
    state: "Kerala",
    properties: "Taj / Gateway",
    type: "High-Security Destination",
    transit: "70 km",
    transitType: "from Airport",
    highlight: "Premium Security Setup",
  },
];

interface Slide7VenuesProps {
  forCapture?: boolean;
}

export const Slide7Venues = ({ forCapture = false }: Slide7VenuesProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = (direction: number) => {
    setActiveIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return venues.length - 1;
      if (next >= venues.length) return 0;
      return next;
    });
  };

  // In capture mode, show the first venue as active
  const displayIndex = forCapture ? 0 : activeIndex;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: forCapture ? 0 : 0.6 }}
        className="text-center mb-4"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-2">
          Venue Selection Matrix
        </h2>
        <p className="text-lg text-foreground/70">
          Five Premium Destination Options
        </p>
      </motion.div>

      {/* 3D Carousel - Centered Cards */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative w-full h-[420px] perspective-1000">
          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {venues.map((venue, index) => {
                const offset = index - displayIndex;
                const isActive = index === displayIndex;
                
                // Only render nearby cards for performance (or all in capture mode)
                if (!forCapture && Math.abs(offset) > 2) return null;
                // In capture mode, only show active card
                if (forCapture && !isActive) return null;

                return (
                  <motion.div
                    key={venue.city}
                    initial={forCapture ? false : { opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.7,
                      x: forCapture ? 0 : offset * 320,
                      z: isActive ? 50 : -100,
                      rotateY: forCapture ? 0 : offset * -12,
                    }}
                    transition={forCapture ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                    className={`absolute w-full max-w-lg ${
                      isActive ? "z-20" : "z-10"
                    }`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <GlassmorphicCard
                      className={`p-8 md:p-10 transition-all duration-300 ${
                        isActive ? "shadow-2xl border-[#FF9933]/50" : ""
                      }`}
                    >
                      {/* City Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-8 h-8 text-[#FF9933]" />
                          <span className="font-bold text-2xl md:text-3xl text-foreground">
                            {venue.city}
                          </span>
                        </div>
                        {isActive && (
                          <motion.div
                            initial={forCapture ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-4 py-2 rounded bg-[#FF9933]/20"
                          >
                            <Star className="w-6 h-6 text-[#FF9933]" />
                          </motion.div>
                        )}
                      </div>

                      {/* State */}
                      <p className="text-lg text-foreground/60 mb-6">{venue.state}</p>

                      {/* Details - Larger */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/30">
                          <Building className="w-6 h-6 text-[#138808]" />
                          <span className="text-lg font-medium text-foreground">
                            {venue.properties}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/30">
                          <Plane className="w-6 h-6 text-[#000080]" />
                          <span className="text-lg text-foreground">
                            {venue.transit} {venue.transitType}
                          </span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="mt-6 p-4 rounded-xl bg-[#000080]/10 text-center">
                        <span className="text-lg font-semibold text-[#000080]">
                          {venue.type}
                        </span>
                      </div>

                      {/* Highlight */}
                      <p className="mt-5 text-base text-foreground/60 text-center italic">
                        {venue.highlight}
                      </p>
                    </GlassmorphicCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Navigation Arrows - Hide in capture mode */}
          {!forCapture && (
            <>
              <button
                onClick={() => navigate(-1)}
                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full chintan-glass-card hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-8 h-8 text-[#000080]" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full chintan-glass-card hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-8 h-8 text-[#000080]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Venue Indicators - Hide in capture mode */}
      {!forCapture && (
        <div className="flex justify-center gap-3 mt-4 pb-4">
          {venues.map((venue, index) => (
            <button
              key={venue.city}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === activeIndex
                  ? "bg-[#FF9933] scale-150"
                  : "bg-[#000080]/30 hover:bg-[#000080]/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
