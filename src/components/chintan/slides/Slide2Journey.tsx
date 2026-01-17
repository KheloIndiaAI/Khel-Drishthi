import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { MapPin } from "lucide-react";

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
    transition: { staggerChildren: 0.25 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7 } },
};

export const Slide2Journey = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Journey of Convergence
        </h2>
        <p className="text-lg md:text-xl text-foreground/70">
          A Historical Timeline of Past Shivirs
        </p>
      </motion.div>

      {/* Timeline Cards - Larger */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {journeyData.map((item, index) => (
          <motion.div key={item.year} variants={cardVariants}>
            <GlassmorphicCard hover className="h-full relative overflow-hidden min-h-[220px] p-8">
              {/* Year Badge - Larger */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.2, type: "spring" }}
                className="absolute -top-4 -right-4 w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: item.color, opacity: 0.95 }}
              >
                <span
                  className={`text-2xl font-bold ${
                    item.color === "#FFFFFF" ? "text-[#000080]" : "text-white"
                  }`}
                >
                  {item.year}
                </span>
              </motion.div>

              <div className="pt-2">
                {/* Location - Larger */}
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#FF9933]" />
                  <span className="font-bold text-xl text-foreground">
                    {item.location}
                  </span>
                </div>

                {/* Theme - Larger */}
                <p className="text-foreground/70 text-base md:text-lg leading-relaxed">
                  {item.theme}
                </p>

                {/* Decorative bottom border */}
                <div
                  className="mt-6 h-1.5 w-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${item.color} 0%, transparent 100%)`,
                  }}
                />
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
