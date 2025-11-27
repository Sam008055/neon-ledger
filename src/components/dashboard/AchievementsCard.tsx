import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function AchievementsCard() {
  const achievements = useQuery(api.budget.getAchievements);
  const progress = useQuery(api.budget.getUserProgress);
  const initializeProgress = useMutation(api.budget.initializeUserProgress);

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "first_transaction":
        return <Star className="h-5 w-5 text-primary" />;
      case "goal_completed":
        return <Trophy className="h-5 w-5 text-accent" />;
      case "savings_streak":
        return <Zap className="h-5 w-5 text-secondary" />;
      default:
        return <Award className="h-5 w-5 text-primary" />;
    }
  };

  useEffect(() => {
    if (progress === null) {
      initializeProgress({});
    }
  }, [progress, initializeProgress]);

  const calculateLevel = (points: number) => {
    return Math.floor(points / 500) + 1;
  };

  const getPointsToNextLevel = (points: number) => {
    const currentLevel = calculateLevel(points);
    const nextLevelPoints = currentLevel * 500;
    return nextLevelPoints - points;
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <CardTitle>Achievements & Progress</CardTitle>
        </div>
        <CardDescription>Track your financial milestones</CardDescription>
      </CardHeader>
      <CardContent>
        {progress && (
          <div className="mb-6 p-4 border border-primary/30 rounded-md bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-lg">Level {calculateLevel(progress.totalPoints)}</h4>
                <p className="text-xs text-muted-foreground">
                  {progress.totalPoints} points • {getPointsToNextLevel(progress.totalPoints)} to next level
                </p>
              </div>
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="text-center p-2 bg-card rounded">
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="font-bold text-lg">{progress.transactionCount}</p>
              </div>
              <div className="text-center p-2 bg-card rounded">
                <p className="text-xs text-muted-foreground">Savings Streak</p>
                <p className="font-bold text-lg">{progress.savingsStreak} months</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm mb-3">Recent Achievements</h4>
          {achievements && achievements.length > 0 ? (
            achievements.slice(0, 5).map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 border border-border rounded-md bg-card/50"
              >
                <div className="mt-0.5">{getAchievementIcon(achievement.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-semibold text-sm">{achievement.title}</h5>
                    <Badge variant="secondary" className="text-xs">+{achievement.points} pts</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-6">
              <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Start tracking transactions to unlock achievements!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
