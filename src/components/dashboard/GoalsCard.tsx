import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: "",
  });

  const handleCreateGoal = async () => {
    try {
      if (!goalForm.name || goalForm.targetAmount <= 0) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      await createGoal({
        name: goalForm.name,
        targetAmount: goalForm.targetAmount,
        deadline: new Date(goalForm.deadline).getTime(),
        category: goalForm.category || undefined,
      });
      
      toast.success("Goal created successfully!");
      setDialogOpen(false);
      setGoalForm({
        name: "",
        targetAmount: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: "",
      });
    } catch (error) {
      toast.error("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (id: Id<"goals">) => {
    try {
      await deleteGoal({ id });
      toast.success("Goal deleted");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>Track your savings goals and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const daysLeft = Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24));
                
                return (
                  <motion.div
                    key={goal._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-border rounded-md bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{goal.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          ₹{goal.currentAmount.toFixed(2)} / ₹{goal.targetAmount.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <Progress value={progress} className="h-2 mb-2" />
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${progress >= 100 ? 'text-accent' : 'text-muted-foreground'}`}>
                        {progress.toFixed(0)}% Complete
                      </span>
                      <span className="text-muted-foreground">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">No goals yet. Start by creating your first financial goal!</p>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Goal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Financial Goal</DialogTitle>
            <DialogDescription>Set a target and deadline for your savings goal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                placeholder="e.g., Emergency Fund, Vacation"
              />
            </div>
            <div>
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({ ...goalForm, targetAmount: parseFloat(e.target.value) || 0 })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category">Category (Optional)</Label>
              <Input
                id="category"
                value={goalForm.category}
                onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                placeholder="e.g., Savings, Investment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateGoal}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
