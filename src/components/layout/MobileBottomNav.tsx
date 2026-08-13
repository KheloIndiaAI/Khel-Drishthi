import { Link, useLocation } from "react-router-dom";
import { Home, Building2, Trophy, BarChart3, Globe, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/infrastructure", label: "Infra", icon: <Building2 className="h-5 w-5" /> },
  { path: "/medals", label: "Medals", icon: <Trophy className="h-5 w-5" /> },
  { path: "/benchmark", label: "Benchmark", icon: <Globe className="h-5 w-5" /> },
  { path: "/capacity", label: "Capacity", icon: <BarChart3 className="h-5 w-5" /> },
  { path: "/auth", label: "Account", icon: <User className="h-5 w-5" /> },
];

const MobileBottomNav = () => {
  const location = useLocation();

  // Don't show on form pages or admin pages
  if (
    location.pathname.includes("/form") ||
    location.pathname.includes("/admin") ||
    location.pathname.includes("/auth") ||
    location.pathname.includes("/setup")
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] h-full px-3 py-2 rounded-lg transition-colors relative touch-target",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10 text-[10px] mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
