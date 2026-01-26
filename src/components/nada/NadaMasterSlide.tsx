import { ReactNode } from "react";

interface NadaMasterSlideProps {
  children: ReactNode;
  forCapture?: boolean;
  slideTitle?: string;
}

export const NadaMasterSlide = ({ children, forCapture = false, slideTitle }: NadaMasterSlideProps) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Header with slide title */}
      {slideTitle && (
        <header className="absolute top-0 left-0 right-0 px-12 py-5 z-10">
          <span className="text-lg font-semibold text-foreground/80">{slideTitle}</span>
        </header>
      )}

      {/* Main content area - increased bottom padding to prevent footer overlap */}
      <main className="flex-1 flex items-center justify-center px-12 pt-16 pb-28">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 px-12 py-6 flex items-center justify-between text-sm text-foreground/70 font-medium">
        <span>National Anti-Doping Agency (NADA) | Ministry of Youth Affairs & Sports</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
};
