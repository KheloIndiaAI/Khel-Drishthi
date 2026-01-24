import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, TestTube, AlertTriangle } from "lucide-react";
import { ProgressBar } from "../shared/ProgressBar";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide2StatisticsProps {
  forCapture?: boolean;
}

export const NadaSlide2Statistics = ({ forCapture = false }: NadaSlide2StatisticsProps) => {
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
          Rising Vigilance, Falling Violations
        </h2>
        <p className="text-xl text-muted-foreground">Statistical Progress 2023–2025</p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Testing Velocity Card */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.1} className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
              <TestTube className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Testing Velocity Surge</h3>
              <span className="nada-badge-green text-sm mt-1">
                <TrendingUp className="w-4 h-4" />
                +41% Growth
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-base text-muted-foreground mb-1">2023</p>
                <p className="text-4xl font-bold text-foreground">5,606</p>
              </div>
              <motion.div
                initial={forCapture ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.3, duration: 0.3 }}
                className="text-4xl text-muted-foreground"
              >
                →
              </motion.div>
              <div className="text-right">
                <p className="text-base text-muted-foreground mb-1">2025</p>
                <p className="text-4xl font-bold nada-gradient-text">7,939</p>
              </div>
            </div>
            
            <ProgressBar
              value={7939}
              max={10000}
              label="Sample Collection Progress"
              forCapture={forCapture}
              delay={0.2}
              variant="blue"
              size="lg"
            />
          </div>
        </NadaGlassmorphicCard>

        {/* AAF Reduction Card */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.15} className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Deterrence Impact</h3>
              <span className="nada-badge-green text-sm mt-1">
                <TrendingDown className="w-4 h-4" />
                AAF Rate Dropped
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-base text-muted-foreground mb-1">2023 AAF</p>
                <p className="text-4xl font-bold text-[hsl(0,70%,50%)]">3.8%</p>
              </div>
              <motion.div
                initial={forCapture ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.35, duration: 0.3 }}
                className="text-4xl text-muted-foreground"
              >
                →
              </motion.div>
              <div className="text-right">
                <p className="text-base text-muted-foreground mb-1">2025 AAF</p>
                <p className="text-4xl font-bold text-[hsl(145,70%,35%)]">1.6%</p>
              </div>
            </div>
            
            <ProgressBar
              value={16}
              max={100}
              label="Current AAF Rate"
              forCapture={forCapture}
              delay={0.25}
              variant="green"
              size="lg"
            />
          </div>
        </NadaGlassmorphicCard>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={forCapture ? false : { opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.4, duration: 0.4 }}
          className="nada-glass-card rounded-xl p-6 flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
            <TestTube className="w-6 h-6 text-white" />
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Increased frequency of <strong className="text-foreground">out-of-competition testing</strong> has created a visible psychological deterrent.
          </p>
        </motion.div>

        <motion.div
          initial={forCapture ? false : { opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.45, duration: 0.4 }}
          className="nada-glass-card rounded-xl p-6 flex items-start gap-4"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Greater detection capability is successfully reducing <strong className="text-foreground">"intentional" doping habits</strong> across national camps.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
