import { motion } from "framer-motion";
import { Dumbbell, PersonStanding, Swords, CheckCircle2, AlertTriangle } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";
import { ProgressBar } from "../shared/ProgressBar";

interface NadaSlide3DisciplinesProps {
  forCapture?: boolean;
}

const disciplines = [
  {
    name: "Weightlifting",
    subtitle: "The Blueprint",
    icon: Dumbbell,
    status: "success",
    aaf2023: 8.4,
    aaf2025: 1.5,
    insight: "Mandatory 'Whereabouts' submission model",
    samples: "800+",
    variant: "green" as const,
  },
  {
    name: "Athletics",
    subtitle: "The Volume Leader",
    icon: PersonStanding,
    status: "success",
    aaf2023: 4.7,
    aaf2025: 1.8,
    insight: "Highest sample collection nationally",
    samples: "5,000+",
    variant: "blue" as const,
  },
  {
    name: "Wrestling & Wushu",
    subtitle: "Acute Monitoring Areas",
    icon: Swords,
    status: "warning",
    aaf2023: 4.2,
    aaf2025: 5.0,
    insight: "Requires enhanced intervention",
    samples: "600+",
    variant: "red" as const,
  },
];

export const NadaSlide3Disciplines = ({ forCapture = false }: NadaSlide3DisciplinesProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.4 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">
          Performance Analysis: Successes & Challenges
        </h2>
        <p className="text-xl text-muted-foreground">High-Risk Discipline Performance</p>
      </motion.div>

      {/* Discipline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {disciplines.map((discipline, index) => (
          <NadaGlassmorphicCard
            key={discipline.name}
            forCapture={forCapture}
            delay={0.1 + index * 0.1}
            variant={discipline.status === "warning" ? "highlight" : "default"}
            className="p-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-xl ${
                discipline.status === "success" 
                  ? "bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]"
                  : "bg-gradient-to-br from-[hsl(30,90%,50%)] to-[hsl(40,95%,55%)]"
              }`}>
                <discipline.icon className="w-8 h-8 text-white" />
              </div>
              {discipline.status === "success" ? (
                <CheckCircle2 className="w-8 h-8 text-[hsl(145,70%,35%)]" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-[hsl(30,90%,50%)]" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-foreground mb-2">{discipline.name}</h3>
            <p className="text-base text-muted-foreground mb-6">{discipline.subtitle}</p>

            {/* AAF Comparison */}
            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-background/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">2023 AAF</p>
                <p className="text-2xl font-bold text-[hsl(0,70%,50%)]">{discipline.aaf2023}%</p>
              </div>
              <span className="text-2xl text-muted-foreground">→</span>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">2025 AAF</p>
                <p className={`text-2xl font-bold ${
                  discipline.aaf2025 < discipline.aaf2023 
                    ? "text-[hsl(145,70%,35%)]" 
                    : "text-[hsl(30,90%,50%)]"
                }`}>
                  {discipline.aaf2025}%
                </p>
              </div>
            </div>

            {/* Progress */}
            <ProgressBar
              value={100 - discipline.aaf2025 * 10}
              max={100}
              label="Compliance Score"
              forCapture={forCapture}
              delay={0.2 + index * 0.1}
              variant={discipline.variant}
              size="md"
            />

            {/* Stats */}
            <div className="mt-6 pt-6 border-t-2 border-border/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-base text-muted-foreground">Samples Collected</span>
                <span className="text-lg font-bold text-foreground">{discipline.samples}</span>
              </div>
              <p className="text-base text-muted-foreground italic">{discipline.insight}</p>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Actionable Insight */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
        className="nada-glass-card rounded-xl p-6 flex items-center gap-6"
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] flex-shrink-0">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-foreground mb-2">Actionable Insight</h4>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Success in Weightlifting is attributed to mandatory <strong className="text-foreground">"Whereabouts" submission</strong>; 
            this model must be replicated in Wrestling and Wushu.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
