import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "saffron" | "green" | "navy";
  href?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, variant = "default", href }: StatsCardProps) => {
  const borderColors = {
    default: "border-l-primary",
    saffron: "border-l-saffron",
    green: "border-l-india-green",
    navy: "border-l-india-navy",
  };

  const iconColors = {
    default: "text-primary",
    saffron: "text-saffron",
    green: "text-india-green",
    navy: "text-india-navy",
  };

  const content = (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card p-5 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4",
      borderColors[variant],
      href && "cursor-pointer"
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="font-display text-3xl md:text-4xl tracking-tight">{value}</p>
          {trend && (
            <p className="text-xs text-accent mt-1">{trend}</p>
          )}
        </div>
        <div className={cn("p-2 rounded-lg bg-muted/50", iconColors[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

export default StatsCard;
