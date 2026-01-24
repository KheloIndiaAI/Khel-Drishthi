import { motion } from "framer-motion";
import { Scale, Gavel, Target, Users } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide9GlobalProps {
  forCapture?: boolean;
}

const approaches = [
  {
    title: "Sporting Sanctions Only",
    countries: ["UK", "Canada", "Japan"],
    description: "Rely on WADC-compliant bans; no criminal records",
    pros: ["No judicial burden", "Athlete rehabilitation focus"],
    cons: ["Limited deterrence for syndicates"],
    icon: Scale,
    variant: "blue" as const,
  },
  {
    title: "Full Criminalization",
    countries: ["Italy", "Germany", "France"],
    description: "Criminalize self-use; risks judicial backlog",
    pros: ["Strong deterrent message", "Public accountability"],
    cons: ["Judicial backlog", "Athletes face criminal records"],
    icon: Gavel,
    variant: "red" as const,
  },
  {
    title: "Targeted Criminalization",
    countries: ["USA", "Australia"],
    description: "Focus on conspiracies and supply chains",
    pros: ["Targets enablers", "Protects athletes"],
    cons: ["Complex enforcement", "Requires inter-agency coordination"],
    icon: Target,
    variant: "green" as const,
  },
];

export const NadaSlide9Global = ({ forCapture = false }: NadaSlide9GlobalProps) => {
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
          Global Approaches to Doping Crimes
        </h2>
        <p className="text-muted-foreground">Global Legal Landscape</p>
      </motion.div>

      {/* Three Approach Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {approaches.map((approach, index) => (
          <NadaGlassmorphicCard
            key={approach.title}
            forCapture={forCapture}
            delay={0.2 + index * 0.15}
            className="p-6 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${
                approach.variant === "blue" 
                  ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]"
                  : approach.variant === "red"
                  ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]"
                  : "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]"
              }`}>
                <approach.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-2">{approach.title}</h3>
            
            {/* Countries */}
            <div className="flex flex-wrap gap-1 mb-3">
              {approach.countries.map((country) => (
                <span
                  key={country}
                  className={`${
                    approach.variant === "blue" ? "nada-badge-blue" 
                    : approach.variant === "red" ? "nada-badge-red"
                    : "nada-badge-green"
                  } text-xs px-2 py-0.5`}
                >
                  {country}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 flex-grow">{approach.description}</p>

            {/* Pros & Cons */}
            <div className="space-y-3 pt-4 border-t border-border/30">
              <div>
                <p className="text-xs font-semibold text-[hsl(145,70%,35%)] mb-1">Advantages</p>
                {approach.pros.map((pro, proIndex) => (
                  <motion.p
                    key={pro}
                    initial={forCapture ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={forCapture ? { duration: 0 } : { delay: 0.5 + index * 0.1 + proIndex * 0.05 }}
                    className="text-xs text-muted-foreground"
                  >
                    + {pro}
                  </motion.p>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[hsl(0,70%,50%)] mb-1">Challenges</p>
                {approach.cons.map((con, conIndex) => (
                  <motion.p
                    key={con}
                    initial={forCapture ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={forCapture ? { duration: 0 } : { delay: 0.6 + index * 0.1 + conIndex * 0.05 }}
                    className="text-xs text-muted-foreground"
                  >
                    − {con}
                  </motion.p>
                ))}
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      {/* Key Takeaway */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.8, duration: 0.5 }}
        className="nada-glass-card rounded-xl p-4 flex items-center gap-4"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)] flex-shrink-0">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">Key Takeaway</h4>
          <p className="text-sm text-muted-foreground">
            Most modern systems are shifting toward targeting <strong>"Enablers"</strong> rather than the athlete.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
