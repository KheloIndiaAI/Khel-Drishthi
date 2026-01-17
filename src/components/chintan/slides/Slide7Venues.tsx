import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { ChevronLeft, ChevronRight, MapPin, Clock, Building, Star, Plane } from "lucide-react";

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

export const Slide7Venues = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const navigate = (direction: number) => {
    setActiveIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return venues.length - 1;
      if (next >= venues.length) return 0;
      return next;
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Venue Selection Matrix
        </h2>
        <p className="text-lg text-foreground/70">
          Five Premium Destination Options
        </p>
      </motion.div>

      {/* 3D Carousel - Larger Cards */}
      <div className="relative h-[450px] flex items-center justify-center perspective-1000">
        <div className="relative w-full max-w-xl">
          <AnimatePresence mode="wait">
            {venues.map((venue, index) => {
              const offset = index - activeIndex;
              const isActive = index === activeIndex;
              
              // Only render nearby cards for performance
              if (Math.abs(offset) > 2) return null;

              return (
                <motion.div
                  key={venue.city}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isActive ? 1 : 0.3,
                    scale: isActive ? 1 : 0.7,
                    x: offset * 320,
                    z: isActive ? 50 : -100,
                    rotateY: offset * -12,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md ${
                    isActive ? "z-20" : "z-10"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <GlassmorphicCard
                    className={`p-8 transition-all duration-300 ${
                      isActive ? "shadow-2xl border-[#FF9933]/50" : ""
                    }`}
                  >
                    {/* City Badge */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-7 h-7 text-[#FF9933]" />
                        <span className="font-bold text-2xl text-foreground">
                          {venue.city}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1.5 rounded bg-[#FF9933]/20"
                        >
                          <Star className="w-5 h-5 text-[#FF9933]" />
                        </motion.div>
                      )}
                    </div>

                    {/* State */}
                    <p className="text-base text-foreground/60 mb-6">{venue.state}</p>

                    {/* Details - Larger */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/30">
                        <Building className="w-5 h-5 text-[#138808]" />
                        <span className="text-base font-medium text-foreground">
                          {venue.properties}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-white/30">
                        <Plane className="w-5 h-5 text-[#000080]" />
                        <span className="text-base text-foreground">
                          {venue.transit} {venue.transitType}
                        </span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="mt-6 p-3 rounded-xl bg-[#000080]/10 text-center">
                      <span className="text-base font-semibold text-[#000080]">
                        {venue.type}
                      </span>
                    </div>

                    {/* Highlight */}
                    <p className="mt-4 text-sm text-foreground/60 text-center italic">
                      {venue.highlight}
                    </p>
                  </GlassmorphicCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full chintan-glass-card hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-8 h-8 text-[#000080]" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full chintan-glass-card hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-8 h-8 text-[#000080]" />
        </button>
      </div>

      {/* Venue Indicators */}
      <div className="flex justify-center gap-3 mt-4">
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
    </div>
  );
};
