import { ReactNode } from "react";

interface MasterSlideProps {
  children: ReactNode;
}

export const MasterSlide = ({ children }: MasterSlideProps) => {
  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3 md:px-10 md:py-4">
        {/* Left: Emblem of India */}
        <div className="flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
            alt="Emblem of India"
            className="h-12 w-auto md:h-16"
          />
          <div className="hidden md:block">
            <p className="text-xs font-medium text-foreground/70">
              Government of India
            </p>
            <p className="text-sm font-semibold text-foreground">
              Ministry of Youth Affairs & Sports
            </p>
          </div>
        </div>

        {/* Right: Excellence Decade Badge */}
        <div className="chintan-badge-saffron">
          <span className="text-xs md:text-sm font-bold tracking-wide">
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
