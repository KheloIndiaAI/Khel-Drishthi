import { motion } from "framer-motion";
import nadaShieldImage from "@/assets/nada-shield-stadium.png";

interface NadaSlide1TitleProps {
  forCapture?: boolean;
}

export const NadaSlide1Title = ({ forCapture = false }: NadaSlide1TitleProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-[1600px] mx-auto px-8">
      {/* Hero Image */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.5 }}
        className="mb-10"
      >
        <img 
          src={nadaShieldImage} 
          alt="NADA Shield - Anti-Doping" 
          className="w-auto h-[280px] md:h-[340px] object-contain"
        />
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.2, duration: 0.5 }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold nada-gradient-text mb-6 leading-tight"
      >
        Strengthening the Shield
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.5 }}
        className="text-3xl md:text-4xl font-semibold text-foreground"
      >
        Anti-Doping Action Plan 2026
      </motion.h2>
    </div>
  );
};
