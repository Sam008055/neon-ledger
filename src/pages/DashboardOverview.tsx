import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Target, Award, TrendingUp, Wallet, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BankConnectionCard } from "@/components/dashboard/BankConnectionCard";
import { SavingsJarCard } from "@/components/dashboard/SavingsJarCard";
import { MoodTrackerCard } from "@/components/dashboard/MoodTrackerCard";
import { SubscriptionTrackerCard } from "@/components/dashboard/SubscriptionTrackerCard";
import { SelfCareCard } from "@/components/dashboard/SelfCareCard";

export default function DashboardOverview() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const dashboardData = useQuery(api.budget.getDashboardData);
  const accounts = useQuery(api.budget.getAccounts);
  const goals = useQuery(api.budget.getGoals);
  const achievements = useQuery(api.budget.getAchievements);
  const progress = useQuery(api.budget.getUserProgress);
  const seedMockData = useMutation(api.mockData.seedAllMockData);
  const clearAllData = useMutation(api.mockData.clearAllData);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSeedMockData = async () => {
    try {
      console.log("Starting mock data generation...");
      toast.loading("Creating mock data...", { id: "seed-data" });
      const result = await seedMockData({});
      console.log("Mock data result:", result);
      if (result?.success) {
        toast.success("🎉 Mock data created! Explore all features now!", { id: "seed-data" });
      } else {
        toast.error(result?.message || "Failed to seed data", { id: "seed-data" });
      }
    } catch (error: any) {
      console.error("Mock data error:", error);
      toast.error(error?.message || "Failed to seed data. Check console for details.", { id: "seed-data" });
    }
  };

  const handleClearAllData = async () => {
    try {
      console.log("Starting data clear...");
      toast.loading("Clearing all data...", { id: "clear-data" });
      const result = await clearAllData({});
      console.log("Clear data result:", result);
      if (result?.success) {
        toast.success("🗑️ All data cleared successfully!", { id: "clear-data" });
      } else {
        toast.error(result?.message || "Failed to clear data", { id: "clear-data" });
      }
    } catch (error: any) {
      console.error("Clear data error:", error);
      toast.error(error?.message || "Failed to clear data. Check console for details.", { id: "clear-data" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeGoals = goals?.filter(g => g.status === "active").length || 0;
  const recentAchievements = achievements?.slice(0, 3) || [];

  const calculateLevel = (points: number) => {
    return Math.floor(points / 500) + 1;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Welcome Section with Progress */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg" />
          <Card className="border-primary/30 relative">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                  <p className="text-muted-foreground">Here's your financial overview</p>
                </div>
                {progress && (
                  <div className="flex items-center gap-6">
                    <div className="text-center p-4 border border-primary/30 rounded-md bg-primary/5">
                      <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold text-primary">Level {calculateLevel(progress.totalPoints)}</div>
                      <div className="text-xs text-muted-foreground">{progress.totalPoints} points</div>
                    </div>
                    <div className="h-16 w-px bg-border" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 border border-accent/30 rounded-md bg-accent/5">
                        <Zap className="h-6 w-6 text-accent mx-auto mb-1" />
                        <div className="text-2xl font-bold text-accent">{activeGoals}</div>
                        <div className="text-xs text-muted-foreground">Active Goals</div>
                      </div>
                      <div className="text-center p-3 border border-secondary/30 rounded-md bg-secondary/5">
                        <Award className="h-6 w-6 text-secondary mx-auto mb-1" />
                        <div className="text-2xl font-bold text-secondary">{achievements?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Achievements</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Financial Overview</h2>
          <StatsCards dashboardData={dashboardData} />
        </section>

        {/* Mock Data Controls */}
        {(!accounts || accounts.length === 0) ? (
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle>🎮 Get Started with Mock Data</CardTitle>
              <CardDescription>Generate sample data to explore all features of Neon Ledger!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSeedMockData} className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Generate Complete Mock Data
              </Button>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Includes: Accounts, Transactions, Goals, Savings Jars, Mood Logs, Subscriptions & More!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm">Clear All Data</h4>
                  <p className="text-xs text-muted-foreground">Remove all mock data in one click</p>
                </div>
                <Button 
                  onClick={handleClearAllData} 
                  variant="destructive" 
                  size="sm"
                >
                  🗑️ Clear Everything
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Connection Card */}
        <section>
          <BankConnectionCard />
        </section>

        {/* Quick Access Cards */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="border-primary/30 cursor-pointer hover:border-primary/60 transition-all"
                onClick={() => navigate("/dashboard/accounts")}
              >
                <CardContent className="p-6 text-center">
                  <Wallet className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Accounts</h3>
                  <p className="text-2xl font-bold text-primary">{accounts?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Manage your accounts</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="border-accent/30 cursor-pointer hover:border-accent/60 transition-all"
                onClick={() => navigate("/dashboard/goals")}
              >
                <CardContent className="p-6 text-center">
                  <Target className="h-10 w-10 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Goals</h3>
                  <p className="text-2xl font-bold text-accent">{activeGoals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Track your progress</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="border-secondary/30 cursor-pointer hover:border-secondary/60 transition-all"
                onClick={() => navigate("/dashboard/achievements")}
              >
                <CardContent className="p-6 text-center">
                  <Award className="h-10 w-10 text-secondary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Achievements</h3>
                  <p className="text-2xl font-bold text-secondary">{achievements?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">View your rewards</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                className="border-accent/30 cursor-pointer hover:border-accent/60 transition-all"
                onClick={() => navigate("/dashboard/analytics")}
              >
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-accent mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Analytics</h3>
                  <p className="text-2xl font-bold text-accent">View</p>
                  <p className="text-xs text-muted-foreground mt-1">Detailed insights</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Financial Wellness Section */}
        <section id="financial-wellness">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Financial Wellness</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id="mood-tracker">
              <MoodTrackerCard />
            </div>
            <div id="self-care">
              <SelfCareCard />
            </div>
          </div>
        </section>

        {/* Savings & Subscriptions */}
        <section id="savings-subscriptions">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Savings & Subscriptions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div id="savings-jars">
              <SavingsJarCard />
            </div>
            <div id="subscriptions">
              <SubscriptionTrackerCard />
            </div>
          </div>
        </section>

        {/* Recent Achievements Preview */}
        {recentAchievements.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Achievements</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/achievements")}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                          <h4 className="font-semibold text-sm">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Insights and Chart */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Insights & Analytics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightsCard dashboardData={dashboardData} />
            {dashboardData && dashboardData.categoryBreakdown.length > 0 && (
              <SpendingChart categoryBreakdown={dashboardData.categoryBreakdown} />
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}