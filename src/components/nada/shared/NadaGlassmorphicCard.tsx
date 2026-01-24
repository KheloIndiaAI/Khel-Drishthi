import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NadaGlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  forCapture?: boolean;
  delay?: number;
  variant?: "default" | "stat" | "highlight";
}

export const NadaGlassmorphicCard = ({
  children,
  className,
  forCapture = false,
  delay = 0,
  variant = "default",
}: NadaGlassmorphicCardProps) => {
  const baseClasses = variant === "stat" ? "nada-stat-card" : "nada-glass-card rounded-xl";
  
  const highlightClasses = variant === "highlight" 
    ? "ring-2 ring-[hsl(210,100%,40%)]/30" 
    : "";

  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        forCapture
          ? { duration: 0 }
          : { delay, duration: 0.4, ease: "easeOut" }
      }
      className={cn(baseClasses, highlightClasses, className)}
    >
      {children}
    </motion.div>
  );
};
