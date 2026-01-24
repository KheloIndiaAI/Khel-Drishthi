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
    <div className="flex flex-col items-center justify-center text-center w-full max-w-[1600px] mx-auto px-8">
      {/* Shield Icon */}
      <motion.div
        initial={forCapture ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.5 }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)] flex items-center justify-center mb-8 shadow-2xl"
      >
        <Shield className="w-12 h-12 text-white" />
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.1, duration: 0.5 }}
        className="text-5xl md:text-6xl lg:text-7xl font-bold nada-gradient-text mb-4 leading-tight"
      >
        Strengthening the Shield
      </motion.h1>

      {/* Subtitle */}
      <motion.h2
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.2, duration: 0.5 }}
        className="text-3xl md:text-4xl font-semibold text-foreground mb-6"
      >
        Anti-Doping Action Plan 2026
      </motion.h2>

      {/* Paradigm Shift */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.5 }}
        className="nada-glass-card rounded-xl px-8 py-4 mb-8 max-w-4xl"
      >
        <p className="text-lg md:text-xl text-muted-foreground italic leading-relaxed">
          "Transitioning from Athlete Detection to Holistic Ecosystem Accountability"
        </p>
      </motion.div>

      {/* Vision Statement */}
      <motion.div
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.4 }}
        className="mb-8"
      >
        <span className="nada-badge-red text-lg px-8 py-3">
          <Target className="w-5 h-5" />
          Vision: Zero Tolerance Framework
        </span>
      </motion.div>

      {/* The Paradigm Shift Text */}
      <motion.p
        initial={forCapture ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed"
      >
        Moving beyond the individual athlete to target the support ecosystem—coaches, doctors, and syndicates.
      </motion.p>

      {/* Four Pillars */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.label}
            initial={forCapture ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              forCapture
                ? { duration: 0 }
                : { delay: 0.7 + index * 0.08, duration: 0.3 }
            }
            className={pillar.badge}
          >
            <pillar.icon className="w-5 h-5" />
            {pillar.label}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
