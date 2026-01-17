import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Medal, Shield, Network } from "lucide-react";

const pillars = [
  {
    icon: Medal,
    title: "Podium Pathways",
    description: "Excellence-driven athlete development from grassroots to global glory",
    color: "#FFD700",
    bgColor: "#FFD70020",
  },
  {
    icon: Shield,
    title: "Governance & Integrity",
    description: "Transparent systems, ethical practices, and accountable leadership",
    color: "#138808",
    bgColor: "#13880820",
  },
  {
    icon: Network,
    title: "Execution Synergy",
    description: "Centre-State coordination for seamless policy implementation",
    color: "#000080",
    bgColor: "#00008020",
  },
];

export const Slide5Pillars = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Thematic Pillars
        </h2>
        <p className="text-lg text-foreground/70">
          Three Strategic Foundations for Sports Excellence
        </p>
      </motion.div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -8 }}
            className="group"
          >
            <GlassmorphicCard className="h-full text-center relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl">
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${pillar.color}15 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: pillar.bgColor }}
              >
                <pillar.icon
                  className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: pillar.color }}
                />
              </motion.div>

              {/* Title */}
              <h3
                className="relative z-10 text-xl font-bold mb-3 transition-colors duration-300"
                style={{ color: pillar.color }}
              >
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="relative z-10 text-sm text-foreground/70 leading-relaxed">
                {pillar.description}
              </p>

              {/* Bottom accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ backgroundColor: pillar.color, transformOrigin: "left" }}
              />
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
