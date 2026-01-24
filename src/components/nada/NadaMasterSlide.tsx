import { ReactNode } from "react";

interface NadaMasterSlideProps {
  children: ReactNode;
  forCapture?: boolean;
}

export const NadaMasterSlide = ({ children, forCapture = false }: NadaMasterSlideProps) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Header with NADA branding */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-sm font-medium text-foreground/70">NADA India</span>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center px-8 py-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-8 py-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>National Anti-Doping Agency (NADA) | Ministry of Youth Affairs & Sports</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
};
