import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { FileText, Trophy, Target, Scale, Globe } from "lucide-react";

const triggers = [
  {
    icon: FileText,
    title: "Khelo Bharat Niti-2025",
    description: "Execution of national sports policy framework",
    color: "#FF9933",
  },
  {
    icon: Scale,
    title: "National Sports Governance Act 2025",
    description: "Launch of comprehensive sports governance legislation",
    color: "#000080",
  },
  {
    icon: Trophy,
    title: "2030 CWG Ahmedabad",
    description: "Commonwealth Games hosting confirmation",
    color: "#138808",
  },
  {
    icon: Globe,
    title: "World Para Athletic Championship",
    description: "Hosting international para athletics event in India",
    color: "#FF9933",
  },
  {
    icon: Target,
    title: "Mission 2036",
    description: "Olympic Games roadmap & bidding strategy",
    color: "#138808",
  },
];

interface Slide3AnchorProps {
  forCapture?: boolean;
}

export const Slide3Anchor = ({ forCapture = false }: Slide3AnchorProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: forCapture ? 0 : 0.6 }}
        className="text-center mb-8"
      >
        <span className="chintan-badge-navy mb-4 inline-block">Strategic Anchor</span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          2026: The Strategic Pivot Year
        </h2>
      </motion.div>

      {/* Five Triggers - Updated Grid */}
      <motion.div
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: forCapture ? 0 : 0.3 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
      >
        {triggers.map((trigger, index) => (
          <motion.div
            key={trigger.title}
            initial={forCapture ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: forCapture ? 0 : 0.4 + index * 0.1 }}
          >
            <GlassmorphicCard hover={!forCapture} className="h-full text-center p-4">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ backgroundColor: `${trigger.color}20` }}
              >
                <trigger.icon
                  className="w-6 h-6"
                  style={{ color: trigger.color }}
                />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2 leading-tight">
                {trigger.title}
              </h3>
              <p className="text-xs text-foreground/70">{trigger.description}</p>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Policy to Podium Ladder Graphic */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: forCapture ? 0 : 0.8 }}
        className="flex justify-center"
      >
        <GlassmorphicCard className="inline-flex items-center gap-4 px-8">
          <div className="flex items-end gap-2">
            {["Policy", "Planning", "Execution", "Podium"].map((step, i) => (
              <motion.div
                key={step}
                initial={forCapture ? false : { height: 0 }}
                animate={{ height: 24 + i * 16 }}
                transition={forCapture ? { duration: 0 } : { delay: 1 + i * 0.1, duration: 0.4 }}
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
