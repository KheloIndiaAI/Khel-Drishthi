import { motion } from "framer-motion";
import { GlassmorphicCard } from "../shared/GlassmorphicCard";

const taglineOptions = [
  {
    id: "A",
    hindi: "टीम इंडिया: एक दृष्टिकोण, 36 राज्य",
    english: "Team India: One Vision",
    highlight: true,
  },
  {
    id: "B",
    hindi: "नीति से पोडियम तक",
    english: "From Policy to Podium",
    highlight: false,
  },
  {
    id: "C",
    hindi: "भारतीय खेलों का भविष्य: 2036 का रोडमैप",
    english: "Future-Proofing Indian Sport: The 2036 Roadmap",
    highlight: false,
  },
  {
    id: "D",
    hindi: "भारतीय एथलीट का दशक",
    english: "The Decade of the Indian Athlete: 2030 Readiness. 2036 Glory",
    highlight: false,
  },
];

export const Slide10Branding = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-5xl font-bold text-[#000080] mb-3">
          Branding & Taglines
        </h2>
        <p className="text-lg text-foreground/70">
          Proposed Theme Options for Chintan Shivir 2026
        </p>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {taglineOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <GlassmorphicCard
              className={`relative overflow-hidden h-full ${
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
                  className="absolute top-0 right-0 bg-[#FF9933] text-white px-3 py-1 text-xs font-bold rounded-bl-lg"
                >
                  Featured
                </motion.div>
              )}

              <div className="p-6">
                {/* Option Letter */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-4 ${
                    option.highlight
                      ? "bg-[#FF9933] text-white"
                      : "bg-[#000080]/10 text-[#000080]"
                  }`}
                >
                  {option.id}
                </div>

                {/* Hindi */}
                <p className="text-xl font-bold text-foreground mb-2">
                  "{option.hindi}"
                </p>
                
                {/* English */}
                <p className="text-base text-foreground/70 italic">
                  {option.english}
                </p>
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
          <p className="text-lg text-[#FF9933] mt-2 font-medium">
            एक दृष्टि। एक खेल राष्ट्र।
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
