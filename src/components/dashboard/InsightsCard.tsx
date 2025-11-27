import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";
import { motion } from "framer-motion";

interface InsightsCardProps {
  dashboardData: {
    totalBalance: number;
    income: number;
    expense: number;
    net: number;
    categoryBreakdown: Array<{ name: string; amount: number; color: string }>;
  } | undefined;
}

export function InsightsCard({ dashboardData }: InsightsCardProps) {
  if (!dashboardData) return null;

  const generateInsights = () => {
    const insights = [];
    
    // Savings rate insight
    if (dashboardData.income > 0) {
      const savingsRate = ((dashboardData.net / dashboardData.income) * 100).toFixed(1);
      insights.push({
        icon: TrendingUp,
        color: "text-accent",
        title: "Savings Rate",
        message: `You're saving ${savingsRate}% of your income this month.`,
        recommendation: parseFloat(savingsRate) < 20 ? "Try to increase your savings rate to at least 20%." : "Great job! Keep it up!"
      });
    }

    // Spending alert
    if (dashboardData.net < 0) {
      insights.push({
        icon: AlertTriangle,
        color: "text-destructive",
        title: "Spending Alert",
        message: `You're spending $${Math.abs(dashboardData.net).toFixed(2)} more than you earn.`,
        recommendation: "Review your expenses and identify areas to cut back."
      });
    }

    // Top spending category
    if (dashboardData.categoryBreakdown.length > 0) {
      const topCategory = dashboardData.categoryBreakdown.reduce((max, cat) => 
        cat.amount > max.amount ? cat : max
      );
      insights.push({
        icon: Target,
        color: "text-secondary",
        title: "Top Spending",
        message: `${topCategory.name} is your largest expense at $${topCategory.amount.toFixed(2)}.`,
        recommendation: "Consider setting a budget limit for this category."
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>Financial Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-border rounded-md bg-card/50"
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.message}</p>
                  <p className="text-sm text-primary">{insight.recommendation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
