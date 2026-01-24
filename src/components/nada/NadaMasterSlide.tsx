import { ReactNode } from "react";

interface NadaMasterSlideProps {
  children: ReactNode;
  forCapture?: boolean;
}

export const NadaMasterSlide = ({ children, forCapture = false }: NadaMasterSlideProps) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Header with NADA branding */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-12 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(210,100%,40%)] via-[hsl(185,80%,45%)] to-[hsl(170,70%,35%)] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-base font-semibold text-foreground/80">NADA India</span>
        </div>
      </header>

      {/* Main content area - reduced padding for more space */}
      <main className="flex-1 flex items-center justify-center px-12 py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-12 py-4 flex items-center justify-between text-sm text-muted-foreground font-medium">
        <span>National Anti-Doping Agency (NADA) | Ministry of Youth Affairs & Sports</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
};
