import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get authenticated user
async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// --- Accounts ---

export const getAccounts = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createAccount = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    initialBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return await ctx.db.insert("accounts", { ...args, userId });
  },
});

export const updateAccount = mutation({
  args: {
    id: v.id("accounts"),
    name: v.string(),
    type: v.string(),
    initialBalance: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.patch(args.id, {
      name: args.name,
      type: args.type,
      initialBalance: args.initialBalance,
    });
  },
});

export const deleteAccount = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const account = await ctx.db.get(args.id);
    if (!account || account.userId !== userId) throw new Error("Unauthorized");
    
    // Check for transactions linked to this account
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_account", (q) => q.eq("accountId", args.id))
      .take(1);
      
    if (transactions.length > 0) {
      throw new Error("Cannot delete account with existing transactions");
    }
    
    await ctx.db.delete(args.id);
  },
});

// --- Categories ---

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return await ctx.db.insert("categories", { ...args, userId });
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

// --- Goals ---

export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const createGoal = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    deadline: v.number(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return await ctx.db.insert("goals", {
      userId,
      name: args.name,
      targetAmount: args.targetAmount,
      currentAmount: 0,
      deadline: args.deadline,
      status: "active",
      category: args.category,
    });
  },
});

export const updateGoalProgress = mutation({
  args: {
    goalId: v.id("goals"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId) throw new Error("Unauthorized");
    
    const newAmount = goal.currentAmount + args.amount;
    const status = newAmount >= goal.targetAmount ? "completed" : "active";
    
    await ctx.db.patch(args.goalId, {
      currentAmount: newAmount,
      status,
    });
    
    // Award achievement if goal completed
    if (status === "completed") {
      await ctx.db.insert("achievements", {
        userId,
        type: "goal_completed",
        title: "Goal Achieved!",
        description: `Completed goal: ${goal.name}`,
        unlockedAt: Date.now(),
        points: 100,
      });
      
      // Update user progress
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (progress) {
        await ctx.db.patch(progress._id, {
          totalPoints: progress.totalPoints + 100,
        });
      }
    }
  },
});

export const deleteGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

// --- Achievements & Progress ---

export const getAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return progress;
  },
});

export const initializeUserProgress = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    // Check if progress already exists
    const existing = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (existing) return existing._id;
    
    // Create new progress
    return await ctx.db.insert("userProgress", {
      userId,
      totalPoints: 0,
      level: 1,
      savingsStreak: 0,
      transactionCount: 0,
      lastActivityDate: Date.now(),
    });
  },
});

// --- Transactions (with achievement tracking) ---

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);

    const enriched = await Promise.all(
      transactions.map(async (t) => {
        const category = await ctx.db.get(t.categoryId);
        const account = await ctx.db.get(t.accountId);
        return { ...t, category, account };
      })
    );
    return enriched;
  },
});

export const createTransaction = mutation({
  args: {
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    amount: v.number(),
    type: v.string(),
    date: v.number(),
    note: v.optional(v.string()),
    receiptId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const transactionId = await ctx.db.insert("transactions", { ...args, userId });
    
    // Update user progress
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (progress) {
      const newCount = progress.transactionCount + 1;
      await ctx.db.patch(progress._id, {
        transactionCount: newCount,
        lastActivityDate: Date.now(),
      });
      
      // Award first transaction achievement
      if (newCount === 1) {
        await ctx.db.insert("achievements", {
          userId,
          type: "first_transaction",
          title: "First Step!",
          description: "Recorded your first transaction",
          unlockedAt: Date.now(),
          points: 50,
        });
        await ctx.db.patch(progress._id, {
          totalPoints: progress.totalPoints + 50,
        });
      }
    }
    
    return transactionId;
  },
});

export const deleteTransaction = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

// --- Dashboard Data ---

export const getDashboardData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate account balances
    const accountBalances = accounts.map((acc) => {
      const accTransactions = transactions.filter((t) => t.accountId === acc._id);
      const balance = accTransactions.reduce((sum, t) => {
        return t.type === "income" ? sum + t.amount : sum - t.amount;
      }, acc.initialBalance);
      return { ...acc, balance };
    });

    const totalBalance = accountBalances.reduce((sum, acc) => sum + acc.balance, 0);

    // Monthly Summary (Current Month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const currentMonthTransactions = transactions.filter((t) => t.date >= startOfMonth);
    
    const income = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Category Breakdown
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    const categoryBreakdown = categories.map((cat) => {
      const amount = currentMonthTransactions
        .filter((t) => t.categoryId === cat._id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: cat.name, amount, color: cat.color || "#00ffff" };
    }).filter(c => c.amount > 0);

    return {
      totalBalance,
      income,
      expense,
      net: income - expense,
      accountBalances,
      categoryBreakdown,
    };
  },
});

// --- Advanced Analytics ---

