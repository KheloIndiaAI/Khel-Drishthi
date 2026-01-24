import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  forCapture?: boolean;
  delay?: number;
  variant?: "blue" | "cyan" | "teal" | "red" | "green";
}

export const StatCard = ({
  value,
  suffix = "",
  prefix = "",
  label,
  sublabel,
  icon: Icon,
  trend,
  trendValue,
  forCapture = false,
  delay = 0,
  variant = "blue",
}: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(forCapture ? value : 0);

  useEffect(() => {
    if (forCapture) {
      setDisplayValue(value);
      return;
    }

    const timer = setTimeout(() => {
      const duration = 1.5;
      const startTime = Date.now();
      
      const updateValue = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.floor(value * eased));
        
        if (progress < 1) {
          requestAnimationFrame(updateValue);
        } else {
          setDisplayValue(value);
        }
      };
      
      requestAnimationFrame(updateValue);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay, forCapture]);

  const variantColors = {
    blue: "from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]",
    cyan: "from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]",
    teal: "from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]",
    red: "from-[hsl(0,70%,50%)] to-[hsl(10,80%,55%)]",
    green: "from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]",
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.5 }}
      className="nada-stat-card"
    >
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", variantColors[variant])}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        {trend && trendValue && (
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", variantColors[variant])}>
          {prefix}{displayValue.toLocaleString()}{suffix}
        </div>
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sublabel && (
          <div className="text-xs text-muted-foreground">{sublabel}</div>
        )}
      </div>
    </motion.div>
  );
};
