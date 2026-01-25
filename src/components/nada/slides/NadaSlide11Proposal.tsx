import { motion } from "framer-motion";
import { Shield, AlertTriangle, Scale, CheckCircle2, Users, Handshake } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide11ProposalProps { forCapture?: boolean; }

export const NadaSlide11Proposal = ({ forCapture = false }: NadaSlide11ProposalProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-6">
        <span className="nada-badge-green mb-4"><Scale className="w-5 h-5" />Recommended Approach</span>
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3 mt-4">The "Smart" Legal Model for India</h2>
        <p className="text-xl text-muted-foreground">A Balanced Approach</p>
      </motion.div>

      {/* Two main cards - More compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.1} className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="nada-badge-green text-sm">Athlete Protection</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Sporting Sanctions Only</h3>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">Maintain 2–4 year sporting sanctions for athletes (WADA consistent) <strong className="text-foreground">without criminal records</strong> for inadvertent use.</p>
          <div className="space-y-2">
            {["WADA Compliant", "Rehabilitation Focus", "No Criminal Record"].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                <CheckCircle2 className="w-4 h-4 text-[hsl(145,70%,35%)]" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </NadaGlassmorphicCard>

        <NadaGlassmorphicCard forCapture={forCapture} delay={0.15} className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="nada-badge-red text-sm">Criminal Deterrence</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3">Target the Syndicates</h3>
          <p className="text-base text-muted-foreground mb-4 leading-relaxed">Introduce <strong className="text-foreground">imprisonment and heavy fines</strong> for manufacturers, traffickers, and organized syndicates.</p>
          <div className="space-y-2">
            {["Manufacturers", "Traffickers", "Organized Syndicates"].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                <AlertTriangle className="w-4 h-4 text-[hsl(0,70%,50%)]" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </NadaGlassmorphicCard>
      </div>

      {/* Rationale - Compact to avoid footer overlap */}
      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.4 }} className="nada-glass-card rounded-xl p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
            <Handshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">The Rationale</h3>
            <p className="text-base text-muted-foreground">Balanced & Effective</p>
          </div>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed mb-3"><strong className="text-foreground">Disrupt the network/supply chain</strong> while maintaining global sporting harmony.</p>
        <div className="flex items-center gap-3 pt-3 border-t border-border/30">
          <Users className="w-5 h-5 text-[hsl(145,70%,35%)]" />
          <span className="text-base text-muted-foreground">Athletes remain eligible for rehabilitation; Syndicates face justice</span>
        </div>
      </motion.div>
    </div>
  );
};
