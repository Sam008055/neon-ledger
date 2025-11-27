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
      return "I need your financial data to provide insights. Please make sure you have some transactions recorded.";
    }

    const lowerMessage = userMessage.toLowerCase();

    // Spending analysis
    if (lowerMessage.includes("spending") || lowerMessage.includes("spend")) {
      const topCategory = dashboardData.categoryBreakdown.length > 0
        ? dashboardData.categoryBreakdown.reduce((max, cat) => cat.amount > max.amount ? cat : max)
        : null;
      
      if (topCategory) {
        return `Your biggest spending category is ${topCategory.name} at ₹${topCategory.amount.toFixed(2)}. Consider setting a budget limit for this category to control expenses.`;
      }
      return "You don't have any spending data yet. Start recording transactions to get insights!";
    }

    // Savings analysis
    if (lowerMessage.includes("save") || lowerMessage.includes("saving")) {
      const savingsRate = dashboardData.income > 0 
        ? ((dashboardData.net / dashboardData.income) * 100).toFixed(1)
        : "0";
      
      if (parseFloat(savingsRate) < 20) {
        return `Your current savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of your income. Try reducing discretionary spending to increase your savings.`;
      }
      return `Great job! You're saving ${savingsRate}% of your income. Keep up the good work!`;
    }

    // Budget advice
    if (lowerMessage.includes("budget") || lowerMessage.includes("improve")) {
      const suggestions = [];
      
      if (dashboardData.net < 0) {
        suggestions.push("You're spending more than you earn. Review your expenses and cut non-essential items.");
      }
      
      if (dashboardData.categoryBreakdown.length > 0) {
        const topSpending = dashboardData.categoryBreakdown[0];
        suggestions.push(`Focus on reducing ${topSpending.name} expenses, which is your highest spending category.`);
      }
      
      suggestions.push("Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.");
      
      return suggestions.join(" ");
    }

    // Income analysis
    if (lowerMessage.includes("income")) {
      return `Your monthly income is ₹${dashboardData.income.toFixed(2)}. Your expenses are ₹${dashboardData.expense.toFixed(2)}, leaving you with a net flow of ₹${dashboardData.net.toFixed(2)}.`;
    }

    // Balance inquiry
    if (lowerMessage.includes("balance")) {
      return `Your total balance across all accounts is ₹${dashboardData.totalBalance.toFixed(2)}.`;
    }

    // Default response
    return "I can help you with spending analysis, savings tips, budget advice, and financial planning. Try asking about your spending, savings rate, or how to improve your budget!";
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
