import { motion } from "framer-motion";
import { Shield, UtensilsCrossed, Database, Stethoscope, ArrowRight } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide13SynergyProps {
  forCapture?: boolean;
}

const agencies = [
  {
    name: "CBI",
    fullName: "Central Bureau of Investigation",
    role: "Investigating organized doping syndicates and cross-border trafficking",
    icon: Shield,
    variant: "blue" as const,
  },
  {
    name: "FSSAI",
    fullName: "Food Safety & Standards Authority",
    role: "Regulating food supplements and penalizing adulteration",
    icon: UtensilsCrossed,
    variant: "cyan" as const,
  },
  {
    name: "NCRB",
    fullName: "National Crime Records Bureau",
    role: "Tracking national data on convictions related to food and drug adulteration",
    icon: Database,
    variant: "teal" as const,
  },
  {
    name: "Health Depts",
    fullName: "State Health Departments",
    role: "Monitoring the illegal sale of steroids at the local level",
    icon: Stethoscope,
    variant: "green" as const,
  },
];

export const NadaSlide13Synergy = ({ forCapture = false }: NadaSlide13SynergyProps) => {
  const variantColors = {
    blue: "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]",
    cyan: "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]",
    teal: "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]",
    green: "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]",
  };

  const variantBadges = {
    blue: "nada-badge-blue",
    cyan: "nada-badge-cyan",
    teal: "nada-badge-teal",
    green: "nada-badge-green",
  };

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
          The Multi-Force Anti-Doping Taskforce
        </h2>
        <p className="text-muted-foreground">Inter-Agency Synergy</p>
      </motion.div>

      {/* Agency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {agencies.map((agency, index) => (
          <NadaGlassmorphicCard
            key={agency.name}
            forCapture={forCapture}
            delay={0.2 + index * 0.12}
            className="p-6"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${variantColors[agency.variant]} flex-shrink-0`}>
                <agency.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">{agency.name}</h3>
                  <span className={`${variantBadges[agency.variant]} text-xs`}>Partner</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{agency.fullName}</p>
                <p className="text-sm text-muted-foreground">{agency.role}</p>
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Connection Flow */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-6"
      >
        <h3 className="font-bold text-foreground text-center mb-6">Unified Command Structure</h3>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {agencies.map((agency, index) => (
            <motion.div
              key={agency.name}
              initial={forCapture ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.8 + index * 0.1, duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className={variantBadges[agency.variant]}>{agency.name}</span>
              {index < agencies.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground hidden md:block" />
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={forCapture ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={forCapture ? { duration: 0 } : { delay: 1.2, duration: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] text-white font-semibold">
            <Shield className="w-5 h-5" />
            NADA Coordination Hub
          </div>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Centralized coordination ensures seamless information sharing and joint enforcement operations
        </p>
      </motion.div>
    </div>
  );
};
