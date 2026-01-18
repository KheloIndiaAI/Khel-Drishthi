import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Medal, Shield, Network, Building2 } from "lucide-react";

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
  {
    icon: Building2,
    title: "Fast-Paced Infra Upgradation",
    description: "Accelerated modernization of sports infrastructure across all states",
    color: "#FF9933",
    bgColor: "#FF993320",
  },
];

interface Slide5PillarsProps {
  forCapture?: boolean;
}

export const Slide5Pillars = ({ forCapture = false }: Slide5PillarsProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: forCapture ? 0 : 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Thematic Pillars
        </h2>
        <p className="text-lg text-foreground/70">
          Four Strategic Foundations for Sports Excellence
        </p>
      </motion.div>

      {/* Pillars Grid - Now 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={forCapture ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: forCapture ? 0 : 0.3 + index * 0.12, duration: forCapture ? 0 : 0.6 }}
            whileHover={forCapture ? undefined : { scale: 1.05, y: -8 }}
            className="group"
          >
            <GlassmorphicCard className="h-full text-center relative overflow-hidden transition-all duration-300 group-hover:shadow-2xl p-6">
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `radial-gradient(circle at center, ${pillar.color}15 0%, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <motion.div
                whileHover={forCapture ? undefined : { rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: pillar.bgColor }}
              >
                <pillar.icon
                  className="w-8 h-8 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: pillar.color }}
                />
              </motion.div>

              {/* Title */}
              <h3
                className="relative z-10 text-lg font-bold mb-2 transition-colors duration-300"
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
                initial={forCapture ? false : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: forCapture ? 0 : 0.8 + index * 0.1 }}
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
