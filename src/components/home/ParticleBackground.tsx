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
    // Using actual color values for visibility
    const colors = [
      "rgba(255, 153, 51, 0.6)",  // Saffron
      "rgba(19, 136, 8, 0.5)",    // India Green
      "rgba(0, 0, 128, 0.4)",     // Navy
      "rgba(255, 153, 51, 0.5)",  // Saffron lighter
      "rgba(19, 136, 8, 0.4)",    // Green lighter
    ];

    const newParticles: Particle[] = Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
    }));

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-slate-50/60 to-emerald-50/80 dark:from-slate-900/80 dark:via-slate-800/60 dark:to-slate-900/80" />
      
      {/* Large animated gradient orbs */}
      <div 
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(255, 153, 51, 0.25) 0%, rgba(255, 153, 51, 0.05) 70%, transparent 100%)' }}
      />
      <div 
        className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(19, 136, 8, 0.25) 0%, rgba(19, 136, 8, 0.05) 70%, transparent 100%)', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, rgba(0, 0, 128, 0.15) 0%, rgba(0, 0, 128, 0.03) 70%, transparent 100%)', animationDelay: '1s' }}
      />
      
      {/* Floating geometric shapes - more visible */}
      <div 
        className="absolute top-24 left-[8%] h-20 w-20 rotate-45 animate-float"
        style={{ border: '2px solid rgba(255, 153, 51, 0.4)' }}
      />
      <div 
        className="absolute top-48 right-[12%] h-16 w-16 rounded-full animate-float"
        style={{ border: '2px solid rgba(19, 136, 8, 0.4)', animationDelay: '1s' }}
      />
      <div 
        className="absolute bottom-36 left-[18%] h-12 w-12 rotate-12 animate-float"
        style={{ background: 'rgba(255, 153, 51, 0.2)', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-36 right-[22%] h-10 w-10 rounded-full animate-float"
        style={{ background: 'rgba(19, 136, 8, 0.2)', animationDelay: '0.5s' }}
      />
      <div 
        className="absolute bottom-24 right-[8%] h-14 w-14 rotate-45 animate-float"
        style={{ border: '2px solid rgba(0, 0, 128, 0.3)', animationDelay: '3s' }}
      />
      <div 
        className="absolute top-1/2 left-[4%] h-8 w-8 rounded-full animate-float"
        style={{ background: 'rgba(255, 153, 51, 0.25)', animationDelay: '1.5s' }}
      />
      <div 
        className="absolute bottom-48 right-[28%] h-16 w-16 rotate-45 animate-float"
        style={{ border: '1px solid rgba(255, 153, 51, 0.25)', animationDelay: '4s' }}
      />

      {/* Animated particles/dots - using inline styles for colors */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animation: `particle-drift ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Bottom fade to content */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
};

export default ParticleBackground;
