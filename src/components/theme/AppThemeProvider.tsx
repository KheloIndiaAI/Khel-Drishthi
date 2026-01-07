import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type AppTheme = "light" | "dark" | "system";
export type ResolvedAppTheme = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  resolvedTheme: ResolvedAppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedAppTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeClass(resolvedTheme: ResolvedAppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedAppTheme>("light");

  // Hydrate theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("theme") as AppTheme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  // Resolve + apply theme
  useEffect(() => {
    const system = getSystemTheme();
    const nextResolved: ResolvedAppTheme = theme === "system" ? system : theme;

    setResolvedTheme(nextResolved);
    applyThemeClass(nextResolved);

    if (theme !== "system" || typeof window === "undefined") return;

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const sys = mql.matches ? "dark" : "light";
      setResolvedTheme(sys);
      applyThemeClass(sys);
    };

    // Safari < 14
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [theme]);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return ctx;
}
