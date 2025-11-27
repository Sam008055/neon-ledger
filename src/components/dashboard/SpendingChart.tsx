import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { PieChart as PieChartIcon } from "lucide-react";

interface SpendingChartProps {
  categoryBreakdown: Array<{ name: string; amount: number; color: string }>;
}

export function SpendingChart({ categoryBreakdown }: SpendingChartProps) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-2xl shadow-secondary/10 overflow-hidden">
      <CardHeader className="border-b border-secondary/20 bg-gradient-to-r from-secondary/10 to-primary/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-xl bg-gradient-to-br from-secondary to-primary shadow-lg"
          >
            <PieChartIcon className="h-5 w-5 text-white" />
          </motion.div>
          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
            Spending Breakdown
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </CardContent>
    </Card>
  );
}