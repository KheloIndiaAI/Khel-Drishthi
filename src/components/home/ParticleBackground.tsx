import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      "bg-saffron/30",
      "bg-india-green/30", 
      "bg-india-navy/20",
      "bg-saffron/20",
      "bg-india-green/20",
    ];

    const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large gradient orbs */}
      <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-saffron/20 to-saffron/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
      <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-india-green/20 to-india-green/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-india-navy/10 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
      
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-[10%] h-16 w-16 rotate-45 border-2 border-saffron/20 animate-float" />
      <div className="absolute top-40 right-[15%] h-12 w-12 rounded-full border-2 border-india-green/20 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-[20%] h-8 w-8 rotate-12 bg-saffron/10 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-32 right-[25%] h-6 w-6 rounded-full bg-india-green/10 animate-float" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-20 right-[10%] h-10 w-10 rotate-45 border border-india-navy/15 animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-[5%] h-4 w-4 rounded-full bg-saffron/15 animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-40 right-[30%] h-14 w-14 rotate-45 border border-saffron/10 animate-float" style={{ animationDelay: '4s' }} />

      {/* Animated particles/dots */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `particle-drift ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      
      {/* Moving gradient wave */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};

export default ParticleBackground;
