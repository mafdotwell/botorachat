import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Home, Bot, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
      requiresAuth: false,
    },
    {
      id: "bots",
      label: "Bots",
      icon: Bot,
      path: "/bot-directory",
      requiresAuth: false,
    },
    {
      id: "create",
      label: "Create",
      icon: Plus,
      path: user ? "/creator" : "/auth",
      requiresAuth: false,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      path: user ? "/profile" : "/auth",
      requiresAuth: false,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
                "hover:bg-accent/50 active:bg-accent/70 active:scale-95",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 mb-1 transition-transform duration-200",
                  active && "scale-110"
                )} 
              />
              <span 
                className={cn(
                  "text-xs font-medium leading-none transition-colors duration-200",
                  active && "font-semibold"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;