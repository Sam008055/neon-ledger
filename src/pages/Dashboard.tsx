import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import { Loader2, Trophy, Star, Moon, Sun, LogOut } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface FloatingRupee {
  id: number;
  x: number;
  y: number;
}

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const progress = useQuery(api.budget.getUserProgress);
  const { theme, toggleTheme } = useTheme();
  const [floatingRupees, setFloatingRupees] = useState<FloatingRupee[]>([]);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("👋 Logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const createFloatingRupee = (e: React.MouseEvent) => {
    const newRupee: FloatingRupee = {
      id: Date.now() + Math.random(),
      x: e.clientX,
      y: e.clientY,
    };
    setFloatingRupees(prev => [...prev, newRupee]);
    setClickCount(prev => prev + 1);
    
    // Remove rupee after animation
    setTimeout(() => {
      setFloatingRupees(prev => prev.filter(r => r.id !== newRupee.id));
    }, 2000);

    // Show achievement toast every 10 clicks
    if ((clickCount + 1) % 10 === 0) {
      toast.success(`🎉 ${clickCount + 1} clicks! You're on fire!`, {
        description: "Keep exploring your finances!"
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const calculateLevel = (points: number) => {
    return Math.floor(points / 500) + 1;
  };

  const getPointsToNextLevel = (points: number) => {
    const currentLevel = calculateLevel(points);
    const nextLevelPoints = currentLevel * 500;
    return nextLevelPoints - points;
  };

  const getLevelProgress = (points: number) => {
    const currentLevel = calculateLevel(points);
    const currentLevelMinPoints = (currentLevel - 1) * 500;
    const nextLevelPoints = currentLevel * 500;
    const progressInLevel = points - currentLevelMinPoints;
    const totalPointsNeeded = nextLevelPoints - currentLevelMinPoints;
    return (progressInLevel / totalPointsNeeded) * 100;
  };

  return (
    <div className="min-h-screen bg-background" onClick={createFloatingRupee}>
      {/* Floating Rupees Animation */}
      <AnimatePresence>
        {floatingRupees.map((rupee) => (
          <motion.div
            key={rupee.id}
            initial={{ opacity: 1, y: 0, x: rupee.x, scale: 1 }}
            animate={{ 
              opacity: 0, 
              y: rupee.y - 150, 
              x: rupee.x + (Math.random() - 0.5) * 100,
              scale: 1.5,
              rotate: Math.random() * 360
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed pointer-events-none z-[100] text-4xl font-bold"
            style={{ 
              left: 0, 
              top: 0,
              textShadow: "0 0 10px rgba(0, 255, 255, 0.8)"
            }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-primary to-secondary">
              ₹
            </span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header - Mobile Optimized */}
      <header className="border-b border-primary/30 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Title - Compact for Mobile */}
            <div className="flex items-center gap-2 min-w-0">
              <LogoDropdown />
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold tracking-tight text-primary truncate">NEON LEDGER</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Financial Management</p>
              </div>
            </div>

            {/* User Info & Actions - Mobile Optimized */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User Welcome - Hidden on small screens */}
              <div className="text-right hidden md:block">
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <p className="font-semibold text-secondary text-sm">{user.name || user.email || "Guest"}</p>
              </div>

              {/* Progress Display - Compact for Mobile */}
              {progress && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 border-2 border-primary/40 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm shadow-lg"
                >
                  <div className="flex items-center gap-1 md:gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs md:text-sm font-bold text-primary">Lv {calculateLevel(progress.totalPoints)}</span>
                        <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">• {progress.totalPoints}pts</span>
                      </div>
                      <Progress value={getLevelProgress(progress.totalPoints)} className="h-1 w-16 md:w-24 mt-1" />
                    </div>
                  </div>

                  {/* Stats - Hidden on very small screens */}
                  <div className="hidden sm:flex items-center gap-2 border-l border-border pl-2">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-accent" />
                        <span className="text-xs font-bold text-accent">{progress.transactionCount}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-secondary" />
                        <span className="text-xs font-bold text-secondary">{progress.savingsStreak}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Theme Toggle - Compact */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className="h-8 w-8 md:h-10 md:w-10"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: theme === "light" ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === "light" ? (
                    <Moon className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <Sun className="h-4 w-4 md:h-5 md:w-5" />
                  )}
                </motion.div>
              </Button>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="h-8 w-8 md:h-10 md:w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Logout"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Page Content */}
      <Outlet />
    </div>
  );
}