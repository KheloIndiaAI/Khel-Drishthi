import { motion } from "framer-motion";
import { Shield, Ship, Factory } from "lucide-react";
import { CountryCard } from "../shared/CountryCard";

interface NadaSlide10PracticesProps { forCapture?: boolean; }

const practices = [
  { country: "USA", flag: "🇺🇸", title: "Rodchenkov Act", description: "Successfully targets organized fraud and doping conspiracies in international events. Enables prosecution of foreign nationals involved in doping schemes affecting US competitions.", icon: Shield, variant: "blue" as const },
  { country: "Australia", flag: "🇦🇺", title: "Customs & Importation Laws", description: "Uses customs and importation laws to dismantle Performance Enhancing Drug (PED) supply chains. Border agencies work with sports authorities to intercept illegal substances.", icon: Ship, variant: "cyan" as const },
  { country: "China", flag: "🇨🇳", title: "Manufacturing Focus", description: "Strict focus on unauthorized manufacturing and sale of steroids and hormones. Heavy penalties for illicit production facilities and distribution networks.", icon: Factory, variant: "teal" as const },
];

export const NadaSlide10Practices = ({ forCapture = false }: NadaSlide10PracticesProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Lessons from International Frameworks</h2>
        <p className="text-xl text-muted-foreground">Targeted Best Practices</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {practices.map((practice, index) => (
          <CountryCard key={practice.country} {...practice} forCapture={forCapture} delay={0.1 + index * 0.1} />
        ))}
      </div>

      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }} className="nada-glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-foreground mb-5 text-center">Common Success Factors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[{ badge: "Focus", text: "Target supply chains, not just end users", color: "blue" }, { badge: "Collaboration", text: "Inter-agency cooperation is essential", color: "cyan" }, { badge: "Penalties", text: "Heavy penalties for manufacturers & traffickers", color: "teal" }].map((item) => (
            <div key={item.badge} className="p-4 rounded-xl bg-background/50 text-center">
              <div className={`nada-badge-${item.color} mb-3`}>{item.badge}</div>
              <p className="text-base text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
