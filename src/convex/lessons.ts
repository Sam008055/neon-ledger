import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Get all lessons
export const getLessons = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getUserId(ctx);
    
    if (args.category) {
      return await ctx.db
        .query("lessons")
        .withIndex("by_category", (q) => q.eq("category", args.category as string))
        .order("asc")
        .collect();
    }
    
    return await ctx.db
      .query("lessons")
      .collect();
  },
});

// Get user's lesson progress
export const getUserLessons = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    
    const userLessons = await ctx.db
      .query("userLessons")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const enriched = await Promise.all(
      userLessons.map(async (ul) => {
        const lesson = await ctx.db.get(ul.lessonId);
        return { ...ul, lesson };
      })
    );
    
    return enriched;
  },
});

// Start or update lesson progress
export const updateLessonProgress = mutation({
  args: {
    lessonId: v.id("lessons"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    
    const existing = await ctx.db
      .query("userLessons")
      .withIndex("by_user_and_lesson", (q) => 
        q.eq("userId", userId).eq("lessonId", args.lessonId)
      )
      .first();
    
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) throw new Error("Lesson not found");
    
    const isCompleted = args.progress >= 100;
    const status = args.progress === 0 ? "not_started" : isCompleted ? "completed" : "in_progress";
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        progress: args.progress,
        status,
        completedAt: isCompleted ? Date.now() : existing.completedAt,
        pointsEarned: isCompleted ? lesson.points : existing.pointsEarned,
      });
      
      // Award points if newly completed
      if (isCompleted && existing.status !== "completed") {
        const progress = await ctx.db
          .query("userProgress")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
        
        if (progress) {
          await ctx.db.patch(progress._id, {
            totalPoints: progress.totalPoints + lesson.points,
          });
        }
        
        await ctx.db.insert("achievements", {
          userId,
          type: "lesson_completed",
          title: "Knowledge Gained!",
          description: `Completed lesson: ${lesson.title}`,
          unlockedAt: Date.now(),
          points: lesson.points,
        });
      }
    } else {
      await ctx.db.insert("userLessons", {
        userId,
        lessonId: args.lessonId,
        progress: args.progress,
        status,
        completedAt: isCompleted ? Date.now() : undefined,
        pointsEarned: isCompleted ? lesson.points : 0,
      });
      
      if (isCompleted) {
        const progress = await ctx.db
          .query("userProgress")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .first();
        
        if (progress) {
          await ctx.db.patch(progress._id, {
            totalPoints: progress.totalPoints + lesson.points,
          });
        }
      }
    }
  },
});

// Seed initial lessons
export const seedLessons = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("lessons").first();
    if (existing) return;
    
    const lessons = [
      {
        title: "Budgeting Basics",
        description: "Learn the fundamentals of creating and maintaining a budget",
        category: "budgeting",
        difficulty: "beginner",
        content: "A budget is a plan for your money. Learn the 50/30/20 rule: 50% needs, 30% wants, 20% savings...",
        estimatedMinutes: 10,
        points: 50,
        order: 1,
      },
      {
        title: "Emergency Fund Essentials",
        description: "Why you need an emergency fund and how to build one",
        category: "saving",
        difficulty: "beginner",
        content: "An emergency fund is 3-6 months of expenses saved for unexpected situations...",
        estimatedMinutes: 15,
        points: 75,
        order: 2,
      },
      {
        title: "Understanding Credit Scores",
        description: "What affects your credit score and how to improve it",
        category: "debt",
        difficulty: "intermediate",
        content: "Your credit score ranges from 300-850 and affects loan rates...",
        estimatedMinutes: 20,
        points: 100,
        order: 3,
      },
      {
        title: "Investment Fundamentals",
        description: "Introduction to stocks, bonds, and mutual funds",
        category: "investing",
        difficulty: "intermediate",
        content: "Investing helps your money grow over time through compound interest...",
        estimatedMinutes: 25,
        points: 125,
        order: 4,
      },
      {
        title: "Tax Planning Strategies",
        description: "Learn how to minimize taxes and maximize deductions",
        category: "taxes",
        difficulty: "advanced",
        content: "Understanding tax brackets and deductions can save you thousands...",
        estimatedMinutes: 30,
        points: 150,
        order: 5,
      },
    ];
    
    for (const lesson of lessons) {
      await ctx.db.insert("lessons", lesson);
    }
  },
});
