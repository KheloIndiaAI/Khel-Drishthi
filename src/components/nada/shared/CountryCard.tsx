import { motion } from "framer-motion";
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
      initial={forCapture ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.4 }}
      className="nada-glass-card rounded-xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-4 mb-4">
        {flag && <span className="text-4xl">{flag}</span>}
        <span className={variantClasses[variant]}>{country}</span>
      </div>
      
      <div className="flex items-start gap-4 flex-1">
        {Icon && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(185,80%,45%)] flex-shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-xl font-bold text-foreground mb-3">{title}</h4>
          <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};
