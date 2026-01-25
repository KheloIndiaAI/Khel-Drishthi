import { motion } from "framer-motion";

interface NadaSlide15ClosingProps {
  forCapture?: boolean;
}

export const NadaSlide15Closing = ({ forCapture = false }: NadaSlide15ClosingProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full max-w-[1600px] mx-auto px-8">
      {/* Thank You */}
      <motion.h2
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.5 }}
        className="text-4xl md:text-5xl font-semibold text-foreground mb-12"
      >
        Thank You
      </motion.h2>

      {/* PLAY FAIR - Bold with subtle animation */}
      <motion.h1
        initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="text-6xl md:text-7xl lg:text-8xl font-black nada-gradient-text tracking-wider"
      >
        PLAY FAIR
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={forCapture ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
        className="mt-8 text-2xl md:text-3xl text-muted-foreground font-medium max-w-3xl"
      >
        Lets Build a Cleaner, Fairer, and Stronger, Sporting Nation
      </motion.p>

      {/* Subtle underline accent */}
      <motion.div
        initial={forCapture ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5, ease: "easeOut" }}
        className="mt-8 h-1.5 w-48 rounded-full bg-gradient-to-r from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)]"
      />
    </div>
  );
};
