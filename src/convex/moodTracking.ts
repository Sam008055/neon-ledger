import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Log mood for the day
export const logMood = mutation({
  args: {
    mood: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // Get today's spending
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const todaySpending = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === todayTimestamp && t.type === "expense";
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Check if mood already logged today
    const existing = await ctx.db
      .query("moodLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId).eq("date", todayTimestamp)
      )
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        mood: args.mood,
        note: args.note,
        spendingAmount: todaySpending,
      });
      return existing._id;
    }
    
    return await ctx.db.insert("moodLogs", {
      userId,
      date: todayTimestamp,
      mood: args.mood,
      note: args.note,
      spendingAmount: todaySpending,
    });
  },
});

// Get mood analytics
export const getMoodAnalytics = query({
  args: {
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const daysAgo = Date.now() - (args.days * 24 * 60 * 60 * 1000);
    
    const moodLogs = await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const recentLogs = moodLogs.filter(log => log.date >= daysAgo);
    
    // Calculate correlations
    const moodSpendingMap: Record<string, { totalSpending: number; count: number }> = {};
    
    recentLogs.forEach(log => {
      if (!moodSpendingMap[log.mood]) {
        moodSpendingMap[log.mood] = { totalSpending: 0, count: 0 };
      }
      moodSpendingMap[log.mood].totalSpending += log.spendingAmount;
      moodSpendingMap[log.mood].count += 1;
    });
    
    const correlations = Object.entries(moodSpendingMap).map(([mood, data]) => ({
      mood,
      averageSpending: data.count > 0 ? data.totalSpending / data.count : 0,
      occurrences: data.count,
    }));
    
    return {
      logs: recentLogs,
      correlations,
      totalLogs: recentLogs.length,
    };
  },
});

// Get mood logs
export const getMoodLogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("moodLogs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);
  },
});
