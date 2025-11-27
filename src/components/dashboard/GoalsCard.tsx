import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Target, Plus, Trash2, TrendingUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export function GoalsCard() {
  const goals = useQuery(api.budget.getGoals);
  const createGoal = useMutation(api.budget.createGoal);
  const updateGoalProgress = useMutation(api.budget.updateGoalProgress);
  const deleteGoal = useMutation(api.budget.deleteGoal);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: 0,
    deadline: new Date().toISOString().split('T')[0]
  });

  const [isCreating, setIsCreating] = useState(false);
  const [updatingGoalId, setUpdatingGoalId] = useState<Id<"goals"> | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<Id<"goals"> | null>(null);

  const handleCreateGoal = async () => {
    try {
      setIsCreating(true);
      await createGoal({
        name: goalForm.name,
        targetAmount: goalForm.targetAmount,
        deadline: new Date(goalForm.deadline).getTime()
      });
      toast.success("🎯 Goal created!");
      setDialogOpen(false);
      setGoalForm({ name: "", targetAmount: 0, deadline: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast.error("Failed to create goal");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateProgress = async (goalId: Id<"goals">, amount: number) => {
    try {
      setUpdatingGoalId(goalId);
      await updateGoalProgress({ goalId, amount });
      toast.success("Progress updated!");
    } catch (error) {
      toast.error("Failed to update progress");
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleDeleteGoal = async (goalId: Id<"goals">) => {
    try {
      setDeletingGoalId(goalId);
      await deleteGoal({ id: goalId });
      toast.success("Goal deleted!");
    } catch (error) {
      toast.error("Failed to delete goal");
    } finally {
      setDeletingGoalId(null);
    }
  };

  const activeGoals = goals?.filter(g => g.status === "active") || [];

  return (
    <>
      <Card className="border-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <CardTitle>Financial Goals</CardTitle>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Goal
            </Button>
          </div>
          <CardDescription>Track your savings targets</CardDescription>
        </CardHeader>
        <CardContent>
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {activeGoals.map((goal, index) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const isUpdating = updatingGoalId === goal._id;
                  const isDeleting = deletingGoalId === goal._id;
                  
                  return (
                    <motion.div
                      key={goal._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-border rounded-lg bg-card/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                          </p>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDeleteGoal(goal._id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                      <Progress value={progress} className="mb-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(1)}% complete</span>
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleUpdateProgress(goal._id, 100)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          )}
                          Add ₹100
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleUpdateProgress(goal._id, 500)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          )}
                          Add ₹500
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No active goals. Create one to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Financial Goal</DialogTitle>
            <DialogDescription>Set a new savings target to work towards</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Goal Name</label>
              <Input
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="Emergency Fund"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Amount (₹)</label>
              <Input
                type="number"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({ ...goalForm, targetAmount: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}