import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Outlet } from "react-router";
import { useEffect } from "react";
import { Loader2, Trophy, Star, Moon, Sun } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Navigation } from "@/components/Navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const progress = useQuery(api.budget.getUserProgress);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LogoDropdown />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-primary">NEON LEDGER</h1>
                <p className="text-xs text-muted-foreground">Financial Management System</p>
              </div>
            </div>

            {/* Points System Display */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Welcome back,</p>
                <p className="font-semibold text-secondary">{user.name || user.email || "Guest"}</p>
              </div>

              {progress && (
                <div className="flex items-center gap-4 px-4 py-2 border border-primary/30 rounded-md bg-card/80">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">Level {calculateLevel(progress.totalPoints)}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{progress.totalPoints} pts</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={getLevelProgress(progress.totalPoints)} className="h-1.5 w-24" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {getPointsToNextLevel(progress.totalPoints)} to next
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-border" />

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-accent" />
                        <span className="text-sm font-bold text-accent">{progress.transactionCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Transactions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-secondary" />
                        <span className="text-sm font-bold text-secondary">{progress.savingsStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10"
                title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
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