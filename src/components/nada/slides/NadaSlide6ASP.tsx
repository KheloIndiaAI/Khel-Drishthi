import { motion } from "framer-motion";
import { Users, UserCheck, Building, Syringe, Eye, AlertTriangle } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide6ASPProps {
  forCapture?: boolean;
}

const mandates = [
  { icon: Building, title: "NSF Anti-Doping Cell", description: "Every NSF must establish an 'Anti-Doping Awareness & Education Cell'" },
  { icon: Syringe, title: "No Needle Policy", description: "Universal implementation at all training camps" },
  { icon: Eye, title: "Entourage Monitoring", description: "Vetting and monitoring of support staff in high-risk zones" },
];

export const NadaSlide6ASP = ({ forCapture = false }: NadaSlide6ASPProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Accountability of the Support Ecosystem</h2>
        <p className="text-xl text-muted-foreground">Fixing ASP Responsibility</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.1} variant="highlight" className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <span className="nada-badge-red">Critical Reform</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Strict Liability for Enablers</h3>
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            Responsibility of the coach and Athlete Support Personnel (ASP) must be <strong className="text-foreground">invariably fixed</strong> in every violation case.
          </p>
          <div className="space-y-4">
            {[{ icon: Users, label: "Coaches", badge: "Primary", color: "blue" }, { icon: UserCheck, label: "Medical Staff", badge: "Primary", color: "cyan" }, { icon: Users, label: "Support Personnel", badge: "Secondary", color: "teal" }].map((item, i) => (
              <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-background/50">
                <item.icon className="w-6 h-6 text-[hsl(210,100%,40%)]" />
                <span className="text-lg font-semibold text-foreground">{item.label}</span>
                <span className={`ml-auto nada-badge-${item.color} text-sm`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </NadaGlassmorphicCard>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Institutional Mandates</h3>
          {mandates.map((mandate, index) => (
            <NadaGlassmorphicCard key={mandate.title} forCapture={forCapture} delay={0.2 + index * 0.1} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
                  <mandate.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{mandate.title}</h4>
                  <p className="text-base text-muted-foreground">{mandate.description}</p>
                </div>
              </div>
            </NadaGlassmorphicCard>
          ))}
        </div>
      </div>
    </div>
  );
};
