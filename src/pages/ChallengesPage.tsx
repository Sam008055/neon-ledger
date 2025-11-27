import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Zap, Target, Clock, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ChallengesPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const challenges = useQuery(api.challenges.getChallenges);
  const generateChallenges = useMutation(api.challenges.generateChallenges);
  const completeChallenge = useMutation(api.challenges.completeChallenge);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleGenerateChallenges = async () => {
    setIsGenerating(true);
    try {
      const result = await generateChallenges({});
      toast.success(result.message);
    } catch (error) {
      toast.error("Failed to generate challenges");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const result = await completeChallenge({ challengeId: challengeId as any });
      toast.success(`🎉 Challenge completed! +${result.points} points`, {
        description: "Keep up the great work!"
      });
    } catch (error) {
      toast.error("Failed to complete challenge");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeChallenges = challenges?.filter(c => c.status === "active") || [];
  const completedChallenges = challenges?.filter(c => c.status === "completed") || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-accent";
      case "medium": return "text-secondary";
      case "hard": return "text-primary";
      default: return "text-foreground";
    }
  };

  const getTimeRemaining = (expiresAt: number) => {
    const now = Date.now();
    const diff = expiresAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h remaining` : "Expiring soon";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-2">
                Daily Challenges
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Complete challenges to earn points and level up!
              </p>
            </div>
            <Button
              onClick={handleGenerateChallenges}
              disabled={isGenerating || activeChallenges.length >= 3}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              size="lg"
            >
              {isGenerating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
              ) : (
                <><Zap className="mr-2 h-5 w-5" /> New Challenges</>
              )}
            </Button>
          </div>
        </div>

        {/* Active Challenges */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Active Challenges
          </h2>
          {activeChallenges.length === 0 ? (
            <Card className="border-2 border-dashed border-primary/30">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No active challenges. Generate new ones to get started!</p>
                <Button onClick={handleGenerateChallenges} disabled={isGenerating}>
                  <Zap className="mr-2 h-4 w-4" /> Generate Challenges
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className="border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {getTimeRemaining(challenge.expiresAt)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Reward</span>
                          <div className="flex items-center gap-1 font-bold text-accent">
                            <Trophy className="h-4 w-4" />
                            {challenge.points} pts
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCompleteChallenge(challenge._id)}
                          className="w-full bg-gradient-to-r from-primary to-accent"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete Challenge
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-accent" />
              Completed Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedChallenges.slice(0, 6).map((challenge, index) => (
                <motion.div
                  key={challenge._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border border-accent/30 bg-accent/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-8 w-8 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{challenge.title}</h4>
                          <p className="text-xs text-muted-foreground">+{challenge.points} points earned</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </div>
  );
}
