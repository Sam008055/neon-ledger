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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, BookOpen, Trophy, Clock, CheckCircle, Star, Brain } from "lucide-react";
import { toast } from "sonner";

export default function LearnPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const lessons = useQuery(api.lessons.getLessons, {});
  const userLessons = useQuery(api.lessons.getUserLessons);
  const updateProgress = useMutation(api.lessons.updateLessonProgress);
  const seedLessons = useMutation(api.lessons.seedLessons);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSeedLessons = async () => {
    setIsSeeding(true);
    try {
      await seedLessons({});
      toast.success("Lessons loaded successfully!");
    } catch (error) {
      toast.error("Failed to load lessons");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleStartLesson = (lesson: any) => {
    setSelectedLesson(lesson);
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;
    
    try {
      await updateProgress({
        lessonId: selectedLesson._id,
        progress: 100,
      });
      toast.success(`🎓 Lesson completed! +${selectedLesson.points} points`);
      setSelectedLesson(null);
    } catch (error) {
      toast.error("Failed to complete lesson");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getUserLessonProgress = (lessonId: string) => {
    return userLessons?.find(ul => ul.lessonId === lessonId);
  };

  const categories = ["budgeting", "saving", "investing", "debt", "taxes"];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-accent/20 text-accent";
      case "intermediate": return "bg-secondary/20 text-secondary";
      case "advanced": return "bg-primary/20 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
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
        <div className="relative overflow-hidden rounded-3xl border-2 border-accent/30 bg-gradient-to-br from-accent/20 via-primary/10 to-secondary/20 p-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent via-primary to-secondary mb-2">
                Financial Education
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                Learn about finance and earn points while you grow!
              </p>
            </div>
            <div className="text-center p-4 border-2 border-accent/30 rounded-xl bg-accent/10">
              <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent">{userLessons?.filter(ul => ul.status === "completed").length || 0}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>

        {/* Lessons by Category */}
        {(!lessons || lessons.length === 0) ? (
          <Card className="border-2 border-dashed border-accent/30">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No lessons available. Load the course library!</p>
              <Button onClick={handleSeedLessons} disabled={isSeeding}>
                {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
                Load Lessons
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons?.map((lesson, index) => {
                  const userProgress = getUserLessonProgress(lesson._id);
                  return (
                    <motion.div
                      key={lesson._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                    >
                      <Card className="border-2 border-accent/30 bg-gradient-to-br from-card/80 to-card/40 h-full">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getDifficultyColor(lesson.difficulty)}>
                              {lesson.difficulty}
                            </Badge>
                            {userProgress?.status === "completed" && (
                              <CheckCircle className="h-5 w-5 text-accent" />
                            )}
                          </div>
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          <CardDescription>{lesson.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {lesson.estimatedMinutes} min
                              </span>
                              <span className="flex items-center gap-1 font-bold text-accent">
                                <Trophy className="h-4 w-4" />
                                {lesson.points} pts
                              </span>
                            </div>
                            {userProgress && userProgress.progress > 0 && (
                              <div className="space-y-2">
                                <Progress value={userProgress.progress} className="h-2" />
                                <p className="text-xs text-muted-foreground text-center">
                                  {userProgress.progress}% complete
                                </p>
                              </div>
                            )}
                            <Button
                              onClick={() => handleStartLesson(lesson)}
                              className="w-full bg-gradient-to-r from-accent to-primary"
                              variant={userProgress?.status === "completed" ? "outline" : "default"}
                            >
                              {userProgress?.status === "completed" ? "Review" : "Start Lesson"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {lessons?.filter(l => l.category === category).map((lesson, index) => {
                    const userProgress = getUserLessonProgress(lesson._id);
                    return (
                      <motion.div
                        key={lesson._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                      >
                        <Card className="border-2 border-accent/30 h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={getDifficultyColor(lesson.difficulty)}>
                                {lesson.difficulty}
                              </Badge>
                              {userProgress?.status === "completed" && (
                                <CheckCircle className="h-5 w-5 text-accent" />
                              )}
                            </div>
                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                            <CardDescription>{lesson.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button
                              onClick={() => handleStartLesson(lesson)}
                              className="w-full"
                            >
                              {userProgress?.status === "completed" ? "Review" : "Start Lesson"}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </motion.div>

      {/* Lesson Dialog */}
      <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedLesson?.title}</DialogTitle>
            <DialogDescription>{selectedLesson?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{selectedLesson?.content}</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {selectedLesson?.estimatedMinutes} minutes
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-accent" />
                  {selectedLesson?.points} points
                </span>
              </div>
              <Button
                onClick={handleCompleteLesson}
                className="bg-gradient-to-r from-accent to-primary"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
