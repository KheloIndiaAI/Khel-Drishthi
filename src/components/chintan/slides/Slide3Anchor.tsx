import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { FileText, Trophy, Target } from "lucide-react";

const triggers = [
  {
    icon: FileText,
    title: "Khelo Bharat Niti-2025",
    description: "Execution of national sports policy framework",
    color: "#FF9933",
  },
  {
    icon: Trophy,
    title: "2030 CWG Ahmedabad",
    description: "Commonwealth Games hosting confirmation",
    color: "#138808",
  },
  {
    icon: Target,
    title: "Mission 2036",
    description: "Olympic Games roadmap & bidding strategy",
    color: "#000080",
  },
];

export const Slide3Anchor = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <span className="chintan-badge-navy mb-4 inline-block">Strategic Anchor</span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          2026: The Strategic Pivot Year
        </h2>
      </motion.div>

      {/* Three Triggers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {triggers.map((trigger, index) => (
          <motion.div
            key={trigger.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.15 }}
          >
            <GlassmorphicCard hover className="h-full text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${trigger.color}20` }}
              >
                <trigger.icon
                  className="w-8 h-8"
                  style={{ color: trigger.color }}
                />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {trigger.title}
              </h3>
              <p className="text-sm text-foreground/70">{trigger.description}</p>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Policy to Podium Ladder Graphic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <GlassmorphicCard className="inline-flex items-center gap-4 px-8">
          <div className="flex items-end gap-2">
            {["Policy", "Planning", "Execution", "Podium"].map((step, i) => (
              <motion.div
                key={step}
                initial={{ height: 0 }}
                animate={{ height: 24 + i * 16 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
                className="w-12 rounded-t-lg flex items-end justify-center pb-1"
                style={{
                  background: `linear-gradient(180deg, ${
                    i === 3 ? "#FFD700" : i === 0 ? "#FF9933" : i === 1 ? "#138808" : "#000080"
                  } 0%, transparent 100%)`,
                }}
              />
            ))}
          </div>
          <div className="text-left">
            <p className="font-bold text-[#000080]">Policy to Podium</p>
            <p className="text-sm text-foreground/70">Strategic Progression</p>
          </div>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};
