import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface SpendingTrendsChartProps {
  trends: Array<{
    period: string;
    income: number;
    expense: number;
    net: number;
  }> | undefined;
  onPeriodChange: (period: string) => void;
  onMonthsChange: (months: number) => void;
}

export function SpendingTrendsChart({ trends, onPeriodChange, onMonthsChange }: SpendingTrendsChartProps) {
  const [period, setPeriod] = useState("month");
  const [months, setMonths] = useState(6);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    onPeriodChange(value);
  };

  const handleMonthsChange = (value: string) => {
    const num = parseInt(value);
    setMonths(num);
    onMonthsChange(num);
  };

  if (!trends || trends.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10 overflow-hidden">
      <CardHeader className="border-b border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg"
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Spending Trends Over Time
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32 border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={months.toString()} onValueChange={handleMonthsChange}>
              <SelectTrigger className="w-24 border-primary/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
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
              <Line
                type="monotone"
                dataKey="income"
                stroke="oklch(0.85 0.3 140)"
                strokeWidth={3}
                dot={{ fill: "oklch(0.85 0.3 140)", r: 5 }}
                activeDot={{ r: 8 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="oklch(0.6 0.25 20)"
                strokeWidth={3}
                dot={{ fill: "oklch(0.6 0.25 20)", r: 5 }}
                activeDot={{ r: 8 }}
                name="Expense"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="oklch(0.85 0.2 240)"
                strokeWidth={3}
                dot={{ fill: "oklch(0.85 0.2 240)", r: 5 }}
                activeDot={{ r: 8 }}
                name="Net Savings"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
