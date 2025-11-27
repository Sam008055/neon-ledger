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

// --- Transactions ---

export const getTransactions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100); // Limit to last 100 for now

    // Enrich with category and account info
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
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    return await ctx.db.insert("transactions", { ...args, userId });
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
