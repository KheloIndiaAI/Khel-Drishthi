import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Calendar, MapPin, Palette, CircleDot } from "lucide-react";

const decisions = [
  {
    icon: Calendar,
    title: "Finalize Dates",
    description: "Confirm 12 Feb – 09 Mar 2026 window",
    color: "#FF9933",
  },
  {
    icon: MapPin,
    title: "Select Host Venue/State",
    description: "Choose from four shortlisted destinations",
    color: "#138808",
  },
  {
    icon: Palette,
    title: "Approve Branding Theme",
    description: "Finalize visual identity & tagline",
    color: "#000080",
  },
];

export const Slide9Decisions = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <span className="chintan-badge-saffron mb-4 inline-block">
          Action Required
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Decisions Sought
        </h2>
        <p className="text-lg text-foreground/70">
          Key Approvals for Forward Momentum
        </p>
      </motion.div>

      {/* Decision Items */}
      <div className="space-y-6">
        {decisions.map((decision, index) => (
          <motion.div
            key={decision.title}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.15 }}
            whileHover={{ x: 10 }}
          >
            <GlassmorphicCard
              className="relative overflow-hidden group cursor-pointer"
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at left, ${decision.color}20 0%, transparent 50%)`,
                }}
              />
              
              {/* Pulsing border glow */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 0px ${decision.color}00`,
                    `0 0 20px ${decision.color}40`,
                    `0 0 0px ${decision.color}00`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                className="absolute inset-0 rounded-2xl pointer-events-none"
              />

              <div className="relative z-10 flex items-center gap-6">
                {/* Number */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ backgroundColor: decision.color }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${decision.color}20` }}
                >
                  <decision.icon
                    className="w-7 h-7"
                    style={{ color: decision.color }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {decision.title}
                  </h3>
                  <p className="text-sm text-foreground/70">
                    {decision.description}
                  </p>
                </div>

                {/* Status indicator */}
                <div className="flex-shrink-0">
                  <CircleDot
                    className="w-6 h-6 animate-pulse"
                    style={{ color: decision.color }}
                  />
                </div>
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
