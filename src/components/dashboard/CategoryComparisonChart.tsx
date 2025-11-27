import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CategoryComparisonChartProps {
  comparison: Record<string, any> | undefined;
  onMonthsChange: (months: number) => void;
}

export function CategoryComparisonChart({ comparison, onMonthsChange }: CategoryComparisonChartProps) {
  const [months, setMonths] = useState(6);

  const handleMonthsChange = (value: string) => {
    const num = parseInt(value);
    setMonths(num);
    onMonthsChange(num);
  };

  if (!comparison || Object.keys(comparison).length === 0) {
    return null;
  }

  // Transform data for the chart
  const categories = Object.keys(comparison);
  const months_data = comparison[categories[0]]?.data || [];
  
  const chartData = months_data.map((monthData: any, idx: number) => {
    const dataPoint: any = { month: monthData.month };
    categories.forEach((cat) => {
      dataPoint[cat] = comparison[cat].data[idx]?.amount || 0;
    });
    return dataPoint;
  });

  return (
    <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-2xl shadow-secondary/10 overflow-hidden">
      <CardHeader className="border-b border-secondary/20 bg-gradient-to-r from-secondary/10 to-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-xl bg-gradient-to-br from-secondary to-primary shadow-lg"
            >
              <Target className="h-5 w-5 text-white" />
            </motion.div>
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
              Category Comparison
            </CardTitle>
          </div>
          <Select value={months.toString()} onValueChange={handleMonthsChange}>
            <SelectTrigger className="w-32 border-secondary/30">
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
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
              {categories.map((cat, idx) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  fill={comparison[cat].color}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}
