import { ReactNode } from "react";

interface MasterSlideProps {
  children: ReactNode;
  /** Hide navigation elements when capturing for PDF export */
  forCapture?: boolean;
}

export const MasterSlide = ({ children, forCapture = false }: MasterSlideProps) => {
  return (
    <div className={`relative h-full w-full flex flex-col ${forCapture ? 'chintan-mesh-bg' : ''}`}>
      {/* Header Bar - Fixed, No Animation */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-12 md:py-5">
        {/* Left: Emblem of India */}
        <div className="flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Emblem of India"
            className="h-14 w-auto md:h-20"
            crossOrigin="anonymous"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground/70">
              Government of India
            </p>
            <p className="text-base font-semibold text-foreground">
              Ministry of Youth Affairs & Sports
            </p>
          </div>
        </div>

        {/* Right: Excellence Decade Badge - Larger */}
        <div className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-[#FF9933] text-white shadow-lg">
          <span className="text-sm md:text-base font-bold tracking-wide">
            2026–2036 Excellence Decade
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 md:px-12 pb-20">
        {children}
      </main>
    </div>
  );
};
