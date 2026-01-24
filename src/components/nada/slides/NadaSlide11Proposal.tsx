import { motion } from "framer-motion";
import { Shield, AlertTriangle, Scale, CheckCircle2, Users, Handshake } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide11ProposalProps { forCapture?: boolean; }

export const NadaSlide11Proposal = ({ forCapture = false }: NadaSlide11ProposalProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <span className="nada-badge-green mb-4"><Scale className="w-5 h-5" />Recommended Approach</span>
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3 mt-4">The "Smart" Legal Model for India</h2>
        <p className="text-xl text-muted-foreground">A Balanced Approach</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.1} className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <span className="nada-badge-green">Athlete Protection</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Sporting Sanctions Only</h3>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">Maintain 2–4 year sporting sanctions for athletes (WADA consistent) <strong className="text-foreground">without criminal records</strong> for inadvertent use.</p>
          <div className="space-y-3">
            {["WADA Compliant", "Rehabilitation Focus", "No Criminal Record"].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                <CheckCircle2 className="w-5 h-5 text-[hsl(145,70%,35%)]" />
                <span className="text-base text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </NadaGlassmorphicCard>

        <NadaGlassmorphicCard forCapture={forCapture} delay={0.15} className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <span className="nada-badge-red">Criminal Deterrence</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Target the Syndicates</h3>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">Introduce <strong className="text-foreground">imprisonment and heavy fines</strong> for manufacturers, traffickers, and organized syndicates.</p>
          <div className="space-y-3">
            {["Manufacturers", "Traffickers", "Organized Syndicates"].map((item) => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                <AlertTriangle className="w-5 h-5 text-[hsl(0,70%,50%)]" />
                <span className="text-base text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </NadaGlassmorphicCard>
      </div>

      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.4 }} className="nada-glass-card rounded-xl p-8">
        <div className="flex items-center gap-6 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">The Rationale</h3>
            <p className="text-lg text-muted-foreground">Balanced & Effective</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed"><strong className="text-foreground">Disrupt the network/supply chain</strong> while maintaining global sporting harmony. This approach protects athletes while delivering maximum deterrence to the enablers who profit from doping.</p>
        <div className="flex items-center gap-4 mt-6 pt-6 border-t-2 border-border/30">
          <Users className="w-6 h-6 text-[hsl(145,70%,35%)]" />
          <span className="text-lg text-muted-foreground">Athletes remain eligible for rehabilitation; Syndicates face justice</span>
        </div>
      </motion.div>
    </div>
  );
};
