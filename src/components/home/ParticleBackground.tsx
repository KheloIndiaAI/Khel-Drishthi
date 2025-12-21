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

interface SportIcon {
  id: number;
  x: number;
  y: number;
  size: number;
  icon: string;
  color: string;
  duration: number;
  delay: number;
  rotation: number;
}

// Sports silhouette SVG paths
const sportsIcons = [
  // Running figure
  "M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7",
  // Basketball
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.33 0 2.55.36 3.62.97L12 8.59V4zm-4.93.97C8.18 4.36 9.4 4 10.73 4v4.59L7.07 4.97zM4 12c0-1.33.36-2.55.97-3.62L8.59 12l-3.62 3.62C4.36 14.55 4 13.33 4 12zm3.07 7.03L7.07 19c.97.61 2.19.97 3.52.97v-4.59l-3.52 3.65zm5.52 3.65c1.33 0 2.55-.36 3.52-.97l.01-.01-3.53-3.65V20zm7.44-4.06c-.61.97-1.83 1.97-3.16 1.97V15.41l3.16 3.21zM15.41 12l3.62-3.62c.61 1.07.97 2.29.97 3.62s-.36 2.55-.97 3.62L15.41 12z",
  // Soccer ball
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  // Tennis racket
  "M19.52 2.49c-2.34-2.34-6.62-1.87-9.55 1.06-1.6 1.6-2.52 3.87-2.54 5.46-.02 1.58.26 3.89-1.35 5.5l-4.24 4.24 1.42 1.42 4.24-4.24c1.61-1.61 3.92-1.33 5.5-1.35 1.59-.02 3.86-.94 5.46-2.54 2.92-2.93 3.4-7.21 1.06-9.55zm-9.2 9.19c-1.53-1.53-1.05-4.61 1.06-6.72s5.18-2.59 6.72-1.06c1.53 1.53 1.05 4.61-1.06 6.72s-5.19 2.59-6.72 1.06z",
  // Weightlifting
  "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z",
  // Swimming
  "M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z",
  // Cycling
  "M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z",
  // Archery target
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
];

const ParticleBackground = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [sportIcons, setSportIcons] = useState<SportIcon[]>([]);

  useEffect(() => {
    // Using actual color values for visibility
    const colors = [
      "rgba(255, 153, 51, 0.6)",  // Saffron
      "rgba(19, 136, 8, 0.5)",    // India Green
      "rgba(0, 0, 128, 0.4)",     // Navy
      "rgba(255, 153, 51, 0.5)",  // Saffron lighter
      "rgba(19, 136, 8, 0.4)",    // Green lighter
    ];

    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
    }));

    // Create floating sports icons
    const newSportIcons: SportIcon[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 80 + 10,
      size: Math.random() * 20 + 24,
      icon: sportsIcons[Math.floor(Math.random() * sportsIcons.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 8,
      rotation: Math.random() * 360,
    }));

    setParticles(newParticles);
    setSportIcons(newSportIcons);
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

      {/* Floating sports icons */}
      {sportIcons.map((icon) => (
        <svg
          key={`sport-${icon.id}`}
          className="absolute opacity-60 dark:opacity-40"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            fill: icon.color,
            animation: `float ${icon.duration}s ease-in-out infinite`,
            animationDelay: `${icon.delay}s`,
            transform: `rotate(${icon.rotation}deg)`,
            filter: `drop-shadow(0 0 8px ${icon.color})`,
          }}
          viewBox="0 0 24 24"
        >
          <path d={icon.icon} />
        </svg>
      ))}

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
