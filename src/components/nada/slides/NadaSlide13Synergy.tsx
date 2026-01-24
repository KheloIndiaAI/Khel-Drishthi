import { motion } from "framer-motion";
import { Shield, UtensilsCrossed, Database, Stethoscope, ArrowRight } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide13SynergyProps { forCapture?: boolean; }

const agencies = [
  { name: "CBI", fullName: "Central Bureau of Investigation", role: "Investigating organized doping syndicates and cross-border trafficking", icon: Shield, variant: "blue" as const },
  { name: "FSSAI", fullName: "Food Safety & Standards Authority", role: "Regulating food supplements and penalizing adulteration", icon: UtensilsCrossed, variant: "cyan" as const },
  { name: "NCRB", fullName: "National Crime Records Bureau", role: "Tracking national data on convictions related to food and drug adulteration", icon: Database, variant: "teal" as const },
  { name: "Health Depts", fullName: "State Health Departments", role: "Monitoring the illegal sale of steroids at the local level", icon: Stethoscope, variant: "green" as const },
];

const variantColors = { blue: "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]", cyan: "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]", teal: "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]", green: "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]" };

export const NadaSlide13Synergy = ({ forCapture = false }: NadaSlide13SynergyProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">The Multi-Force Anti-Doping Taskforce</h2>
        <p className="text-xl text-muted-foreground">Inter-Agency Synergy</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {agencies.map((agency, index) => (
          <NadaGlassmorphicCard key={agency.name} forCapture={forCapture} delay={0.1 + index * 0.08} className="p-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${variantColors[agency.variant]} flex-shrink-0`}>
                <agency.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">{agency.name}</h3>
                  <span className={`nada-badge-${agency.variant}`}>Partner</span>
                </div>
                <p className="text-base text-muted-foreground mb-2">{agency.fullName}</p>
                <p className="text-lg text-muted-foreground leading-relaxed">{agency.role}</p>
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }} className="nada-glass-card rounded-xl p-8">
        <h3 className="text-2xl font-bold text-foreground text-center mb-6">Unified Command Structure</h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {agencies.map((agency, index) => (
            <div key={agency.name} className="flex items-center gap-4">
              <span className={`nada-badge-${agency.variant}`}>{agency.name}</span>
              {index < agencies.length - 1 && <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />}
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] text-white text-xl font-bold">
            <Shield className="w-6 h-6" />NADA Coordination Hub
          </div>
        </div>
      </motion.div>
    </div>
  );
};
