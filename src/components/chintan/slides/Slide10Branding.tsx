import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";
import { Star, Check } from "lucide-react";

const taglineOptions = [
  {
    id: "A",
    hindi: "2030 की तैयारी, 2036 की बारी",
    english: "2030 Readiness. 2036 Glory.",
    highlight: true,
  },
  {
    id: "B",
    hindi: "एक लक्ष्य, एक भारत",
    english: "One Goal, One Bharat",
    highlight: false,
  },
  {
    id: "C",
    hindi: "खेल से शक्ति",
    english: "Power Through Sports",
    highlight: false,
  },
  {
    id: "D",
    hindi: "विजय की ओर",
    english: "Towards Victory",
    highlight: false,
  },
];

export const Slide10Branding = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Branding & Taglines
        </h2>
        <p className="text-lg text-foreground/70">
          Proposed Theme Options for Chintan Shivir 2026
        </p>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {taglineOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <GlassmorphicCard
              className={`relative overflow-hidden ${
                option.highlight
                  ? "border-2 border-[#FF9933] shadow-lg"
                  : ""
              }`}
            >
              {/* Highlight badge */}
              {option.highlight && (
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: 0 }}
                  className="absolute top-0 right-0 bg-[#FF9933] text-white px-3 py-1 text-xs font-bold rounded-bl-lg flex items-center gap-1"
                >
                  <Star className="w-3 h-3" />
                  Recommended
                </motion.div>
              )}

              <div className="flex items-start gap-4">
                {/* Option Letter */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                    option.highlight
                      ? "bg-[#FF9933] text-white"
                      : "bg-[#000080]/10 text-[#000080]"
                  }`}
                >
                  {option.id}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className="text-lg font-bold text-foreground mb-1">
                    "{option.hindi}"
                  </p>
                  <p className="text-sm text-foreground/70 italic">
                    {option.english}
                  </p>
                </div>

                {/* Selection indicator */}
                {option.highlight && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring" }}
                    className="w-8 h-8 rounded-full bg-[#138808] flex items-center justify-center flex-shrink-0"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>

      {/* Closing Statement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <GlassmorphicCard className="inline-block px-12 py-6">
          <div
            className="h-1 w-24 mx-auto mb-4 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)",
            }}
          />
          <p className="text-2xl md:text-3xl font-bold text-[#000080]">
            One Vision. One Sporting Nation.
          </p>
          <div
            className="h-1 w-24 mx-auto mt-4 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #138808 0%, #FFFFFF 50%, #FF9933 100%)",
            }}
          />
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
};
