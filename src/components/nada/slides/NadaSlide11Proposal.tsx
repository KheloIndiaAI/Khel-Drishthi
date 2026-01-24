import { motion } from "framer-motion";
import { Shield, AlertTriangle, Scale, CheckCircle2, Users, Handshake } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide11ProposalProps {
  forCapture?: boolean;
}

export const NadaSlide11Proposal = ({ forCapture = false }: NadaSlide11ProposalProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.6 }}
        className="text-center mb-8"
      >
        <span className="nada-badge-green mb-4">
          <Scale className="w-4 h-4" />
          Recommended Approach
        </span>
        <h2 className="text-3xl md:text-4xl font-bold nada-gradient-text mb-2 mt-3">
          The "Smart" Legal Model for India
        </h2>
        <p className="text-muted-foreground">A Balanced Approach</p>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Athlete Protection */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.2} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="nada-badge-green">Athlete Protection</span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">
            Sporting Sanctions Only
          </h3>

          <p className="text-muted-foreground mb-4">
            Maintain 2–4 year sporting sanctions for athletes (WADA consistent) 
            <strong className="text-foreground"> without criminal records</strong> for inadvertent use.
          </p>

          <div className="space-y-2">
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <CheckCircle2 className="w-4 h-4 text-[hsl(145,70%,35%)]" />
              <span className="text-sm text-muted-foreground">WADA Compliant</span>
            </motion.div>
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <CheckCircle2 className="w-4 h-4 text-[hsl(145,70%,35%)]" />
              <span className="text-sm text-muted-foreground">Rehabilitation Focus</span>
            </motion.div>
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <CheckCircle2 className="w-4 h-4 text-[hsl(145,70%,35%)]" />
              <span className="text-sm text-muted-foreground">No Criminal Record</span>
            </motion.div>
          </div>
        </NadaGlassmorphicCard>

        {/* Criminal Deterrence */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.3} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="nada-badge-red">Criminal Deterrence</span>
          </div>

          <h3 className="text-xl font-bold text-foreground mb-4">
            Target the Syndicates
          </h3>

          <p className="text-muted-foreground mb-4">
            Introduce <strong className="text-foreground">imprisonment and heavy fines</strong> for 
            manufacturers, traffickers, and organized syndicates.
          </p>

          <div className="space-y-2">
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <AlertTriangle className="w-4 h-4 text-[hsl(0,70%,50%)]" />
              <span className="text-sm text-muted-foreground">Manufacturers</span>
            </motion.div>
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <AlertTriangle className="w-4 h-4 text-[hsl(0,70%,50%)]" />
              <span className="text-sm text-muted-foreground">Traffickers</span>
            </motion.div>
            <motion.div
              initial={forCapture ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.3 }}
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50"
            >
              <AlertTriangle className="w-4 h-4 text-[hsl(0,70%,50%)]" />
              <span className="text-sm text-muted-foreground">Organized Syndicates</span>
            </motion.div>
          </div>
        </NadaGlassmorphicCard>
      </div>

      {/* Rationale */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
            <Handshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">The Rationale</h3>
            <p className="text-sm text-muted-foreground">Balanced & Effective</p>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          <strong className="text-foreground">Disrupt the network/supply chain</strong> while maintaining 
          global sporting harmony. This approach protects athletes while delivering maximum deterrence 
          to the enablers who profit from doping.
        </p>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
          <Users className="w-5 h-5 text-[hsl(145,70%,35%)]" />
          <span className="text-sm text-muted-foreground">
            Athletes remain eligible for rehabilitation; Syndicates face justice
          </span>
        </div>
      </motion.div>
    </div>
  );
};
