import { motion } from "framer-motion";
import { GraduationCap, Globe, BookOpen, Users, CheckCircle2, Languages, Target } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide4EducationProps {
  forCapture?: boolean;
}

const languages = ["Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Kannada"];

export const NadaSlide4Education = ({ forCapture = false }: NadaSlide4EducationProps) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-8">
      {/* Header */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { duration: 0.4 }}
        className="text-center mb-6"
      >
        <h2 className="text-4xl md:text-5xl font-bold nada-gradient-text mb-3">
          Building a "Clean Play" Culture
        </h2>
        <p className="text-xl text-muted-foreground">Proactive Prevention & Grassroots Outreach</p>
      </motion.div>

      {/* Streamlined 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Stats & Languages */}
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
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]">
                <Languages className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Regional Focus</h3>
                <p className="text-base text-muted-foreground">Language Localization</p>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Translating WADA ADeL courses into Hindi and other regional languages for maximum reach.
            </p>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang, index) => (
                <motion.span
                  key={lang}
                  initial={forCapture ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={forCapture ? { duration: 0 } : { delay: 0.3 + index * 0.05, duration: 0.3 }}
                  className="px-3 py-1.5 rounded-full text-sm font-semibold bg-background/60 text-foreground border border-border/30"
                >
                  {lang}
                </motion.span>
              ))}
            </div>
          </NadaGlassmorphicCard>
        </div>

        {/* Right Column: Initiatives */}
        <div className="space-y-6">
          <NadaGlassmorphicCard forCapture={forCapture} delay={0.2} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-foreground">Mandatory Certification</h4>
                  <span className="nada-badge-blue text-sm">Required</span>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Every registered athlete must complete the ADeL module before national participation.
                </p>
              </div>
            </div>
          </NadaGlassmorphicCard>

          <NadaGlassmorphicCard forCapture={forCapture} delay={0.25} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-foreground">Inclusive Outreach</h4>
                  <span className="nada-badge-cyan text-sm">Ongoing</span>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Mass awareness campaigns targeting rural training centers to eliminate 'accidental doping' as a defense.
                </p>
              </div>
            </div>
          </NadaGlassmorphicCard>

          <NadaGlassmorphicCard forCapture={forCapture} delay={0.3} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl font-bold text-foreground">WADA ADeL</h4>
                  <span className="nada-badge-green text-sm">
                    <CheckCircle2 className="w-3 h-3" />
                    Official Partner
                  </span>
                </div>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Anti-Doping Education & Learning Platform integration for standardized training.
                </p>
              </div>
            </div>
          </NadaGlassmorphicCard>
        </div>
      </div>

      {/* Goal Box - Prominent */}
      <motion.div
        initial={forCapture ? false : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={forCapture ? { duration: 0 } : { delay: 0.5, duration: 0.4 }}
        className="nada-glass-card rounded-xl p-6 border-l-4 border-[hsl(145,70%,35%)] flex items-center gap-6"
      >
        <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)] flex-shrink-0">
          <Target className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="text-xl font-bold text-foreground mb-1">Goal</h4>
          <p className="text-lg text-muted-foreground">
            Ensure every athlete understands anti-doping rules before competing at the national level
          </p>
        </div>
      </motion.div>
    </div>
  );
};
