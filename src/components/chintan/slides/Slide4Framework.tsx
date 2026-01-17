import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Users, Handshake, Building, FileCheck } from "lucide-react";

const day1Items = [
  { icon: Users, text: "Plenary Strategy Session" },
  { icon: Building, text: "Thematic Breakout Groups" },
  { icon: FileCheck, text: "Policy Alignment Review" },
];

const day2Items = [
  { icon: Handshake, text: "State Roadmap Presentations" },
  { icon: FileCheck, text: "Bilateral Commitments" },
  { icon: Users, text: "Action Plan Finalization" },
];

export const Slide4Framework = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Operational Framework
        </h2>
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="chintan-badge-navy inline-block"
        >
          Residential Format
        </motion.span>
      </motion.div>

      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Day 01 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GlassmorphicCard className="h-full border-l-4 border-l-[#FF9933]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#FF9933]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#FF9933]">01</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Day One</h3>
                <p className="text-sm text-foreground/70">Plenary Strategy</p>
              </div>
            </div>
            <div className="space-y-4">
              {day1Items.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#FF9933]/5"
                >
                  <item.icon className="w-5 h-5 text-[#FF9933]" />
                  <span className="text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Day 02 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GlassmorphicCard className="h-full border-l-4 border-l-[#138808]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#138808]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#138808]">02</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Day Two</h3>
                <p className="text-sm text-foreground/70">State Roadmaps</p>
              </div>
            </div>
            <div className="space-y-4">
              {day2Items.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#138808]/5"
                >
                  <item.icon className="w-5 h-5 text-[#138808]" />
                  <span className="text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
};
