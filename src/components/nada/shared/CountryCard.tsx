import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface CountryCardProps {
  country: string;
  flag?: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  forCapture?: boolean;
  delay?: number;
  variant?: "blue" | "cyan" | "teal" | "red" | "green" | "navy";
}

export const CountryCard = ({
  country,
  flag,
  title,
  description,
  icon: Icon,
  forCapture = false,
  delay = 0,
  variant = "blue",
}: CountryCardProps) => {
  const variantClasses = {
    blue: "nada-badge-blue",
    cyan: "nada-badge-cyan",
    teal: "nada-badge-teal",
    red: "nada-badge-red",
    green: "nada-badge-green",
    navy: "nada-badge-navy",
  };

  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.5 }}
      className="nada-glass-card rounded-xl p-5 h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        {flag && <span className="text-2xl">{flag}</span>}
        <span className={variantClasses[variant]}>{country}</span>
      </div>
      
      <div className="flex items-start gap-3 flex-1">
        {Icon && (
          <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};
