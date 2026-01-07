import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppTheme } from "@/components/theme/AppThemeProvider";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid any theme logic until mounted
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle theme">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return <ThemeToggleInner />;
}

function ThemeToggleInner() {
  const { theme, resolvedTheme, setTheme } = useAppTheme();
  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative overflow-hidden"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun
        className={`h-4 w-4 transition-all duration-300 ${isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"}`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"}`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