export const getSpendingTrends = query({
  args: {
    period: v.string(), // "week", "month", "quarter"
    months: v.number(), // number of periods to show
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const trends = [];

    for (let i = args.months - 1; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let label: string;

      if (args.period === "week") {
        periodEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        label = `Week ${args.months - i}`;
      } else if (args.period === "quarter") {
        const quarterMonth = now.getMonth() - (i * 3);
        periodStart = new Date(now.getFullYear(), quarterMonth, 1);
        periodEnd = new Date(now.getFullYear(), quarterMonth + 3, 0);
        label = `Q${Math.floor((periodStart.getMonth() / 3)) + 1} ${periodStart.getFullYear()}`;
      } else {
        // month
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        label = periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }

      const periodTransactions = transactions.filter(
        (t) => t.date >= periodStart.getTime() && t.date <= periodEnd.getTime()
      );

      const income = periodTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = periodTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        period: label,
        income,
        expense,
        net: income - expense,
      });
    }

    return trends;
  },
});

export const getCategoryComparison = query({
  args: {
    months: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const now = new Date();
    const comparison: Record<string, any> = {};

    categories.forEach((cat) => {
      comparison[cat.name] = {
        categoryId: cat._id,
        color: cat.color || "#00ffff",
        data: [],
      };
    });

    for (let i = args.months - 1; i >= 0; i--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = periodStart.toLocaleDateString('en-US', { month: 'short' });

      const periodTransactions = transactions.filter(
        (t) => t.date >= periodStart.getTime() && t.date <= periodEnd.getTime()
      );

      categories.forEach((cat) => {
        const amount = periodTransactions
          .filter((t) => t.categoryId === cat._id)
          .reduce((sum, t) => sum + t.amount, 0);

        comparison[cat.name].data.push({
          month: label,
          amount,
        });
      });
    }

    return comparison;
  },
});

export const getCashFlowForecast = query({
  args: {
    monthsAhead: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate historical averages (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).getTime();
    const recentTransactions = transactions.filter((t) => t.date >= sixMonthsAgo);

    const avgMonthlyIncome = recentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0) / 6;

    const avgMonthlyExpense = recentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0) / 6;

    // Get current balance
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const accountBalances = accounts.map((acc) => {
      const accTransactions = transactions.filter((t) => t.accountId === acc._id);
      const balance = accTransactions.reduce((sum, t) => {
        return t.type === "income" ? sum + t.amount : sum - t.amount;
      }, acc.initialBalance);
      return balance;
    });

    const currentBalance = accountBalances.reduce((sum, bal) => sum + bal, 0);

    // Generate forecast
    const forecast = [];
    let projectedBalance = currentBalance;

    for (let i = 0; i <= args.monthsAhead; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = forecastDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (i > 0) {
        projectedBalance += avgMonthlyIncome - avgMonthlyExpense;
      }

      forecast.push({
        month: label,
        projectedBalance,
        projectedIncome: avgMonthlyIncome,
        projectedExpense: avgMonthlyExpense,
        isActual: i === 0,
      });
    }

    return {
      forecast,
      avgMonthlyIncome,
      avgMonthlyExpense,
      avgMonthlySavings: avgMonthlyIncome - avgMonthlyExpense,
    };
  },
});

// --- Receipt Upload ---

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getUserId(ctx); // Ensure authenticated
    return await ctx.storage.generateUploadUrl();
  },
});

export const getReceiptUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    await getUserId(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

// --- Seed Data ---
export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    // Check if data exists
    const existingAccounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
        
    if (existingAccounts) return; // Already seeded

    // Create Accounts
    const checkingId = await ctx.db.insert("accounts", {
        userId,
        name: "Main Checking",
        type: "bank",
        initialBalance: 5000,
    });
    
    const savingsId = await ctx.db.insert("accounts", {
        userId,
        name: "Savings",
        type: "bank",
        initialBalance: 10000,
    });

    // Create Categories
    const salaryId = await ctx.db.insert("categories", {
        userId,
        name: "Salary",
        type: "income",
        color: "#00ff00",
    });
    
    const rentId = await ctx.db.insert("categories", {
        userId,
        name: "Rent",
        type: "expense",
        color: "#ff0080",
    });
    
    const foodId = await ctx.db.insert("categories", {
        userId,
        name: "Food",
        type: "expense",
        color: "#00ffff",
    });

    // Create Transactions
    const now = Date.now();
    
    await ctx.db.insert("transactions", {
        userId,
        accountId: checkingId,
        categoryId: salaryId,
        amount: 3000,
        type: "income",
        date: now - 86400000 * 5, // 5 days ago
        note: "Monthly Salary",
    });
    
    await ctx.db.insert("transactions", {
        userId,
        accountId: checkingId,
        categoryId: rentId,
        amount: 1200,
        type: "expense",
        date: now - 86400000 * 2, // 2 days ago
        note: "Apartment Rent",
    });
    
    await ctx.db.insert("transactions", {
        userId,
        accountId: checkingId,
        categoryId: foodId,
        amount: 50,
        type: "expense",
        date: now - 86400000 * 1, // 1 day ago
        note: "Groceries",
    });
  }
});