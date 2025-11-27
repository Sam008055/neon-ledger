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
    
    if (dashboardData.income > 0) {
      const savingsRate = ((dashboardData.net / dashboardData.income) * 100).toFixed(1);
      insights.push({
        icon: TrendingUp,
        color: "text-accent",
        bgColor: "from-accent/20 to-accent/5",
        title: "Savings Rate",
        message: `You're saving ${savingsRate}% of your income this month.`,
        recommendation: parseFloat(savingsRate) < 20 ? "Try to increase your savings rate to at least 20%." : "Great job! Keep it up!"
      });
    }

    if (dashboardData.net < 0) {
      insights.push({
        icon: AlertTriangle,
        color: "text-destructive",
        bgColor: "from-destructive/20 to-destructive/5",
        title: "Spending Alert",
        message: `You're spending ₹${Math.abs(dashboardData.net).toFixed(2)} more than you earn.`,
        recommendation: "Review your expenses and identify areas to cut back."
      });
    }

    if (dashboardData.categoryBreakdown.length > 0) {
      const topCategory = dashboardData.categoryBreakdown.reduce((max, cat) => 
        cat.amount > max.amount ? cat : max
      );
      insights.push({
        icon: Target,
        color: "text-secondary",
        bgColor: "from-secondary/20 to-secondary/5",
        title: "Top Spending",
        message: `${topCategory.name} is your largest expense at ₹${topCategory.amount.toFixed(2)}.`,
        recommendation: "Consider setting a budget limit for this category."
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10 overflow-hidden">
      <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
          >
            <Lightbulb className="h-5 w-5 text-white" />
          </motion.div>
          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Financial Insights
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`relative overflow-hidden p-5 border-2 border-border rounded-2xl bg-gradient-to-br ${insight.bgColor} backdrop-blur-sm`}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className={`p-2 rounded-xl bg-card/50 ${insight.color}`}
                >
                  <insight.icon className="h-5 w-5" />
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-bold mb-2 text-foreground">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{insight.message}</p>
                  <p className={`text-sm font-medium ${insight.color}`}>{insight.recommendation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}