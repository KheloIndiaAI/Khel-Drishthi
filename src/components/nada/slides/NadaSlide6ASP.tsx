import { motion } from "framer-motion";
import { Users, UserCheck, Building, Syringe, Eye, AlertTriangle } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide6ASPProps {
  forCapture?: boolean;
}

const mandates = [
  {
    icon: Building,
    title: "NSF Anti-Doping Cell",
    description: "Every NSF must establish an 'Anti-Doping Awareness & Education Cell'",
  },
  {
    icon: Syringe,
    title: "No Needle Policy",
    description: "Universal implementation at all training camps",
  },
  {
    icon: Eye,
    title: "Entourage Monitoring",
    description: "Vetting and monitoring of support staff in high-risk zones",
  },
];

export const NadaSlide6ASP = ({ forCapture = false }: NadaSlide6ASPProps) => {
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
          Accountability of the Support Ecosystem
        </h2>
        <p className="text-muted-foreground">Fixing ASP Responsibility</p>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left: Main Message */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.2} variant="highlight" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="nada-badge-red">Critical Reform</span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">
            Strict Liability for Enablers
          </h3>

          <p className="text-muted-foreground mb-6">
            Responsibility of the coach and Athlete Support Personnel (ASP) must be 
            <strong className="text-foreground"> invariably fixed</strong> in every violation case.
          </p>

          {/* Hierarchy Diagram */}
          <div className="space-y-3">
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
            >
              <Users className="w-5 h-5 text-[hsl(210,100%,40%)]" />
              <span className="font-medium text-foreground">Coaches</span>
              <span className="ml-auto nada-badge-blue text-xs">Primary</span>
            </motion.div>

            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
            >
              <UserCheck className="w-5 h-5 text-[hsl(185,80%,45%)]" />
              <span className="font-medium text-foreground">Medical Staff</span>
              <span className="ml-auto nada-badge-cyan text-xs">Primary</span>
            </motion.div>

            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
            >
              <Users className="w-5 h-5 text-[hsl(170,70%,35%)]" />
              <span className="font-medium text-foreground">Support Personnel</span>
              <span className="ml-auto nada-badge-teal text-xs">Secondary</span>
            </motion.div>
          </div>
        </NadaGlassmorphicCard>

        {/* Right: Institutional Mandates */}
        <div className="space-y-4">
          <motion.h3
            initial={forCapture ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.4 }}
            className="text-lg font-semibold text-foreground mb-4"
          >
            Institutional Mandates
          </motion.h3>

          {mandates.map((mandate, index) => (
            <NadaGlassmorphicCard
              key={mandate.title}
              forCapture={forCapture}
              delay={0.4 + index * 0.15}
              className="p-4"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] flex-shrink-0">
                  <mandate.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{mandate.title}</h4>
                  <p className="text-sm text-muted-foreground">{mandate.description}</p>
                </div>
              </div>
            </NadaGlassmorphicCard>
          ))}
        </div>
      </div>

      {/* Bottom Note */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.9, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Key Shift:</strong> From punishing athletes alone to holding the entire support ecosystem accountable
        </p>
      </motion.div>
    </div>
  );
};
