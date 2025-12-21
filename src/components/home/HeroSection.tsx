import { useEffect, useState, useRef } from "react";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Building2, Trophy } from "lucide-react";

// Target dates
const LA28_DATE = new Date("2028-07-14");
const AG2026_DATE = new Date("2026-09-19");

interface FlipDigitProps {
  digit: string;
  delay: number;
}

const FlipDigit = ({ digit, delay }: FlipDigitProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsFlipped(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flip-digit-container">
      <div className={`flip-digit ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-digit-front">0</div>
        <div className="flip-digit-back">{digit}</div>
      </div>
    </div>
  );
};

interface CountUpNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const CountUpNumber = ({ end, duration = 2000, suffix = "" }: CountUpNumberProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <span ref={countRef} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

interface HeroKPICardProps {
  title: string;
  subtitle: string;
  days?: number;
  showCountdown?: boolean;
  icon?: React.ReactNode;
  delay: number;
}

const HeroKPICard = ({ title, subtitle, days, showCountdown, icon, delay }: HeroKPICardProps) => {
  const daysString = days?.toString().padStart(4, '0') || '0000';

  return (
    <div 
      className="hero-kpi-card animate-fade-in-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {showCountdown && days !== undefined ? (
        <>
          <div className="flex justify-center gap-1 mb-3">
            {daysString.split('').map((digit, i) => (
              <FlipDigit key={i} digit={digit} delay={delay + 200 + i * 150} />
            ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">days to go</p>
        </>
      ) : (
        <div className="flex items-center justify-center gap-2 mb-3">
          {icon}
          <span className="text-4xl font-bold text-foreground">
            <CountUpNumber end={parseInt(title.replace(/,/g, '')) || 0} />
          </span>
        </div>
      )}
      <h3 className="font-display text-lg tracking-wide text-foreground">{showCountdown ? title : ""}</h3>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
};

const HeroSection = () => {
  const la28Days = differenceInDays(LA28_DATE, new Date());
  const ag26Days = differenceInDays(AG2026_DATE, new Date());

  return (
    <section className="hero-section relative overflow-hidden py-12 px-4 mb-8">
      {/* Navy gradient background */}
      <div className="absolute inset-0 hero-navy-gradient" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-saffron/5 rounded-full blur-2xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Logo and Mission */}
        <div className="text-center mb-10">
          <div className="animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-4">
              <span className="text-saffron drop-shadow-lg">Khel</span>{" "}
              <span className="text-white drop-shadow-lg">Drishti</span>
            </h1>
          </div>
          
          {/* Tricolor bar */}
          <div className="flex justify-center gap-1 mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="h-1 w-16 rounded-full bg-saffron" />
            <div className="h-1 w-16 rounded-full bg-white" />
            <div className="h-1 w-16 rounded-full bg-india-green" />
          </div>
          
          {/* Mission Statement */}
          <p 
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            From <span className="text-saffron font-semibold">1 medal</span> in 1996 to{" "}
            <span className="text-saffron font-semibold">27 medals</span> today — Building champions for{" "}
            <span className="text-white font-semibold">Los Angeles 2028</span>
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <HeroKPICard
            title="LA 2028"
            subtitle="36 Sports • 351 Events"
            days={la28Days}
            showCountdown
            delay={100}
          />
          <HeroKPICard
            title="Asian Games 2026"
            subtitle="42 Sports • 462 Events"
            days={ag26Days}
            showCountdown
            delay={200}
          />
          <HeroKPICard
            title="1,147"
            subtitle="Training Centres across 36 States/UTs"
            icon={<Building2 className="h-8 w-8 text-saffron" />}
            delay={300}
          />
          <HeroKPICard
            title="8,053"
            subtitle="Athletes in elite training"
            icon={<Target className="h-8 w-8 text-saffron" />}
            delay={400}
          />
        </div>

        {/* CTA Buttons */}
        <div 
          className="flex flex-wrap justify-center gap-4 animate-fade-in"
          style={{ animationDelay: '600ms' }}
        >
          <Button 
            asChild 
            size="lg" 
            className="bg-saffron hover:bg-saffron/90 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Link to="/#sports">
              <Target className="mr-2 h-5 w-5" />
              Explore Sports
            </Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold px-8 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <Link to="/infrastructure">
              <Building2 className="mr-2 h-5 w-5" />
              View Infrastructure
            </Link>
          </Button>
          <Button 
            asChild 
            size="lg" 
            variant="outline"
            className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold px-8 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <Link to="/medals">
              <Trophy className="mr-2 h-5 w-5" />
              Medal Tracker
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
