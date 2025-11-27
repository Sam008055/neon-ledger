import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [completingId, setCompletingId] = useState<string | null>(null);

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
    setCompletingId(challengeId);
    try {
      const result = await completeChallenge({ challengeId: challengeId as any });
      toast.success(`🎉 Challenge completed! +${result.points} points`, {
        description: "Keep up the great work!"
      });
    } catch (error) {
      toast.error("Failed to complete challenge");
    } finally {
      setCompletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
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
        {/* Header with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-8 backdrop-blur-sm"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />
          
          <div className="relative flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-2"
              >
                Daily Challenges
              </motion.h1>
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                </motion.div>
                Complete challenges to earn points and level up!
              </motion.p>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Button
                onClick={handleGenerateChallenges}
                disabled={isGenerating || activeChallenges.length >= 3}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="mr-2 h-5 w-5" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" /> New Challenges
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Active Challenges with staggered animations */}
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold mb-4 flex items-center gap-2"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="h-6 w-6 text-primary" />
            </motion.div>
            Active Challenges
          </motion.h2>
          
          <AnimatePresence mode="wait">
            {activeChallenges.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 border-dashed border-primary/30">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="text-muted-foreground mb-4">No active challenges. Generate new ones to get started!</p>
                    <Button onClick={handleGenerateChallenges} disabled={isGenerating}>
                      <Zap className="mr-2 h-4 w-4" /> Generate Challenges
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="challenges"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {activeChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    transition={{ 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card/80 to-card/40 h-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between mb-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                          >
                            <Badge className={`${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </Badge>
                          </motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {getTimeRemaining(challenge.expiresAt)}
                            </Badge>
                          </motion.div>
                        </div>
                        <CardTitle className="text-xl">{challenge.title}</CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <div className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-muted-foreground">Reward</span>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center gap-1 font-bold text-accent"
                            >
                              <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              >
                                <Trophy className="h-4 w-4" />
                              </motion.div>
                              {challenge.points} pts
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.4 }}
                          >
                            <Button
                              onClick={() => handleCompleteChallenge(challenge._id)}
                              disabled={completingId === challenge._id}
                              className="w-full bg-gradient-to-r from-primary to-accent relative overflow-hidden group"
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-accent to-primary"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.5 }}
                              />
                              <span className="relative flex items-center justify-center">
                                {completingId === challenge._id ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="mr-2 h-4 w-4" />
                                  </motion.div>
                                ) : (
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                )}
                                Complete Challenge
                              </span>
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Completed Challenges with fade-in animations */}
        <AnimatePresence>
          {completedChallenges.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.6 }}
            >
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-2xl font-bold mb-4 flex items-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="h-6 w-6 text-accent" />
                </motion.div>
                Completed Challenges
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedChallenges.slice(0, 6).map((challenge, index) => (
                  <motion.div
                    key={challenge._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card className="border border-accent/30 bg-accent/5 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                      
                      <CardContent className="p-4 relative">
                        <div className="flex items-center gap-3">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
                          >
                            <CheckCircle className="h-8 w-8 text-accent flex-shrink-0" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{challenge.title}</h4>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.05 + 0.3 }}
                              className="text-xs text-muted-foreground"
                            >
                              +{challenge.points} points earned
                            </motion.p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}