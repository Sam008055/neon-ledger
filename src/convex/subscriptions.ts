import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Get subscription analytics
export const getSubscriptionAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const subscriptions = transactions.filter(t => t.isSubscription);
    
    // Group by category to find recurring patterns
    const categoryMap: Record<string, { count: number; totalAmount: number; transactions: any[] }> = {};
    
    for (const sub of subscriptions) {
      const category = await ctx.db.get(sub.categoryId);
      const categoryName = category?.name || "Unknown";
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { count: 0, totalAmount: 0, transactions: [] };
      }
      
      categoryMap[categoryName].count += 1;
      categoryMap[categoryName].totalAmount += sub.amount;
      categoryMap[categoryName].transactions.push(sub);
    }
    
    const monthlyTotal = Object.values(categoryMap).reduce((sum, cat) => sum + cat.totalAmount, 0);
    
    const subscriptionList = Object.entries(categoryMap).map(([name, data]) => ({
      name,
      count: data.count,
      monthlyAmount: data.totalAmount,
      lastTransaction: data.transactions[data.transactions.length - 1],
    }));
    
    return {
      subscriptions: subscriptionList,
      monthlyTotal,
      count: subscriptions.length,
    };
  },
});

// Mark transaction as subscription
export const toggleSubscription = mutation({
  args: {
    transactionId: v.id("transactions"),
    isSubscription: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const transaction = await ctx.db.get(args.transactionId);
    
    if (!transaction || transaction.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    await ctx.db.patch(args.transactionId, {
      isSubscription: args.isSubscription,
    });
  },
});
