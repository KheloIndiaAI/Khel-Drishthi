import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassmorphicCard = ({
  children,
  className = "",
  hover = false,
}: GlassmorphicCardProps) => {
  return (
    <div
      className={cn(
        "chintan-glass-card rounded-2xl p-6",
        hover && "transition-all duration-300 hover:scale-105 hover:shadow-xl",
        className
      )}
    >
      {children}
    </div>
  );
};
