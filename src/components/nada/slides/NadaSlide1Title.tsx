import { motion } from "framer-motion";
import nadaShieldImage from "@/assets/nada-shield-stadium.png";

interface NadaSlide1TitleProps {
  forCapture?: boolean;
}

export const NadaSlide1Title = ({ forCapture = false }: NadaSlide1TitleProps) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Background Image - Full Screen */}
      <motion.img
        initial={forCapture ? false : { opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.8 }}
        src={nadaShieldImage}
        alt="NADA Shield - Anti-Doping"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content - Centered on top of image */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Main Title */}
        <motion.h1
          initial={forCapture ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.5 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
        >
          Strengthening the Shield
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={forCapture ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-white/90 drop-shadow-md"
        >
          Anti-Doping Action Plan 2026
        </motion.h2>
      </div>
    </div>
  );
};
