import { motion } from "framer-motion";

interface NadaSlide1CoverProps {
  forCapture?: boolean;
}

export const NadaSlide1Cover = ({ forCapture = false }: NadaSlide1CoverProps) => {
  const animationProps = forCapture
    ? { initial: false, animate: { opacity: 1, y: 0, scale: 1 } }
    : {};

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
      {/* Logo/Icon */}
      <motion.div
        initial={forCapture ? false : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={forCapture ? { duration: 0 } : { type: "spring", duration: 1, bounce: 0.4 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 flex items-center justify-center mb-8 shadow-2xl"
      >
        <span className="text-white font-bold text-3xl">NADA</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={forCapture ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.8 }}
        className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 bg-clip-text text-transparent mb-4"
      >
        NADA Presentation
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.8 }}
        className="text-xl text-muted-foreground mb-8"
      >
        National Anti-Doping Agency
      </motion.p>

      {/* Placeholder text */}
      <motion.div
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.8 }}
        className="text-sm text-muted-foreground/60 italic"
      >
        Slide content will be added based on your detailed plan
      </motion.div>
    </div>
  );
};
