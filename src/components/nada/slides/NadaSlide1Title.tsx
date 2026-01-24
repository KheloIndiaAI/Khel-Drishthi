import { motion } from "framer-motion";
import { Shield, Target, Scale, Zap, Building2 } from "lucide-react";

interface NadaSlide1TitleProps {
  forCapture?: boolean;
}

const pillars = [
  { icon: Zap, label: "Operational Excellence", badge: "nada-badge-blue" },
  { icon: Building2, label: "Institutional Accountability", badge: "nada-badge-cyan" },
  { icon: Target, label: "Targeted Deterrence", badge: "nada-badge-teal" },
  { icon: Scale, label: "Legal Reform", badge: "nada-badge-navy" },
];

export const NadaSlide1Title = ({ forCapture = false }: NadaSlide1TitleProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-4">
      {/* Shield Icon */}
      <motion.div
        initial={forCapture ? false : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={forCapture ? { duration: 0 } : { type: "spring", duration: 1, bounce: 0.4 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)] flex items-center justify-center mb-6 shadow-2xl"
      >
        <Shield className="w-10 h-10 text-white" />
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={forCapture ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.2, duration: 0.8 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold nada-gradient-text mb-3 leading-tight"
      >
        Strengthening the Shield
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.8 }}
        className="text-2xl md:text-3xl font-semibold text-foreground/90 mb-4"
      >
        Anti-Doping Action Plan 2026
      </motion.h2>

      {/* Paradigm Shift */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.8 }}
        className="nada-glass-card rounded-xl px-6 py-3 mb-8 max-w-3xl"
      >
        <p className="text-sm md:text-base text-muted-foreground italic">
          "Transitioning from Athlete Detection to Holistic Ecosystem Accountability"
        </p>
      </motion.div>

      {/* Vision Statement */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.6 }}
        className="mb-8"
      >
        <span className="nada-badge-red text-base px-6 py-2">
          <Target className="w-4 h-4" />
          Vision: Zero Tolerance Framework
        </span>
      </motion.div>

      {/* The Paradigm Shift Text */}
      <motion.p
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.6 }}
        className="text-sm md:text-base text-muted-foreground mb-8 max-w-2xl"
      >
        Moving beyond the individual athlete to target the support ecosystem—coaches, doctors, and syndicates.
      </motion.p>

      {/* Four Pillars */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.8, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.label}
            initial={forCapture ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              forCapture
                ? { duration: 0 }
                : { delay: 0.9 + index * 0.1, duration: 0.4 }
            }
            className={pillar.badge}
          >
            <pillar.icon className="w-4 h-4" />
            {pillar.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
