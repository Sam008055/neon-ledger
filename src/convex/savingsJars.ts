import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Get all savings jars
export const getSavingsJars = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("savingsJars")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Create a new savings jar
export const createSavingsJar = mutation({
  args: {
    name: v.string(),
    targetAmount: v.number(),
    color: v.string(),
    emoji: v.string(),
    deadline: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    return await ctx.db.insert("savingsJars", {
      userId,
      name: args.name,
      targetAmount: args.targetAmount,
      currentAmount: 0,
      color: args.color,
      emoji: args.emoji,
      deadline: args.deadline,
      status: "active",
    });
  },
});

// Add money to savings jar
export const addToSavingsJar = mutation({
  args: {
    jarId: v.id("savingsJars"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const jar = await ctx.db.get(args.jarId);
    
    if (!jar || jar.userId !== userId) throw new Error("Unauthorized");
    
    const newAmount = jar.currentAmount + args.amount;
    const status = newAmount >= jar.targetAmount ? "completed" : "active";
    
    await ctx.db.patch(args.jarId, {
      currentAmount: newAmount,
      status,
    });
    
    // Award achievement if completed
    if (status === "completed" && jar.status !== "completed") {
      await ctx.db.insert("achievements", {
        userId,
        type: "savings_jar_completed",
        title: "Savings Goal Achieved!",
        description: `Filled your ${jar.name} jar!`,
        unlockedAt: Date.now(),
        points: 200,
      });
      
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (progress) {
        await ctx.db.patch(progress._id, {
          totalPoints: progress.totalPoints + 200,
        });
      }
    }
    
    return { newAmount, status };
  },
});

// Delete savings jar
export const deleteSavingsJar = mutation({
  args: { id: v.id("savingsJars") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const jar = await ctx.db.get(args.id);
    if (!jar || jar.userId !== userId) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});
