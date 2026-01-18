import { motion } from "framer-motion";
import { AshokaChakra } from "../shared/AshokaChakra";

interface Slide1CoverProps {
  forCapture?: boolean;
}

export const Slide1Cover = ({ forCapture = false }: Slide1CoverProps) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center">
      {/* Background Ashoka Chakra */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <AshokaChakra className="w-[80vh] h-[80vh]" />
      </div>

      {/* Content */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: forCapture ? 0 : 0.8 }}
        className="relative z-10"
      >
        {/* Fourth Edition Badge */}
        <motion.div
          initial={forCapture ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: forCapture ? 0 : 0.3, duration: forCapture ? 0 : 0.5 }}
          className="inline-block mb-6"
        >
          <span className="chintan-badge-saffron text-sm md:text-base">
            Fourth Edition
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={forCapture ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: forCapture ? 0 : 0.5, duration: forCapture ? 0 : 0.6 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          <span className="text-[#FF9933]">CHINTAN</span>{" "}
          <span className="text-[#000080]">SHIVIR</span>{" "}
          <span className="text-[#138808]">2026</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={forCapture ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: forCapture ? 0 : 0.7, duration: forCapture ? 0 : 0.6 }}
          className="text-lg md:text-2xl lg:text-3xl font-light text-foreground/80 max-w-3xl mx-auto"
        >
          Bridging Policy Momentum with Execution Excellence
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={forCapture ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: forCapture ? 0 : 1, duration: forCapture ? 0 : 0.8 }}
          className="mt-8 h-1 w-32 md:w-48 mx-auto rounded-full"
          style={{
            background: "linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)",
          }}
        />
      </motion.div>

      {/* Scroll hint - hide in capture mode */}
      {!forCapture && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[#000080]/50 text-sm"
          >
            Press → or swipe to continue
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
