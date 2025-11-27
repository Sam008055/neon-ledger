import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Get personalized self-care suggestions
export const getSelfCareSuggestions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    // Get user's financial data
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    // Calculate current balance
    const accountBalances = accounts.map((acc) => {
      const accTransactions = transactions.filter((t) => t.accountId === acc._id);
      const balance = accTransactions.reduce((sum, t) => {
        return t.type === "income" ? sum + t.amount : sum - t.amount;
      }, acc.initialBalance);
      return balance;
    });
    
    const totalBalance = accountBalances.reduce((sum, bal) => sum + bal, 0);
    
    // Calculate monthly spending
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthlyExpenses = transactions
      .filter(t => t.date >= startOfMonth && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncome = transactions
      .filter(t => t.date >= startOfMonth && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate safe spending amount (5% of balance or 10% of monthly savings)
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const safeSpendAmount = Math.min(
      totalBalance * 0.05,
      monthlySavings > 0 ? monthlySavings * 0.1 : 100
    );
    
    // Generate suggestions based on financial health
    const suggestions = [];
    
    if (monthlySavings > 0 && safeSpendAmount > 50) {
      suggestions.push({
        title: "Treat Yourself! 🎉",
        description: `You've saved ₹${Math.round(monthlySavings)} this month. Consider spending up to ₹${Math.round(safeSpendAmount)} on something you enjoy!`,
        amount: Math.round(safeSpendAmount),
        category: "reward",
        icon: "🎁",
      });
    }
    
    if (monthlyExpenses < monthlyIncome * 0.7) {
      suggestions.push({
        title: "Self-Care Budget Available 💆",
        description: "You're doing great with savings! Allocate some funds for wellness activities.",
        amount: Math.round(monthlyIncome * 0.05),
        category: "wellness",
        icon: "🧘",
      });
    }
    
    if (totalBalance > 5000) {
      suggestions.push({
        title: "Experience Over Things 🌟",
        description: "Consider spending on experiences like dining out or entertainment within your budget.",
        amount: Math.round(safeSpendAmount * 0.8),
        category: "experience",
        icon: "🎭",
      });
    }
    
    // Always include a small treat suggestion
    suggestions.push({
      title: "Small Joy Budget ☕",
      description: "Life's too short! Grab a coffee or snack guilt-free.",
      amount: Math.min(100, Math.round(safeSpendAmount * 0.2)),
      category: "small_treat",
      icon: "☕",
    });
    
    return {
      suggestions,
      financialHealth: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings,
        savingsRate: monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0,
      },
    };
  },
});
