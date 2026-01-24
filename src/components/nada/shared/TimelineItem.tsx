import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  isLast?: boolean;
  forCapture?: boolean;
  delay?: number;
  variant?: "blue" | "cyan" | "teal" | "green";
}

export const TimelineItem = ({
  date,
  title,
  description,
  isLast = false,
  forCapture = false,
  delay = 0,
  variant = "blue",
}: TimelineItemProps) => {
  const variantColors = {
    blue: "bg-gradient-to-br from-[hsl(210,100%,40%)] to-[hsl(200,100%,50%)]",
    cyan: "bg-gradient-to-br from-[hsl(185,80%,45%)] to-[hsl(175,70%,50%)]",
    teal: "bg-gradient-to-br from-[hsl(170,70%,35%)] to-[hsl(160,60%,45%)]",
    green: "bg-gradient-to-br from-[hsl(145,70%,35%)] to-[hsl(155,60%,45%)]",
  };

  const shadowColors = {
    blue: "shadow-[0_0_0_4px_hsla(210,100%,40%,0.2)]",
    cyan: "shadow-[0_0_0_4px_hsla(185,80%,45%,0.2)]",
    teal: "shadow-[0_0_0_4px_hsla(170,70%,35%,0.2)]",
    green: "shadow-[0_0_0_4px_hsla(145,70%,35%,0.2)]",
  };

  return (
    <motion.div
      initial={forCapture ? false : { opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={forCapture ? { duration: 0 } : { delay, duration: 0.5 }}
      className="relative pl-10 pb-8"
    >
      {/* Dot */}
      <div
        className={cn(
          "absolute left-0 top-1 w-5 h-5 rounded-full",
          variantColors[variant],
          shadowColors[variant]
        )}
      />
      
      {/* Line */}
      {!isLast && (
        <div className="absolute left-[9px] top-6 w-0.5 h-full bg-gradient-to-b from-[hsla(210,100%,40%,0.3)] to-transparent" />
      )}
      
      {/* Content */}
      <div className="nada-glass-card rounded-lg p-4">
        <div className="nada-badge-blue text-xs mb-2">{date}</div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};
