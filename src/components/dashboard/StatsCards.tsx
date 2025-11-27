import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface StatsCardsProps {
  dashboardData: {
    totalBalance: number;
    income: number;
    expense: number;
    net: number;
  } | undefined;
}

export function StatsCards({ dashboardData }: StatsCardsProps) {
  if (!dashboardData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">${dashboardData.totalBalance.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Monthly Income</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <span className="text-2xl font-bold text-accent">${dashboardData.income.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Monthly Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <span className="text-2xl font-bold text-destructive">${dashboardData.expense.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-accent/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Net Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-secondary" />
            <span className={`text-2xl font-bold ${dashboardData.net >= 0 ? 'text-accent' : 'text-destructive'}`}>
              ${dashboardData.net.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
