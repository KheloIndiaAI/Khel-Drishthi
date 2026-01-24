import { motion } from "framer-motion";
import { GraduationCap, Globe, BookOpen, Users, CheckCircle2, Languages } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide4EducationProps {
  forCapture?: boolean;
}

const initiatives = [
  {
    icon: BookOpen,
    title: "Mandatory Certification",
    description: "Every registered athlete must complete the ADeL module before national participation.",
    badge: "Required",
    variant: "blue" as const,
  },
  {
    icon: Users,
    title: "Inclusive Outreach",
    description: "Mass awareness campaigns targeting rural training centers to eliminate 'accidental doping' as a defense.",
    badge: "Ongoing",
    variant: "cyan" as const,
  },
];

const languages = ["Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada"];

export const NadaSlide4Education = ({ forCapture = false }: NadaSlide4EducationProps) => {
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
          Building a "Clean Play" Culture
        </h2>
        <p className="text-xl text-muted-foreground">Proactive Prevention & Grassroots Outreach</p>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        {/* Left: Key Stats */}
        <div className="space-y-6">
          <StatCard
            value={343}
            label="Education Sessions"
            sublabel="Conducted in 2025"
            icon={GraduationCap}
            forCapture={forCapture}
            delay={0.1}
            variant="blue"
          />
          
          <NadaGlassmorphicCard forCapture={forCapture} delay={0.15} className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-xl font-bold text-foreground">WADA ADeL</h4>
            </div>
            <p className="text-base text-muted-foreground mb-4 leading-relaxed">
              Anti-Doping Education & Learning Platform
            </p>
            <span className="nada-badge-cyan">
              <CheckCircle2 className="w-4 h-4" />
              Official Partner
            </span>
          </NadaGlassmorphicCard>
        </div>

        {/* Center: Regional Focus */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.2} className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]">
              <Languages className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Regional Focus</h3>
              <p className="text-base text-muted-foreground">Language Localization</p>
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Translating WADA ADeL courses into Hindi and other regional languages for maximum reach.
          </p>

          <div className="flex flex-wrap gap-3">
            {languages.map((lang, index) => (
              <motion.span
                key={lang}
                initial={forCapture ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.3 + index * 0.05, duration: 0.3 }}
                className="px-4 py-2 rounded-full text-base font-semibold bg-background/60 text-foreground border-2 border-border/30"
              >
                {lang}
              </motion.span>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t-2 border-border/30">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[hsl(145,70%,35%)]" />
              <span className="text-lg text-muted-foreground">6+ Regional Languages Supported</span>
            </div>
          </div>
        </NadaGlassmorphicCard>

        {/* Right: Initiatives */}
        <div className="space-y-6">
          {initiatives.map((initiative, index) => (
            <NadaGlassmorphicCard
              key={initiative.title}
              forCapture={forCapture}
              delay={0.25 + index * 0.1}
              className="p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  initiative.variant === "blue" 
                    ? "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]"
                    : "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]"
                }`}>
                  <initiative.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-xl font-bold text-foreground">{initiative.title}</h4>
                    <span className={`${initiative.variant === "blue" ? "nada-badge-blue" : "nada-badge-cyan"} text-sm`}>
                      {initiative.badge}
                    </span>
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">{initiative.description}</p>
                </div>
              </div>
            </NadaGlassmorphicCard>
          ))}
        </div>
      </div>

      {/* Bottom Banner */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
        className="nada-glass-card rounded-xl p-6 text-center"
      >
        <p className="text-lg text-muted-foreground">
          <strong className="text-foreground">Goal:</strong> Ensure every athlete understands anti-doping rules before competing at the national level
        </p>
      </motion.div>
    </div>
  );
};
