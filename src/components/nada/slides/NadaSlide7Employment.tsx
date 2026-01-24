import { motion } from "framer-motion";
import { Briefcase, FileText, Mail, Ban, AlertTriangle, CheckCircle2 } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide7EmploymentProps { forCapture?: boolean; }

const measures = [
  { icon: Briefcase, title: "Zero Tolerance in Recruitment", description: "Exploring mandatory dope tests during recruitment meets for major departments", targets: ["Railways", "Services", "Public Sector"], badge: "Recruitment", variant: "blue" as const },
  { icon: FileText, title: "Service Rules Revision", description: "Inclusion of termination of service as a penalty for any sportsperson found guilty of ADRVs", targets: ["Termination Clause", "ADRV Penalties", "Employment Terms"], badge: "Policy", variant: "red" as const },
  { icon: Mail, title: "Ministry Mandate", description: "Issuance of DO letters to all recruitment agencies highlighting stringent disciplinary measures", targets: ["DO Letters", "Agency Guidelines", "Compliance Framework"], badge: "Directive", variant: "navy" as const },
];

export const NadaSlide7Employment = ({ forCapture = false }: NadaSlide7EmploymentProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Doping Consequences: Impact on Livelihood</h2>
        <p className="text-xl text-muted-foreground">Social & Employment Deterrence</p>
      </motion.div>

      <motion.div initial={forCapture ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={forCapture ? { duration: 0 } : { delay: 0.1, duration: 0.4 }} className="mb-8 p-6 rounded-xl bg-gradient-to-r from-[hsla(0,70%,50%,0.1)] to-[hsla(30,90%,50%,0.1)] border-2 border-[hsla(0,70%,50%,0.2)]">
        <div className="flex items-center gap-4">
          <Ban className="w-10 h-10 text-[hsl(0,70%,50%)]" />
          <div>
            <h3 className="text-2xl font-bold text-foreground">Zero Tolerance Policy</h3>
            <p className="text-lg text-muted-foreground">Doping violations now carry career-ending consequences beyond sporting bans</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {measures.map((measure, index) => (
          <NadaGlassmorphicCard key={measure.title} forCapture={forCapture} delay={0.15 + index * 0.1} className="p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${measure.variant === "blue" ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]" : measure.variant === "red" ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]" : "from-[hsl(230,60%,20%)] to-[hsl(220,70%,30%)]"}`}>
                <measure.icon className="w-8 h-8 text-white" />
              </div>
              <span className={`nada-badge-${measure.variant}`}>{measure.badge}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">{measure.title}</h3>
            <p className="text-lg text-muted-foreground mb-6 flex-grow leading-relaxed">{measure.description}</p>
            <div className="space-y-3 pt-6 border-t-2 border-border/30">
              {measure.targets.map((target) => (
                <div key={target} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[hsl(210,100%,40%)]" />
                  <span className="text-base text-muted-foreground">{target}</span>
                </div>
              ))}
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>
    </div>
  );
};
