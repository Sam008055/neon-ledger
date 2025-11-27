import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CashFlowForecastProps {
  forecastData: {
    forecast: Array<{
      month: string;
      projectedBalance: number;
      projectedIncome: number;
      projectedExpense: number;
      isActual: boolean;
    }>;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    avgMonthlySavings: number;
  } | undefined;
  onMonthsChange: (months: number) => void;
}

export function CashFlowForecast({ forecastData, onMonthsChange }: CashFlowForecastProps) {
  const [months, setMonths] = useState(6);

  const handleMonthsChange = (value: string) => {
    const num = parseInt(value);
    setMonths(num);
    onMonthsChange(num);
  };

  if (!forecastData || !forecastData.forecast || forecastData.forecast.length === 0) {
    return null;
  }

  const hasNegativeForecast = forecastData.forecast.some(f => f.projectedBalance < 0);

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-2xl shadow-accent/10 overflow-hidden">
      <CardHeader className="border-b border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
                Cash Flow Forecast
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Based on historical patterns</p>
            </div>
          </div>
          <Select value={months.toString()} onValueChange={handleMonthsChange}>
            <SelectTrigger className="w-32 border-accent/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">Avg Monthly Income</span>
            </div>
            <span className="text-xl font-bold text-accent">₹{forecastData.avgMonthlyIncome.toFixed(2)}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 border border-destructive/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Avg Monthly Expense</span>
            </div>
            <span className="text-xl font-bold text-destructive">₹{forecastData.avgMonthlyExpense.toFixed(2)}</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${
              forecastData.avgMonthlySavings >= 0 ? 'from-primary/20 to-primary/5 border-primary/30' : 'from-destructive/20 to-destructive/5 border-destructive/30'
            } border`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`h-4 w-4 ${forecastData.avgMonthlySavings >= 0 ? 'text-primary' : 'text-destructive'}`} />
              <span className="text-xs text-muted-foreground">Avg Monthly Savings</span>
            </div>
            <span className={`text-xl font-bold ${forecastData.avgMonthlySavings >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ₹{forecastData.avgMonthlySavings.toFixed(2)}
            </span>
          </motion.div>
        </div>

        {hasNegativeForecast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive font-medium">
              Warning: Forecast shows potential negative balance
            </span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(0,255,255,0.3)",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => `₹${value.toFixed(2)}`}
              />
              <Legend />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="projectedBalance"
                stroke="oklch(0.85 0.2 240)"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.isActual ? 8 : 5}
                      fill={payload.isActual ? "oklch(0.7 0.3 340)" : "oklch(0.85 0.2 240)"}
                      stroke={payload.isActual ? "white" : "none"}
                      strokeWidth={payload.isActual ? 2 : 0}
                    />
                  );
                }}
                name="Projected Balance"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
