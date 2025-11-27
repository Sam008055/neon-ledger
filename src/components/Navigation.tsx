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
    <nav className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-[73px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="relative whitespace-nowrap"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
