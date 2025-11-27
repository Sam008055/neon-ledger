import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatbotProps {
  dashboardData: {
    totalBalance: number;
    income: number;
    expense: number;
    net: number;
    categoryBreakdown: Array<{ name: string; amount: number; color: string }>;
  } | undefined;
}

export function AIChatbot({ dashboardData }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your financial AI assistant. Ask me anything about your finances, spending habits, or how to improve your budget!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateAIResponse = (userMessage: string): string => {
    if (!dashboardData) {
      return "I need your financial data to provide insights. Please make sure you have some accounts and transactions recorded.";
    }

    const lowerMessage = userMessage.toLowerCase();

    // Cost-cutting analysis
    if (lowerMessage.includes("cut") || lowerMessage.includes("reduce") || lowerMessage.includes("save money") || lowerMessage.includes("lower")) {
      if (dashboardData.categoryBreakdown.length === 0) {
        return "You don't have any expense data yet. Start recording transactions to get cost-cutting recommendations!";
      }

      const sortedCategories = [...dashboardData.categoryBreakdown].sort((a, b) => b.amount - a.amount);
      const totalSpending = dashboardData.expense;
      
      let analysis = `💡 Cost-Cutting Analysis:\n\n`;
      analysis += `Total monthly spending: ₹${totalSpending.toFixed(2)}\n\n`;
      analysis += `Here's where you can reduce costs:\n\n`;
      
      sortedCategories.slice(0, 3).forEach((cat, idx) => {
        const percentage = ((cat.amount / totalSpending) * 100).toFixed(1);
        const potentialSavings = (cat.amount * 0.2).toFixed(2); // 20% reduction
        analysis += `${idx + 1}. ${cat.name}: ₹${cat.amount.toFixed(2)} (${percentage}%)\n`;
        analysis += `   → Reduce by 20%: Save ₹${potentialSavings}/month\n\n`;
      });
      
      if (dashboardData.net < 0) {
        const deficit = Math.abs(dashboardData.net);
        analysis += `⚠️ You need to cut at least ₹${deficit.toFixed(2)}/month to break even.\n`;
      }
      
      return analysis;
    }

    // Comprehensive spending analysis
    if (lowerMessage.includes("spending") || lowerMessage.includes("spend") || lowerMessage.includes("expense")) {
      if (dashboardData.categoryBreakdown.length === 0) {
        return "You don't have any spending data yet. Start recording transactions to get detailed insights!";
      }

      const topCategory = dashboardData.categoryBreakdown.reduce((max, cat) => cat.amount > max.amount ? cat : max);
      const totalSpending = dashboardData.categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
      const topPercentage = ((topCategory.amount / totalSpending) * 100).toFixed(1);
      
      let analysis = `Based on your data, you've spent ₹${dashboardData.expense.toFixed(2)} this month. `;
      analysis += `Your largest expense is ${topCategory.name} at ₹${topCategory.amount.toFixed(2)} (${topPercentage}% of total spending). `;
      
      if (dashboardData.categoryBreakdown.length > 1) {
        const secondCategory = dashboardData.categoryBreakdown.sort((a, b) => b.amount - a.amount)[1];
        analysis += `Your second highest expense is ${secondCategory.name} at ₹${secondCategory.amount.toFixed(2)}. `;
      }
      
      if (parseFloat(topPercentage) > 40) {
        analysis += `⚠️ ${topCategory.name} represents a significant portion of your spending. Consider reviewing if this aligns with your priorities.`;
      }
      
      return analysis;
    }

    // Detailed savings analysis
    if (lowerMessage.includes("save") || lowerMessage.includes("saving")) {
      if (dashboardData.income === 0) {
        return "I don't see any income recorded yet. Add income transactions to analyze your savings potential.";
      }

      const savingsRate = ((dashboardData.net / dashboardData.income) * 100).toFixed(1);
      const monthlySavings = dashboardData.net;
      
      let analysis = `Your current savings rate is ${savingsRate}%. `;
      
      if (monthlySavings < 0) {
        analysis += `You're currently spending ₹${Math.abs(monthlySavings).toFixed(2)} more than you earn. `;
        analysis += `To start saving, you need to reduce expenses by at least ₹${Math.abs(monthlySavings).toFixed(2)} per month. `;
        
        if (dashboardData.categoryBreakdown.length > 0) {
          const topCategory = dashboardData.categoryBreakdown.reduce((max, cat) => cat.amount > max.amount ? cat : max);
          analysis += `Start by reviewing your ${topCategory.name} expenses.`;
        }
      } else if (parseFloat(savingsRate) < 10) {
        analysis += `This is below the recommended minimum of 10%. Try to increase your savings by ₹${(dashboardData.income * 0.1 - monthlySavings).toFixed(2)} per month to reach 10%.`;
      } else if (parseFloat(savingsRate) < 20) {
        analysis += `You're on the right track! Financial experts recommend 20%. Increase savings by ₹${(dashboardData.income * 0.2 - monthlySavings).toFixed(2)} to reach this goal.`;
      } else {
        analysis += `Excellent! You're exceeding the recommended 20% savings rate. At this rate, you'll save ₹${(monthlySavings * 12).toFixed(2)} annually.`;
      }
      
      return analysis;
    }

    // Comprehensive budget advice
    if (lowerMessage.includes("budget") || lowerMessage.includes("improve") || lowerMessage.includes("advice")) {
      let advice = "📊 Financial Analysis & Recommendations:\n\n";
      
      // Income vs Expense analysis
      if (dashboardData.net < 0) {
        advice += `🔴 You're spending ₹${Math.abs(dashboardData.net).toFixed(2)} more than you earn. This is unsustainable. `;
        advice += `Immediate action needed: reduce expenses or increase income.\n\n`;
      } else if (dashboardData.net > 0) {
        const savingsRate = ((dashboardData.net / dashboardData.income) * 100).toFixed(1);
        advice += `🟢 Positive cash flow of ₹${dashboardData.net.toFixed(2)} (${savingsRate}% savings rate).\n\n`;
      }
      
      // Category-specific advice
      if (dashboardData.categoryBreakdown.length > 0) {
        const sortedCategories = [...dashboardData.categoryBreakdown].sort((a, b) => b.amount - a.amount);
        advice += `💰 Top spending categories:\n`;
        sortedCategories.slice(0, 3).forEach((cat, idx) => {
          const percentage = ((cat.amount / dashboardData.expense) * 100).toFixed(1);
          advice += `${idx + 1}. ${cat.name}: ₹${cat.amount.toFixed(2)} (${percentage}%)\n`;
        });
        advice += `\n`;
      }
      
      // 50/30/20 rule guidance
      const needs = dashboardData.income * 0.5;
      const wants = dashboardData.income * 0.3;
      const savings = dashboardData.income * 0.2;
      
      advice += `📈 Recommended budget (50/30/20 rule):\n`;
      advice += `• Needs (50%): ₹${needs.toFixed(2)}\n`;
      advice += `• Wants (30%): ₹${wants.toFixed(2)}\n`;
      advice += `• Savings (20%): ₹${savings.toFixed(2)}\n`;
      
      return advice;
    }

    // Income analysis
    if (lowerMessage.includes("income")) {
      if (dashboardData.income === 0) {
        return "No income recorded this month. Add your income transactions to track your earnings.";
      }
      
      let analysis = `Your monthly income is ₹${dashboardData.income.toFixed(2)}. `;
      analysis += `After expenses of ₹${dashboardData.expense.toFixed(2)}, your net cash flow is ₹${dashboardData.net.toFixed(2)}. `;
      
      if (dashboardData.net > 0) {
        const yearlySavings = dashboardData.net * 12;
        analysis += `If you maintain this, you'll save ₹${yearlySavings.toFixed(2)} annually.`;
      } else {
        analysis += `You need to reduce expenses by ₹${Math.abs(dashboardData.net).toFixed(2)} to break even.`;
      }
      
      return analysis;
    }

    // Balance inquiry
    if (lowerMessage.includes("balance") || lowerMessage.includes("total")) {
      let analysis = `Your total balance across all accounts is ₹${dashboardData.totalBalance.toFixed(2)}. `;
      
      if (dashboardData.net > 0) {
        const monthsOfExpenses = dashboardData.expense > 0 ? (dashboardData.totalBalance / dashboardData.expense).toFixed(1) : "N/A";
        analysis += `This covers approximately ${monthsOfExpenses} months of expenses at your current rate.`;
      }
      
      return analysis;
    }

    // Help/capabilities
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you")) {
      return "I can analyze your financial data and provide insights on:\n• Spending patterns and top expenses\n• Savings rate and recommendations\n• Budget advice and the 50/30/20 rule\n• Income vs expense analysis\n• Account balance overview\n\nJust ask me about any of these topics!";
    }

    // Default intelligent response
    return "I'm your AI financial analyst. I can provide detailed insights about your spending, savings, budget, income, and balance. What would you like to know about your finances?";
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="border-accent/30 h-[500px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          <CardTitle>AI Financial Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your finances..."
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
