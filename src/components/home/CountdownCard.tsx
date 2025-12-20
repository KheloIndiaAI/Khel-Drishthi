import { useEffect, useState } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

interface CountdownCardProps {
  title: string;
  date: Date;
  variant: "saffron" | "green" | "navy";
}

const CountdownCard = ({ title, date, variant }: CountdownCardProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = differenceInDays(date, now);
      const hours = differenceInHours(date, now) % 24;
      const minutes = differenceInMinutes(date, now) % 60;
      const seconds = differenceInSeconds(date, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  const variantStyles = {
    saffron: "saffron-gradient",
    green: "green-gradient",
    navy: "navy-gradient",
  };

  return (
    <div className={`countdown-card ${variantStyles[variant]} text-white shadow-lg`}>
      <h3 className="font-display text-2xl md:text-3xl mb-4 tracking-wider">{title}</h3>
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Mins" },
          { value: timeLeft.seconds, label: "Secs" },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <span className="font-display text-3xl md:text-5xl">{item.value}</span>
            <span className="text-xs md:text-sm opacity-80">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownCard;
