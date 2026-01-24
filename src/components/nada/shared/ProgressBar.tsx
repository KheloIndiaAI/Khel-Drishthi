import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  forCapture?: boolean;
  delay?: number;
  variant?: "blue" | "cyan" | "teal" | "red" | "green";
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({
  value,
  max,
  label,
  showPercentage = true,
  forCapture = false,
  delay = 0,
  variant = "blue",
  size = "md",
}: ProgressBarProps) => {
  const percentage = Math.round((value / max) * 100);

  const variantColors = {
    blue: "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]",
    cyan: "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]",
    teal: "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]",
    red: "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]",
    green: "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]",
  };

  const sizeClasses = {
    sm: "h-3",
    md: "h-4",
    lg: "h-5",
  };

  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.3 }}
      className="w-full"
    >
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-base font-semibold text-foreground">{label}</span>}
          {showPercentage && (
            <span className="text-base font-bold nada-gradient-text">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn("nada-progress-bar", sizeClasses[size])}>
        <motion.div
          initial={forCapture ? { width: `${percentage}%` } : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={forCapture ? { duration: 0 } : { delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
          className={cn("nada-progress-bar-fill bg-gradient-to-r", variantColors[variant])}
        />
      </div>
    </motion.div>
  );
};
