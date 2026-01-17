import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Calendar, Clock, Building2 } from "lucide-react";

export const Slide6Timing = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Strategic Timing
        </h2>
        <p className="text-lg text-foreground/70">
          Optimal Window for National Convergence
        </p>
      </motion.div>

      {/* Calendar Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <GlassmorphicCard className="text-center p-8 md:p-12">
          {/* Calendar Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-20 h-20 rounded-2xl bg-[#FF9933]/20 mx-auto mb-8 flex items-center justify-center"
          >
            <Calendar className="w-10 h-10 text-[#FF9933]" />
          </motion.div>

          {/* Date Range */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-bold text-[#FF9933]">12</div>
              <div className="text-lg text-foreground/70">Feb</div>
              <div className="text-sm text-foreground/50">2026</div>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="w-12 md:w-24 h-0.5 bg-[#000080]/30"
            />

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <div className="text-4xl md:text-6xl font-bold text-[#138808]">09</div>
              <div className="text-lg text-foreground/70">Mar</div>
              <div className="text-sm text-foreground/50">2026</div>
            </motion.div>
          </div>

          {/* Context Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#000080]/10"
          >
            <Building2 className="w-4 h-4 text-[#000080]" />
            <span className="text-sm font-medium text-[#000080]">
              Parliament Budget Session Break
            </span>
          </motion.div>

          {/* Duration indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex items-center justify-center gap-2 text-foreground/60"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">26-Day Strategic Window</span>
          </motion.div>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};
