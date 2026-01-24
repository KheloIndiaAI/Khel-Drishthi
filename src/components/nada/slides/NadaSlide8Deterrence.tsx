import { motion } from "framer-motion";
import { MapPin, Zap, MessageSquareWarning, GraduationCap, Target } from "lucide-react";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide8DeterrenceProps { forCapture?: boolean; }

const initiatives = [
  { icon: MapPin, title: "State-Level Focus", description: "Prioritizing testing in states reporting higher violation spikes", badge: "Geographic", variant: "blue" as const },
  { icon: Zap, title: "Surprise Raids", description: "Regular, unannounced inspections at SAI NCOE campuses and private training hubs", badge: "Enforcement", variant: "red" as const },
  { icon: MessageSquareWarning, title: "Whistleblower Program", description: "Launching the 'Speak-up' initiative to gather human intelligence on doping syndicates", badge: "Intelligence", variant: "cyan" as const },
  { icon: GraduationCap, title: "Grassroots Vigilance", description: "Expanding testing to University Games and School Games", badge: "Youth", variant: "teal" as const },
];

export const NadaSlide8Deterrence = ({ forCapture = false }: NadaSlide8DeterrenceProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      <motion.div initial={forCapture ? false : { opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={forCapture ? { duration: 0 } : { duration: 0.4 }} className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">Targeted Field Intelligence & Deterrence</h2>
        <p className="text-xl text-muted-foreground">Ground-Level Deterrence Strategy</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {initiatives.map((initiative, index) => (
          <NadaGlassmorphicCard key={initiative.title} forCapture={forCapture} delay={0.1 + index * 0.08} className="p-8">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-xl bg-gradient-to-br flex-shrink-0 ${initiative.variant === "blue" ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]" : initiative.variant === "red" ? "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]" : initiative.variant === "cyan" ? "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]" : "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]"}`}>
                <initiative.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-foreground">{initiative.title}</h3>
                  <span className={`nada-badge-${initiative.variant} text-sm`}>{initiative.badge}</span>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">{initiative.description}</p>
              </div>
            </div>
          </NadaGlassmorphicCard>
        ))}
      </div>

      <motion.div initial={forCapture ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }} className="nada-glass-card rounded-xl p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]">
            <MessageSquareWarning className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">"Speak-Up" Initiative</h3>
            <p className="text-lg text-muted-foreground">Anonymous Whistleblower Program</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[{ value: "100%", label: "Anonymous Reporting" }, { value: "24/7", label: "Hotline Access" }, { value: <Target className="w-8 h-8 inline" />, label: "Syndicate Targeting" }].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-3xl font-bold nada-gradient-text mb-2">{stat.value}</p>
              <p className="text-base text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
