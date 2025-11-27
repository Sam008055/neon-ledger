import { Button } from "@/components/ui/button";
import { Home, Target, Award, TrendingUp, Wallet, Bot } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "framer-motion";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Overview" },
    { path: "/dashboard/accounts", icon: Wallet, label: "Accounts" },
    { path: "/dashboard/analytics", icon: TrendingUp, label: "Analytics" },
    { path: "/dashboard/goals", icon: Target, label: "Goals" },
    { path: "/dashboard/achievements", icon: Award, label: "Achievements" },
    { path: "/dashboard/ai-assistant", icon: Bot, label: "AI Assistant" },
  ];

  return (
    <nav className="border-b border-primary/30 bg-card/80 backdrop-blur-md sticky top-[57px] md:top-[73px] z-40 shadow-md">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`relative whitespace-nowrap text-xs md:text-sm px-2 md:px-4 ${
                    isActive ? "shadow-lg shadow-primary/20" : ""
                  }`}
                >
                  <item.icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-t-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
