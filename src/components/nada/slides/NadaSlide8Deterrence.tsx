import { motion } from "framer-motion";
import { MapPin, Zap, MessageSquareWarning, GraduationCap, Target } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide8DeterrenceProps {
  forCapture?: boolean;
}

const initiatives = [
  {
    icon: MapPin,
    title: "State-Level Focus",
    description: "Prioritizing testing in states reporting higher violation spikes",
    badge: "Geographic",
    variant: "blue" as const,
  },
  {
    icon: Zap,
    title: "Surprise Raids",
    description: "Regular, unannounced inspections at SAI NCOE campuses and private training hubs",
    badge: "Enforcement",
    variant: "red" as const,
  },
  {
    icon: MessageSquareWarning,
    title: "Whistleblower Program",
    description: "Launching the 'Speak-up' initiative to gather human intelligence on doping syndicates",
    badge: "Intelligence",
    variant: "cyan" as const,
  },
  {
    icon: GraduationCap,
    title: "Grassroots Vigilance",
    description: "Expanding testing to University Games and School Games",
    badge: "Youth",
    variant: "teal" as const,
  },
];

export const NadaSlide8Deterrence = ({ forCapture = false }: NadaSlide8DeterrenceProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.6 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold nada-gradient-text mb-2">
          Targeted Field Intelligence & Deterrence
        </h2>
        <p className="text-muted-foreground">Ground-Level Deterrence Strategy</p>
      </motion.div>

      {/* Four Initiative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {initiatives.map((initiative, index) => (
          <NadaGlassmorphicCard
            key={initiative.title}
            forCapture={forCapture}
            delay={0.2 + index * 0.12}
            className="p-6"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br flex-shrink-0 ${
                initiative.variant === "blue" 
                  ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]"
                  : initiative.variant === "red"
                  ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]"
                  : initiative.variant === "cyan"
                  ? "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]"
                  : "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]"
              }`}>
                <initiative.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-foreground">{initiative.title}</h3>
                  <span className={`${
                    initiative.variant === "blue" ? "nada-badge-blue" 
                    : initiative.variant === "red" ? "nada-badge-red"
                    : initiative.variant === "cyan" ? "nada-badge-cyan"
                    : "nada-badge-teal"
                  } text-xs`}>
                    {initiative.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{initiative.description}</p>
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Speak-Up Highlight */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]">
            <MessageSquareWarning className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              "Speak-Up" Initiative
            </h3>
            <p className="text-muted-foreground">Anonymous Whistleblower Program</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={forCapture ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.8, duration: 0.4 }}
            className="p-3 rounded-lg bg-background/50 text-center"
          >
            <p className="text-2xl font-bold nada-gradient-text">100%</p>
            <p className="text-xs text-muted-foreground">Anonymous Reporting</p>
          </motion.div>
          <motion.div
            initial={forCapture ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.9, duration: 0.4 }}
            className="p-3 rounded-lg bg-background/50 text-center"
          >
            <p className="text-2xl font-bold nada-gradient-text">24/7</p>
            <p className="text-xs text-muted-foreground">Hotline Access</p>
          </motion.div>
          <motion.div
            initial={forCapture ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={forCapture ? { duration: 0 } : { delay: 1.0, duration: 0.4 }}
            className="p-3 rounded-lg bg-background/50 text-center"
          >
            <p className="text-2xl font-bold nada-gradient-text">
              <Target className="w-6 h-6 inline" />
            </p>
            <p className="text-xs text-muted-foreground">Syndicate Targeting</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
