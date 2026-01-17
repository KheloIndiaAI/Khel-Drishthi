import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { MapPin, Calendar } from "lucide-react";

const journeyData = [
  {
    year: "2022",
    location: "Kevadia, Gujarat",
    theme: "Foundation of Centre-State Synergy",
    color: "#FF9933",
  },
  {
    year: "2023",
    location: "Imphal, Manipur",
    theme: "Regional Integration Focus",
    color: "#FFFFFF",
  },
  {
    year: "2025",
    location: "Hyderabad, Telangana",
    theme: "Strengthening Governance Models",
    color: "#138808",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
};

export const Slide2Journey = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Journey of Convergence
        </h2>
        <p className="text-lg text-foreground/70">
          A Historical Timeline of Past Shivirs
        </p>
      </motion.div>

      {/* Timeline Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {journeyData.map((item, index) => (
          <motion.div key={item.year} variants={cardVariants}>
            <GlassmorphicCard hover className="h-full relative overflow-hidden">
              {/* Year Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                className="absolute -top-3 -right-3 w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: item.color, opacity: 0.9 }}
              >
                <span
                  className={`text-xl font-bold ${
                    item.color === "#FFFFFF" ? "text-[#000080]" : "text-white"
                  }`}
                >
                  {item.year}
                </span>
              </motion.div>

              <div className="pt-4">
                {/* Location */}
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#FF9933]" />
                  <span className="font-semibold text-foreground">
                    {item.location}
                  </span>
                </div>

                {/* Theme */}
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {item.theme}
                </p>

                {/* Decorative bottom border */}
                <div
                  className="mt-4 h-1 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${item.color} 0%, transparent 100%)`,
                  }}
                />
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Connecting Line (Desktop) */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-0.5 bg-[#000080]/20 -z-10"
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
};
