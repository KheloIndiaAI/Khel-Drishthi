import { motion } from "framer-motion";
import { Briefcase, FileText, Mail, Ban, AlertTriangle, CheckCircle2 } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide7EmploymentProps {
  forCapture?: boolean;
}

const measures = [
  {
    icon: Briefcase,
    title: "Zero Tolerance in Recruitment",
    description: "Exploring mandatory dope tests during recruitment meets for major departments",
    targets: ["Railways", "Services", "Public Sector"],
    badge: "Recruitment",
    variant: "blue" as const,
  },
  {
    icon: FileText,
    title: "Service Rules Revision",
    description: "Inclusion of termination of service as a penalty for any sportsperson found guilty of ADRVs",
    targets: ["Termination Clause", "ADRV Penalties", "Employment Terms"],
    badge: "Policy",
    variant: "red" as const,
  },
  {
    icon: Mail,
    title: "Ministry Mandate",
    description: "Issuance of DO letters to all recruitment agencies highlighting stringent disciplinary measures",
    targets: ["DO Letters", "Agency Guidelines", "Compliance Framework"],
    badge: "Directive",
    variant: "navy" as const,
  },
];

export const NadaSlide7Employment = ({ forCapture = false }: NadaSlide7EmploymentProps) => {
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
          Doping Consequences: Impact on Livelihood
        </h2>
        <p className="text-muted-foreground">Social & Employment Deterrence</p>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.2, duration: 0.5 }}
        className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[hsla(0,70%,50%,0.1)] to-[hsla(30,90%,50%,0.1)] border border-[hsla(0,70%,50%,0.2)]"
      >
        <div className="flex items-center gap-3">
          <Ban className="w-8 h-8 text-[hsl(0,70%,50%)]" />
          <div>
            <h3 className="font-bold text-foreground">Zero Tolerance Policy</h3>
            <p className="text-sm text-muted-foreground">
              Doping violations now carry career-ending consequences beyond sporting bans
            </p>
          </div>
        </div>
      </motion.div>

      {/* Measures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {measures.map((measure, index) => (
          <NadaGlassmorphicCard
            key={measure.title}
            forCapture={forCapture}
            delay={0.3 + index * 0.15}
            className="p-6 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${
                measure.variant === "blue" 
                  ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]"
                  : measure.variant === "red"
                  ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]"
                  : "from-[hsl(230,60%,20%)] to-[hsl(220,70%,30%)]"
              }`}>
                <measure.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`${
                measure.variant === "blue" ? "nada-badge-blue" 
                : measure.variant === "red" ? "nada-badge-red"
                : "nada-badge-navy"
              } text-xs`}>
                {measure.badge}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-foreground mb-2">{measure.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{measure.description}</p>

            {/* Targets */}
            <div className="space-y-2 pt-4 border-t border-border/30">
              {measure.targets.map((target, targetIndex) => (
                <motion.div
                  key={target}
                  initial={forCapture ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={forCapture ? { duration: 0 } : { delay: 0.5 + index * 0.1 + targetIndex * 0.08, duration: 0.3 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-[hsl(210,100%,40%)]" />
                  <span className="text-muted-foreground">{target}</span>
                </motion.div>
              ))}
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Impact Statement */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.9, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-4 flex items-center gap-4"
      >
        <AlertTriangle className="w-6 h-6 text-[hsl(30,90%,50%)] flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Deterrence Effect:</strong> Athletes now face not just sporting bans, but potential loss of government employment and career opportunities
        </p>
      </motion.div>
    </div>
  );
};
