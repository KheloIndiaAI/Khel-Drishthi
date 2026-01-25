import { motion } from "framer-motion";
import { Scale, Gavel, Target, Users } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide9GlobalProps { forCapture?: boolean; }

const approaches = [
  { title: "Sporting Sanctions Only", countries: ["UK", "Canada", "Japan"], description: "Rely on WADC-compliant bans; no criminal records", pros: ["No judicial burden", "Athlete rehabilitation focus"], cons: ["Limited deterrence for syndicates"], icon: Scale, variant: "blue" as const },
  { title: "Full Criminalization", countries: ["Italy", "Germany", "France"], description: "Criminalize self-use; risks judicial backlog", pros: ["Strong deterrent message", "Public accountability"], cons: ["Judicial backlog", "Athletes face criminal records"], icon: Gavel, variant: "red" as const },
  { title: "Targeted Criminalization", countries: ["USA", "Australia"], description: "Focus on conspiracies and supply chains", pros: ["Targets enablers", "Protects athletes"], cons: ["Complex enforcement", "Requires inter-agency coordination"], icon: Target, variant: "green" as const },
];

export const NadaSlide9Global = ({ forCapture = false }: NadaSlide9GlobalProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-6">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Global Approaches to Doping Crimes</h2>
        <p className="text-xl text-muted-foreground">Global Legal Landscape</p>
      </motion.div>

      {/* Compact 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        {approaches.map((approach, index) => (
          <NadaGlassmorphicCard key={approach.title} forCapture={forCapture} delay={0.1 + index * 0.1} className="p-5 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${approach.variant === "blue" ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]" : approach.variant === "red" ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]" : "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]"}`}>
                <approach.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{approach.title}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {approach.countries.map((country) => (
                <span key={country} className={`nada-badge-${approach.variant} text-xs py-1 px-2`}>{country}</span>
              ))}
            </div>
            <p className="text-base text-muted-foreground mb-4 flex-grow leading-relaxed">{approach.description}</p>
            <div className="space-y-3 pt-4 border-t-2 border-border/30">
              <div>
                <p className="text-sm font-bold text-[hsl(145,70%,35%)] mb-1">Advantages</p>
                {approach.pros.map((pro) => <p key={pro} className="text-sm text-muted-foreground">+ {pro}</p>)}
              </div>
              <div>
                <p className="text-sm font-bold text-[hsl(0,70%,50%)] mb-1">Challenges</p>
                {approach.cons.map((con) => <p key={con} className="text-sm text-muted-foreground">− {con}</p>)}
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Key Takeaway - Compact */}
      <motion.div initial={forCapture ? false : { opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }} className="nada-glass-card rounded-xl p-5 flex items-center gap-5">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-foreground mb-1">Key Takeaway</h4>
          <p className="text-base text-muted-foreground">Most modern systems are shifting toward targeting <strong className="text-foreground">"Enablers"</strong> rather than the athlete.</p>
        </div>
      </motion.div>
    </div>
  );
};
