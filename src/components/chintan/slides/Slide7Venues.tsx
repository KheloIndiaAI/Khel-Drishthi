import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { ChevronLeft, ChevronRight, MapPin, Clock, Building, Star } from "lucide-react";

const venues = [
  {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    properties: "Novotel / Radisson",
    type: "Urban Powerhouse",
    transit: "30 min",
    highlight: "Coastal City Dynamics",
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    properties: "Ananta Spa & Resorts",
    type: "Grand Scale Unified Campus",
    transit: "60 min",
    highlight: "Heritage & Hospitality",
  },
  {
    city: "Konark / Puri",
    state: "Odisha",
    properties: "Eco Retreat",
    type: "Focus Retreat Format",
    transit: "81 km",
    highlight: "Serene & Focused",
  },
  {
    city: "Bekal",
    state: "Kerala",
    properties: "Taj / Gateway",
    type: "High-Security Destination",
    transit: "70 km",
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
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Venue Selection Matrix
        </h2>
        <p className="text-lg text-foreground/70">
          Four Premium Destination Options
        </p>
      </motion.div>

      {/* 3D Carousel */}
      <div className="relative h-[400px] flex items-center justify-center perspective-1000">
        <div className="relative w-full max-w-lg">
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
                    opacity: isActive ? 1 : 0.4,
                    scale: isActive ? 1 : 0.75,
                    x: offset * 280,
                    z: isActive ? 50 : -100,
                    rotateY: offset * -15,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm ${
                    isActive ? "z-20" : "z-10"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <GlassmorphicCard
                    className={`p-6 transition-all duration-300 ${
                      isActive ? "shadow-2xl border-[#FF9933]/50" : ""
                    }`}
                  >
                    {/* City Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#FF9933]" />
                        <span className="font-bold text-lg text-foreground">
                          {venue.city}
                        </span>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-1 rounded bg-[#FF9933]/20"
                        >
                          <Star className="w-4 h-4 text-[#FF9933]" />
                        </motion.div>
                      )}
                    </div>

                    {/* State */}
                    <p className="text-sm text-foreground/60 mb-4">{venue.state}</p>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-[#138808]" />
                        <span className="text-sm text-foreground">
                          {venue.properties}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#000080]" />
                        <span className="text-sm text-foreground">
                          Transit: {venue.transit}
                        </span>
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="mt-4 p-2 rounded-lg bg-[#000080]/10 text-center">
                      <span className="text-sm font-medium text-[#000080]">
                        {venue.type}
                      </span>
                    </div>

                    {/* Highlight */}
                    <p className="mt-4 text-xs text-foreground/50 text-center italic">
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full chintan-glass-card hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-[#000080]" />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full chintan-glass-card hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-6 h-6 text-[#000080]" />
        </button>
      </div>

      {/* Venue Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {venues.map((venue, index) => (
          <button
            key={venue.city}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === activeIndex
                ? "bg-[#FF9933] scale-125"
                : "bg-[#000080]/30 hover:bg-[#000080]/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
