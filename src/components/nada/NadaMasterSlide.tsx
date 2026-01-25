import { ReactNode } from "react";

interface NadaMasterSlideProps {
  children: ReactNode;
  forCapture?: boolean;
}

export const NadaMasterSlide = ({ children, forCapture = false }: NadaMasterSlideProps) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Main content area - increased bottom padding to prevent footer overlap */}
      <main className="flex-1 flex items-center justify-center px-12 pt-16 pb-28">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-12 py-6 flex items-center justify-between text-sm text-muted-foreground font-medium">
        <span>National Anti-Doping Agency (NADA) | Ministry of Youth Affairs & Sports</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
};
