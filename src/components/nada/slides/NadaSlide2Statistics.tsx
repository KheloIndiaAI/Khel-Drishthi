import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, TestTube, AlertTriangle } from "lucide-react";
import { StatCard } from "../shared/StatCard";
import { ProgressBar } from "../shared/ProgressBar";
import { NadaGlassmorphicCard } from "../shared/NadaGlassmorphicCard";

interface NadaSlide2StatisticsProps {
  forCapture?: boolean;
}

export const NadaSlide2Statistics = ({ forCapture = false }: NadaSlide2StatisticsProps) => {
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
          Rising Vigilance, Falling Violations
        </h2>
        <p className="text-muted-foreground">Statistical Progress 2023–2025</p>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Testing Velocity Card */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.2} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Testing Velocity Surge</h3>
              <span className="nada-badge-green text-xs">
                <TrendingUp className="w-3 h-3" />
                +41% Growth
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">2023</p>
                <p className="text-2xl font-bold text-foreground">5,606</p>
              </div>
              <motion.div
                initial={forCapture ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.5, type: "spring" }}
                className="text-3xl"
              >
                →
              </motion.div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">2025</p>
                <p className="text-2xl font-bold nada-gradient-text">7,939</p>
              </div>
            </div>
            
            <ProgressBar
              value={7939}
              max={10000}
              label="Sample Collection Progress"
              forCapture={forCapture}
              delay={0.4}
              variant="blue"
            />
          </div>
        </NadaGlassmorphicCard>

        {/* AAF Reduction Card */}
        <NadaGlassmorphicCard forCapture={forCapture} delay={0.3} className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Deterrence Impact</h3>
              <span className="nada-badge-green text-xs">
                <TrendingDown className="w-3 h-3" />
                AAF Rate Dropped
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground">2023 AAF</p>
                <p className="text-2xl font-bold text-[hsl(0,70%,50%)]">3.8%</p>
              </div>
              <motion.div
                initial={forCapture ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={forCapture ? { duration: 0 } : { delay: 0.6, type: "spring" }}
                className="text-3xl"
              >
                →
              </motion.div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">2025 AAF</p>
                <p className="text-2xl font-bold text-[hsl(145,70%,35%)]">1.6%</p>
              </div>
            </div>
            
            <ProgressBar
              value={16}
              max={100}
              label="Current AAF Rate"
              forCapture={forCapture}
              delay={0.5}
              variant="green"
            />
          </div>
        </NadaGlassmorphicCard>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={forCapture ? false : { opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.6, duration: 0.5 }}
          className="nada-glass-card rounded-xl p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)]">
            <TestTube className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">
            Increased frequency of <strong>out-of-competition testing</strong> has created a visible psychological deterrent.
          </p>
        </motion.div>

        <motion.div
          initial={forCapture ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={forCapture ? { duration: 0 } : { delay: 0.7, duration: 0.5 }}
          className="nada-glass-card rounded-xl p-4 flex items-start gap-3"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">
            Greater detection capability is successfully reducing <strong>"intentional" doping habits</strong> across national camps.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
