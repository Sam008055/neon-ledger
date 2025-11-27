import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Smile, Meh, Frown, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const moods = [
  { value: "happy", emoji: "😊", label: "Happy", color: "#00ff00" },
  { value: "excited", emoji: "🤩", label: "Excited", color: "#ffff00" },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "#00ffff" },
  { value: "stressed", emoji: "😰", label: "Stressed", color: "#ff00ff" },
  { value: "sad", emoji: "😢", label: "Sad", color: "#ff0080" },
];

export function MoodTrackerCard() {
  const analytics = useQuery(api.moodTracking.getMoodAnalytics, { days: 30 });
  const logMood = useMutation(api.moodTracking.logMood);

  const handleLogMood = async (mood: string) => {
    try {
      await logMood({ mood });
      toast.success(`Mood logged: ${moods.find(m => m.value === mood)?.emoji}`);
    } catch (error) {
      toast.error("Failed to log mood");
    }
  };

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5 text-primary" />
          Mood & Spending Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
          <div className="flex gap-2 flex-wrap">
            {moods.map((mood, index) => (
              <motion.div
                key={mood.value}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLogMood(mood.value)}
                  className="flex flex-col h-auto py-2 px-3"
                  style={{ borderColor: mood.color }}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {analytics && analytics.correlations.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Spending Patterns
            </h4>
            <div className="space-y-2">
              {analytics.correlations
                .sort((a, b) => b.averageSpending - a.averageSpending)
                .slice(0, 3)
                .map((correlation) => {
                  const moodData = moods.find(m => m.value === correlation.mood);
                  return (
                    <div
                      key={correlation.mood}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{moodData?.emoji}</span>
                        <span className="text-sm capitalize">{correlation.mood}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{Math.round(correlation.averageSpending)}</div>
                        <div className="text-xs text-muted-foreground">avg/day</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
