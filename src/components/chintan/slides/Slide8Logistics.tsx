import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { MapPin, Shield, CheckCircle2, Clock, Plane } from "lucide-react";

const transitData = [
  { venue: "Visakhapatnam", time: "30 min", type: "Airport" },
  { venue: "Jaipur", time: "60 min", type: "Airport" },
  { venue: "Konark/Puri", time: "81 km", type: "Road" },
  { venue: "Bekal", time: "70 km", type: "Road" },
];

const securityChecklist = [
  "SPG-grade venue assessment completed",
  "3-tier security perimeter protocol",
  "VIP convoy route pre-cleared",
  "Communication blackout capability",
  "Medical emergency protocols",
];

export const Slide8Logistics = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Logistical Readiness
        </h2>
        <p className="text-lg text-foreground/70">
          Infrastructure & Security Assessment
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transit Times */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassmorphicCard className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#FF9933]/20 flex items-center justify-center">
                <Plane className="w-5 h-5 text-[#FF9933]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Transit Matrix</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {transitData.map((item, index) => (
                <motion.div
                  key={item.venue}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 rounded-xl bg-gradient-to-br from-white/50 to-white/20 border border-white/40"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#138808]" />
                    <span className="text-sm font-medium text-foreground">
                      {item.venue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-foreground/50" />
                    <span className="text-xs text-foreground/70">
                      {item.time} ({item.type})
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Security Protocol */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassmorphicCard className="h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#000080]/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#000080]" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Security & Protocol
              </h3>
            </div>

            <div className="space-y-3">
              {securityChecklist.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#138808]/5 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#138808] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* VIP Readiness Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-6 p-3 rounded-xl bg-[#138808]/10 text-center"
            >
              <span className="text-sm font-bold text-[#138808]">
                ✓ 3-Tier VIP Readiness Confirmed
              </span>
            </motion.div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </div>
  );
};
