import { motion } from "framer-motion";
import { Shield, Ship, Factory } from "lucide-react";
import { CountryCard } from "../shared/CountryCard";

interface NadaSlide10PracticesProps {
  forCapture?: boolean;
}

const practices = [
  {
    country: "USA",
    flag: "🇺🇸",
    title: "Rodchenkov Act",
    description: "Successfully targets organized fraud and doping conspiracies in international events. Enables prosecution of foreign nationals involved in doping schemes affecting US competitions.",
    icon: Shield,
    variant: "blue" as const,
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    title: "Customs & Importation Laws",
    description: "Uses customs and importation laws to dismantle Performance Enhancing Drug (PED) supply chains. Border agencies work with sports authorities to intercept illegal substances.",
    icon: Ship,
    variant: "cyan" as const,
  },
  {
    country: "China",
    flag: "🇨🇳",
    title: "Manufacturing Focus",
    description: "Strict focus on unauthorized manufacturing and sale of steroids and hormones. Heavy penalties for illicit production facilities and distribution networks.",
    icon: Factory,
    variant: "teal" as const,
  },
];

export const NadaSlide10Practices = ({ forCapture = false }: NadaSlide10PracticesProps) => {
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
          Lessons from International Frameworks
        </h2>
        <p className="text-muted-foreground">Targeted Best Practices</p>
      </motion.div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {practices.map((practice, index) => (
          <CountryCard
            key={practice.country}
            country={practice.country}
            flag={practice.flag}
            title={practice.title}
            description={practice.description}
            icon={practice.icon}
            variant={practice.variant}
            forCapture={forCapture}
            delay={0.2 + index * 0.15}
          />
        ))}
      </div>

      {/* Key Learning */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-6"
      >
        <h3 className="font-bold text-foreground mb-4 text-center">Common Success Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.8, duration: 0.4 }}
            className="p-4 rounded-lg bg-background/50 text-center"
          >
            <div className="nada-badge-blue text-sm mb-2">Focus</div>
            <p className="text-sm text-muted-foreground">Target supply chains, not just end users</p>
          </motion.div>
          <motion.div
            initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.9, duration: 0.4 }}
            className="p-4 rounded-lg bg-background/50 text-center"
          >
            <div className="nada-badge-cyan text-sm mb-2">Collaboration</div>
            <p className="text-sm text-muted-foreground">Inter-agency cooperation is essential</p>
          </motion.div>
          <motion.div
            initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={forCapture ? { duration: 0 } : { delay: 1.0, duration: 0.4 }}
            className="p-4 rounded-lg bg-background/50 text-center"
          >
            <div className="nada-badge-teal text-sm mb-2">Penalties</div>
            <p className="text-sm text-muted-foreground">Heavy penalties for manufacturers & traffickers</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
