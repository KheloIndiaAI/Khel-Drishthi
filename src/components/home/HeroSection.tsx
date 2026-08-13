import { useEffect, useState, useRef } from "react";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Target, Building2, Trophy } from "lucide-react";

// Target dates with host cities
const GAMES = {
  LA28: { date: new Date("2028-07-14"), city: "Los Angeles", sports: 36, events: 351 },
  AG2026: { date: new Date("2026-09-19"), city: "Nagoya", sports: 42, events: 462 },
  CWG2026: { date: new Date("2026-07-23"), city: "Glasgow", sports: 20, events: 200 },
};

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
  start?: number;
}

const CountUpNumber = ({ end, duration = 2000, start = 0 }: CountUpNumberProps) => {
  const [count, setCount] = useState(start);
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
            setCount(Math.floor(start + (end - start) * easeOut));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );

    if (countRef.current) observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated, start]);

  return (
    <span ref={countRef} className="tabular-nums">
      {count.toLocaleString()}
    </span>
  );
};

interface CountdownCardProps {
  title: string;
  hostCity: string;
  days: number;
  sports: number;
  events: number;
  delay: number;
}

const CountdownCard = ({ title, hostCity, days, sports, events, delay }: CountdownCardProps) => {
  // Use 3 digits (max 999 days)
  const daysString = Math.min(days, 999).toString().padStart(3, '0');

  return (
    <div 
      className="hero-kpi-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Flip Digits */}
      <div className="flex justify-center gap-1.5 mb-2">
        {daysString.split('').map((digit, i) => (
          <FlipDigit key={i} digit={digit} delay={delay + 300 + i * 150} />
        ))}
      </div>
      
      {/* Days to go label */}
      <p className="text-sm text-gray-500 font-medium mb-3">days to go</p>
      
      {/* Game Title */}
      <h3 className="font-display text-lg tracking-wide text-gray-900 font-bold uppercase">
        {title}
      </h3>
      
      {/* Host City */}
      <p className="text-sm text-saffron font-semibold mb-1">{hostCity}</p>
      
      {/* Sports & Events */}
      <p className="text-xs text-gray-500">
        {sports} Sports • {events} Events
      </p>
    </div>
  );
};

interface CentreBreakdown {
  ncoe: number;
  stc: number;
  kic: number;
  kisce: number;
  total: number;
}

interface CentreCardProps {
  centres: CentreBreakdown;
  delay: number;
}

const CentreCard = ({ centres, delay }: CentreCardProps) => {
  return (
    <div 
      className="hero-kpi-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Building2 className="h-6 w-6 text-saffron" />
        <span className="text-3xl font-bold text-gray-900">
          <CountUpNumber end={centres.total} start={centres.total} />
        </span>
      </div>
      <p className="text-sm text-gray-700 font-semibold mb-2">Training Centres</p>
      
      {/* Breakdown grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">NCOE</span>
          <span className="font-semibold text-gray-700">{centres.ncoe}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">STC</span>
          <span className="font-semibold text-gray-700">{centres.stc}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">KIC</span>
          <span className="font-semibold text-gray-700">{centres.kic}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">KISCE</span>
          <span className="font-semibold text-gray-700">{centres.kisce}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">across 36 States/UTs</p>
    </div>
  );
};

interface AthleteCardProps {
  athletes: number;
  sanctioned: number;
  ncoeAthletes: number;
  stcAthletes: number;
  delay: number;
}

const AthleteCard = ({ athletes, sanctioned, ncoeAthletes, stcAthletes, delay }: AthleteCardProps) => {
  const percentage = Math.round((athletes / sanctioned) * 100);
  
  return (
    <div 
      className="hero-kpi-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-center gap-2 mb-3">
        <Target className="h-6 w-6 text-saffron" />
        <span className="text-3xl font-bold text-gray-900">
          <CountUpNumber end={athletes} start={athletes} />
        </span>
      </div>
      <p className="text-sm text-gray-700 font-semibold mb-2">Elite Athletes</p>
      
      {/* NCOE/STC Breakdown */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-2">
        <div className="flex justify-between">
          <span className="text-gray-500">NCOE</span>
          <span className="font-semibold text-gray-700">{ncoeAthletes.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">STC</span>
          <span className="font-semibold text-gray-700">{stcAthletes.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-saffron h-2 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Sanctioned</span>
        <span className="font-semibold text-gray-700">{sanctioned.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Utilization</span>
        <span className="font-semibold text-india-green">{percentage}%</span>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const la28Days = differenceInDays(GAMES.LA28.date, new Date());
  const ag26Days = differenceInDays(GAMES.AG2026.date, new Date());
  const cwg26Days = differenceInDays(GAMES.CWG2026.date, new Date());

  return (
    <section className="hero-section relative overflow-hidden py-10 px-6 mb-8 rounded-2xl">
      {/* Navy gradient background */}
      <div className="absolute inset-0 hero-navy-gradient rounded-2xl" />
      
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-saffron/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-saffron/5 rounded-full blur-2xl" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-4 animate-fade-in">
            <span className="text-saffron drop-shadow-lg italic">KHEL</span>{" "}
            <span className="text-white drop-shadow-lg">DRISHTI</span>
          </h1>
          
          {/* Tricolor bar */}
          <div className="flex justify-center gap-1.5 mb-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="h-1 w-14 rounded-full bg-saffron" />
            <div className="h-1 w-14 rounded-full bg-white" />
            <div className="h-1 w-14 rounded-full bg-india-green" />
          </div>
          
          {/* Mission Statement - Fixed Typography */}
          <div 
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <p className="leading-relaxed">
              From Norman Pritchard's silver in Paris 1900 to six medals in Paris 2024 — building champions for
            </p>
            <p className="text-white font-bold text-xl md:text-2xl mt-1">
              Los Angeles 2028
            </p>
          </div>
        </div>

        {/* KPI Cards Grid - 5 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <CountdownCard
            title="LA 2028"
            hostCity={GAMES.LA28.city}
            days={la28Days}
            sports={GAMES.LA28.sports}
            events={GAMES.LA28.events}
            delay={100}
          />
          <CountdownCard
            title="Asian Games 2026"
            hostCity={GAMES.AG2026.city}
            days={ag26Days}
            sports={GAMES.AG2026.sports}
            events={GAMES.AG2026.events}
            delay={200}
          />
          <CountdownCard
            title="CWG 2026"
            hostCity={GAMES.CWG2026.city}
            days={cwg26Days}
            sports={GAMES.CWG2026.sports}
            events={GAMES.CWG2026.events}
            delay={300}
          />
          <CentreCard
            centres={{
              ncoe: 25,
              stc: 66,
              kic: 1020,
              kisce: 36,
              total: 1147
            }}
            delay={400}
          />
          <AthleteCard
            athletes={8068}
            sanctioned={9157}
            ncoeAthletes={3245}
            stcAthletes={4823}
            delay={500}
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
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold px-8 backdrop-blur-sm transition-all duration-300 hover:scale-105"
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
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white font-semibold px-8 backdrop-blur-sm transition-all duration-300 hover:scale-105"
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
