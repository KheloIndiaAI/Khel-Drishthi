import { useEffect, useState } from "react";
import { differenceInDays, format } from "date-fns";

interface CountdownCardProps {
  title: string;
  date: Date;
  variant: "saffron" | "green" | "navy";
}

const CountdownCard = ({ title, date, variant }: CountdownCardProps) => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const now = new Date();
      const days = differenceInDays(date, now);
      setDaysLeft(days);
    };

    calculateDays();
    const timer = setInterval(calculateDays, 3600000); // Update every hour

    return () => clearInterval(timer);
  }, [date]);

  const variantStyles = {
    saffron: "saffron-gradient",
    green: "green-gradient",
    navy: "navy-gradient",
  };

  const formattedDate = format(date, "MMMM d, yyyy");

  return (
    <div className={`countdown-card ${variantStyles[variant]} text-white shadow-lg`}>
      <h3 className="font-display text-xl md:text-2xl mb-1 tracking-wider">{title}</h3>
      <p className="text-sm opacity-80 mb-3">{formattedDate}</p>
      <div className="flex items-baseline justify-center gap-2">
        <span className="font-display text-5xl md:text-6xl">{daysLeft}</span>
        <span className="text-lg opacity-80">days to go</span>
      </div>
    </div>
  );
};

export default CountdownCard;
