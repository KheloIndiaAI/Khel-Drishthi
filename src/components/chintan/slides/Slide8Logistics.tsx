import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { MapPin, Clock, Plane } from "lucide-react";

const transitData = [
  { venue: "Bhuj", time: "80 km", type: "Road" },
  { venue: "Visakhapatnam", time: "30 min", type: "Airport" },
  { venue: "Jaipur", time: "60 min", type: "Airport" },
  { venue: "Konark/Puri", time: "81 km", type: "Road" },
  { venue: "Bekal", time: "70 km", type: "Road" },
];

export const Slide8Logistics = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
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
          Transit Infrastructure Assessment
        </p>
      </motion.div>

      {/* Transit Matrix - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassmorphicCard className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FF9933]/20 flex items-center justify-center">
              <Plane className="w-6 h-6 text-[#FF9933]" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Transit Matrix</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {transitData.map((item, index) => (
              <motion.div
                key={item.venue}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-white/60 to-white/30 border border-white/40 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#138808]" />
                  <span className="text-base font-semibold text-foreground">
                    {item.venue}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground/50" />
                  <span className="text-sm text-foreground/70">
                    {item.time}
                  </span>
                </div>
                <div className="mt-2 inline-block px-2 py-1 rounded bg-[#000080]/10">
                  <span className="text-xs font-medium text-[#000080]">
                    {item.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 p-4 rounded-xl bg-[#138808]/10 text-center"
          >
            <span className="text-base font-medium text-[#138808]">
              All venues have established VIP transit protocols and infrastructure readiness
            </span>
          </motion.div>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};
