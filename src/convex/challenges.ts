import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Get user's challenges
export const getChallenges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    return await ctx.db
      .query("challenges")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Generate random challenges for user
export const generateChallenges = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    // Check if user already has active challenges
    const activeChallenges = await ctx.db
      .query("challenges")
      .withIndex("by_user_and_status", (q) => q.eq("userId", userId).eq("status", "active"))
      .collect();
    
    if (activeChallenges.length >= 3) {
      return { message: "You already have 3 active challenges" };
    }
    
    const challengeTemplates = [
      {
        title: "Budget Master",
        description: "Create a transaction in 3 different categories",
        type: "daily",
        difficulty: "easy",
        points: 50,
        requirement: JSON.stringify({ type: "categories", count: 3 }),
      },
      {
        title: "Savings Streak",
        description: "Record 5 income transactions this week",
        type: "weekly",
        difficulty: "medium",
        points: 100,
        requirement: JSON.stringify({ type: "income", count: 5 }),
      },
      {
        title: "Goal Setter",
        description: "Create and fund a new financial goal",
        type: "daily",
        difficulty: "easy",
        points: 75,
        requirement: JSON.stringify({ type: "goal", action: "create_and_fund" }),
      },
      {
        title: "Transaction Tracker",
        description: "Log 10 transactions with receipts",
        type: "weekly",
        difficulty: "hard",
        points: 150,
        requirement: JSON.stringify({ type: "receipts", count: 10 }),
      },
      {
        title: "Category Champion",
        description: "Stay under budget in Food category",
        type: "daily",
        difficulty: "medium",
        points: 80,
        requirement: JSON.stringify({ type: "budget", category: "Food" }),
      },
    ];
    
    // Select random challenges
    const numToGenerate = Math.min(3 - activeChallenges.length, 3);
    const selectedChallenges = [];
    const usedIndices = new Set();
    
    while (selectedChallenges.length < numToGenerate) {
      const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        selectedChallenges.push(challengeTemplates[randomIndex]);
      }
    }
    
    // Create challenges
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    
    for (const template of selectedChallenges) {
      const expiresAt = template.type === "daily" ? now + oneDayMs : now + oneWeekMs;
      
      await ctx.db.insert("challenges", {
        userId,
        ...template,
        status: "active",
        expiresAt,
      });
    }
    
    return { message: `Generated ${numToGenerate} new challenges!` };
  },
});

// Complete a challenge
export const completeChallenge = mutation({
  args: {
    challengeId: v.id("challenges"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const challenge = await ctx.db.get(args.challengeId);
    
    if (!challenge || challenge.userId !== userId) {
      throw new Error("Unauthorized");
    }
    
    if (challenge.status !== "active") {
      throw new Error("Challenge is not active");
    }
    
    // Update challenge status
    await ctx.db.patch(args.challengeId, {
      status: "completed",
      completedAt: Date.now(),
    });
    
    // Award points to user
    const progress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (progress) {
      await ctx.db.patch(progress._id, {
        totalPoints: progress.totalPoints + challenge.points,
      });
    }
    
    // Create achievement
    await ctx.db.insert("achievements", {
      userId,
      type: "challenge_completed",
      title: "Challenge Complete!",
      description: `Completed: ${challenge.title}`,
      unlockedAt: Date.now(),
      points: challenge.points,
    });
    
    return { points: challenge.points };
  },
});
