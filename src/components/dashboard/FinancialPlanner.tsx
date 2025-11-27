import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FinancialPlannerProps {
  dashboardData: {
    totalBalance: number;
    income: number;
    expense: number;
    net: number;
  } | undefined;
}

export function FinancialPlanner({ dashboardData }: FinancialPlannerProps) {
  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [plan, setPlan] = useState<{
    monthsNeeded: number;
    monthlySavings: number;
    feasible: boolean;
    recommendation: string;
  } | null>(null);

  const calculatePlan = () => {
    if (!goalName || !goalAmount || !dashboardData) {
      toast.error("Please fill in all fields");
      return;
    }

    const targetAmount = parseFloat(goalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const monthlySavings = dashboardData.net;
    
    if (monthlySavings <= 0) {
      setPlan({
        monthsNeeded: 0,
        monthlySavings: 0,
        feasible: false,
        recommendation: "You're currently spending more than you earn. To achieve your goal, you need to reduce expenses first. Review your spending and cut unnecessary costs."
      });
      return;
    }

    const monthsNeeded = Math.ceil(targetAmount / monthlySavings);
    const feasible = monthsNeeded <= 60; // 5 years

    let recommendation = "";
    if (feasible) {
      recommendation = `Based on your current net income of ₹${monthlySavings.toFixed(2)}/month, you can reach your goal in ${monthsNeeded} months (${(monthsNeeded / 12).toFixed(1)} years). Stay consistent with your savings!`;
    } else {
      const requiredMonthlySavings = targetAmount / 60;
      const additionalSavings = requiredMonthlySavings - monthlySavings;
      recommendation = `To reach your goal in 5 years, you need to save ₹${requiredMonthlySavings.toFixed(2)}/month. This requires an additional ₹${additionalSavings.toFixed(2)}/month. Consider increasing income or reducing expenses.`;
    }

    setPlan({
      monthsNeeded,
      monthlySavings,
      feasible,
      recommendation
    });

    toast.success("Financial plan generated!");
  };

  return (
    <Card className="border-secondary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-secondary" />
          <CardTitle>Financial Goal Planner</CardTitle>
        </div>
        <CardDescription>
          Plan for your financial goals based on your current income and expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goalName">What are you saving for?</Label>
          <Input
            id="goalName"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            placeholder="e.g., New Car, Vacation, Emergency Fund"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goalAmount">Target Amount (₹)</Label>
          <Input
            id="goalAmount"
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="e.g., 10000"
          />
        </div>

        <Button onClick={calculatePlan} className="w-full">
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Plan
        </Button>

        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="p-4 border border-border rounded-md bg-card/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Your Plan for: {goalName}
              </h4>
              
              {plan.feasible && plan.monthsNeeded > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Timeline</p>
                      <p className="font-bold">{plan.monthsNeeded} months</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Savings</p>
                      <p className="font-bold">₹{plan.monthlySavings.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`p-3 rounded-md ${plan.feasible ? 'bg-accent/10 border border-accent/30' : 'bg-destructive/10 border border-destructive/30'}`}>
                <p className="text-sm">{plan.recommendation}</p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
