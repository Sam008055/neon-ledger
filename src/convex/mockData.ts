import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// Seed comprehensive mock data
export const seedAllMockData = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      console.log("seedAllMockData called");
      const userId = await getUserId(ctx);
      console.log("User ID:", userId);
      
      if (!userId) {
        console.error("No user ID found");
        return { success: false, message: "User not authenticated" };
      }
      
      // Check if data already exists
      const existingAccounts = await ctx.db
        .query("accounts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (existingAccounts) {
        console.log("Mock data already exists");
        return { success: false, message: "Mock data already exists. Clear it first!" };
      }
      
      console.log("Creating mock data...");

    // Create Accounts
    const checkingId = await ctx.db.insert("accounts", {
      userId,
      name: "Main Checking",
      type: "bank",
      initialBalance: 15000,
    });
    
    const savingsId = await ctx.db.insert("accounts", {
      userId,
      name: "Savings Account",
      type: "bank",
      initialBalance: 50000,
    });
    
    const cashId = await ctx.db.insert("accounts", {
      userId,
      name: "Cash Wallet",
      type: "cash",
      initialBalance: 2000,
    });

    // Create Categories
    const salaryId = await ctx.db.insert("categories", {
      userId,
      name: "Salary",
      type: "income",
      color: "#00ff00",
    });
    
    const freelanceId = await ctx.db.insert("categories", {
      userId,
      name: "Freelance",
      type: "income",
      color: "#00ffaa",
    });
    
    const rentId = await ctx.db.insert("categories", {
      userId,
      name: "Rent",
      type: "expense",
      color: "#ff0080",
    });
    
    const foodId = await ctx.db.insert("categories", {
      userId,
      name: "Food & Dining",
      type: "expense",
      color: "#00ffff",
    });
    
    const transportId = await ctx.db.insert("categories", {
      userId,
      name: "Transport",
      type: "expense",
      color: "#ffff00",
    });
    
    const entertainmentId = await ctx.db.insert("categories", {
      userId,
      name: "Entertainment",
      type: "expense",
      color: "#ff00ff",
    });
    
    const subscriptionId = await ctx.db.insert("categories", {
      userId,
      name: "Subscriptions",
      type: "expense",
      color: "#ff6600",
    });

    // Create Transactions (last 30 days with moods and subscriptions)
    const now = Date.now();
    const moods = ["happy", "excited", "neutral", "stressed", "sad"];
    
    // Income transactions
    await ctx.db.insert("transactions", {
      userId,
      accountId: checkingId,
      categoryId: salaryId,
      amount: 50000,
      type: "income",
      date: now - 86400000 * 25,
      note: "Monthly Salary",
      mood: "excited",
    });
    
    await ctx.db.insert("transactions", {
      userId,
      accountId: checkingId,
      categoryId: freelanceId,
      amount: 15000,
      type: "income",
      date: now - 86400000 * 15,
      note: "Freelance Project",
      mood: "happy",
    });

    // Expense transactions with variety
    const expenses = [
      { categoryId: rentId, amount: 12000, note: "Monthly Rent", days: 20, mood: "neutral", isSubscription: true },
      { categoryId: subscriptionId, amount: 199, note: "Netflix", days: 18, mood: "happy", isSubscription: true },
      { categoryId: subscriptionId, amount: 299, note: "Spotify Premium", days: 18, mood: "happy", isSubscription: true },
      { categoryId: subscriptionId, amount: 499, note: "Amazon Prime", days: 17, mood: "neutral", isSubscription: true },
      { categoryId: foodId, amount: 450, note: "Groceries", days: 15, mood: "neutral" },
      { categoryId: foodId, amount: 850, note: "Restaurant Dinner", days: 12, mood: "happy" },
      { categoryId: transportId, amount: 200, note: "Uber Ride", days: 10, mood: "stressed" },
      { categoryId: entertainmentId, amount: 1200, note: "Movie & Snacks", days: 8, mood: "excited" },
      { categoryId: foodId, amount: 350, note: "Coffee & Breakfast", days: 7, mood: "happy" },
      { categoryId: transportId, amount: 150, note: "Metro Card Recharge", days: 6, mood: "neutral" },
      { categoryId: foodId, amount: 600, note: "Lunch with Friends", days: 5, mood: "happy" },
      { categoryId: entertainmentId, amount: 800, note: "Concert Tickets", days: 4, mood: "excited" },
      { categoryId: foodId, amount: 400, note: "Groceries", days: 3, mood: "neutral" },
      { categoryId: transportId, amount: 180, note: "Cab Ride", days: 2, mood: "stressed" },
      { categoryId: foodId, amount: 250, note: "Dinner", days: 1, mood: "happy" },
    ];

    for (const expense of expenses) {
      await ctx.db.insert("transactions", {
        userId,
        accountId: checkingId,
        categoryId: expense.categoryId,
        amount: expense.amount,
        type: "expense",
        date: now - 86400000 * expense.days,
        note: expense.note,
        mood: expense.mood,
        isSubscription: expense.isSubscription || false,
      });
    }

    // Create Goals
    await ctx.db.insert("goals", {
      userId,
      name: "Emergency Fund",
      targetAmount: 100000,
      currentAmount: 35000,
      deadline: now + 86400000 * 180,
      status: "active",
      category: "savings",
    });
    
    await ctx.db.insert("goals", {
      userId,
      name: "Vacation to Goa",
      targetAmount: 30000,
      currentAmount: 12000,
      deadline: now + 86400000 * 90,
      status: "active",
      category: "travel",
    });
    
    await ctx.db.insert("goals", {
      userId,
      name: "New Laptop",
      targetAmount: 80000,
      currentAmount: 80000,
      deadline: now - 86400000 * 10,
      status: "completed",
      category: "tech",
    });

    // Create Savings Jars
    await ctx.db.insert("savingsJars", {
      userId,
      name: "Dream Vacation",
      targetAmount: 50000,
      currentAmount: 18000,
      color: "#00ffff",
      emoji: "✈️",
      status: "active",
    });
    
    await ctx.db.insert("savingsJars", {
      userId,
      name: "New Phone",
      targetAmount: 60000,
      currentAmount: 42000,
      color: "#ff00ff",
      emoji: "📱",
      status: "active",
    });
    
    await ctx.db.insert("savingsJars", {
      userId,
      name: "Gaming Setup",
      targetAmount: 100000,
      currentAmount: 25000,
      color: "#ffff00",
      emoji: "🎮",
      status: "active",
    });

    // Create Mood Logs
    for (let i = 0; i < 15; i++) {
      const date = new Date(now - 86400000 * i);
      date.setHours(0, 0, 0, 0);
      
      await ctx.db.insert("moodLogs", {
        userId,
        date: date.getTime(),
        mood: moods[Math.floor(Math.random() * moods.length)],
        spendingAmount: Math.floor(Math.random() * 2000) + 200,
        note: i === 0 ? "Feeling great today!" : undefined,
      });
    }

    // Create Bank Connection
    await ctx.db.insert("bankConnections", {
      userId,
      bankName: "HDFC Bank",
      accountNumber: "****1234",
      provider: "upi",
      status: "connected",
      lastSyncedAt: now - 86400000 * 2,
    });

    // Create Achievements
    const achievements = [
      { type: "first_transaction", title: "First Step!", description: "Recorded your first transaction", points: 50 },
      { type: "goal_completed", title: "Goal Achieved!", description: "Completed goal: New Laptop", points: 100 },
      { type: "savings_jar_completed", title: "Jar Master!", description: "Filled a savings jar", points: 200 },
      { type: "lesson_completed", title: "Knowledge Gained!", description: "Completed a financial lesson", points: 75 },
      { type: "challenge_completed", title: "Challenge Champion!", description: "Completed a daily challenge", points: 50 },
    ];

    for (const achievement of achievements) {
      await ctx.db.insert("achievements", {
        userId,
        type: achievement.type,
        title: achievement.title,
        description: achievement.description,
        unlockedAt: now - 86400000 * Math.floor(Math.random() * 20),
        points: achievement.points,
      });
    }

    // Initialize/Update User Progress
    const existingProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    
    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, {
        totalPoints: existingProgress.totalPoints + totalPoints,
        transactionCount: existingProgress.transactionCount + expenses.length + 2,
        savingsStreak: 3,
        lastActivityDate: now,
      });
    } else {
      await ctx.db.insert("userProgress", {
        userId,
        totalPoints,
        level: Math.floor(totalPoints / 500) + 1,
        transactionCount: expenses.length + 2,
        savingsStreak: 3,
        lastActivityDate: now,
      });
    }

    // Seed Lessons if not exist
    const existingLesson = await ctx.db.query("lessons").first();
    if (!existingLesson) {
      const lessons = [
        {
          title: "Budgeting Basics",
          description: "Learn the fundamentals of creating and maintaining a budget",
          category: "budgeting",
          difficulty: "beginner",
          content: "A budget is a plan for your money. The 50/30/20 rule suggests: 50% for needs (rent, food, utilities), 30% for wants (entertainment, dining out), and 20% for savings and debt repayment. Start by tracking all your expenses for a month to understand your spending patterns.",
          estimatedMinutes: 10,
          points: 50,
          order: 1,
        },
        {
          title: "Emergency Fund Essentials",
          description: "Why you need an emergency fund and how to build one",
          category: "saving",
          difficulty: "beginner",
          content: "An emergency fund is 3-6 months of expenses saved for unexpected situations like job loss or medical emergencies. Start small - even ₹500/month adds up. Keep it in a separate savings account that's easily accessible but not too tempting to dip into.",
          estimatedMinutes: 15,
          points: 75,
          order: 2,
        },
        {
          title: "Understanding Credit Scores",
          description: "What affects your credit score and how to improve it",
          category: "debt",
          difficulty: "intermediate",
          content: "Your credit score ranges from 300-850 and affects loan rates. Key factors: payment history (35%), credit utilization (30%), length of credit history (15%), new credit (10%), and credit mix (10%). Pay bills on time and keep credit card balances below 30% of limits.",
          estimatedMinutes: 20,
          points: 100,
          order: 3,
        },
      ];
      
      for (const lesson of lessons) {
        await ctx.db.insert("lessons", lesson);
      }
    }

      console.log("Mock data creation complete");
      return { success: true, message: "Mock data created successfully!" };
    } catch (error: any) {
      console.error("Error in seedAllMockData:", error);
      return { success: false, message: error.message || "Failed to create mock data" };
    }
  },
});

// Clear all user data
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getUserId(ctx);
      console.log("Clearing data for user:", userId);
      
      // Delete all user data
      const tables = [
        "transactions",
        "accounts",
        "categories",
        "goals",
        "achievements",
        "savingsJars",
        "moodLogs",
        "bankConnections",
        "userLessons",
        "challenges",
      ];
      
      for (const table of tables) {
        const items = await ctx.db
          .query(table as any)
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect();
        
        console.log(`Deleting ${items.length} items from ${table}`);
        for (const item of items) {
          await ctx.db.delete(item._id);
        }
      }
      
      // Reset user progress
      const progress = await ctx.db
        .query("userProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
      
      if (progress) {
        console.log("Resetting user progress");
        await ctx.db.patch(progress._id, {
          totalPoints: 0,
          level: 1,
          transactionCount: 0,
          savingsStreak: 0,
          lastActivityDate: Date.now(),
        });
      }
      
      console.log("Data clear complete");
      return { success: true, message: "All data cleared successfully!" };
    } catch (error: any) {
      console.error("Error in clearAllData:", error);
      return { success: false, message: error.message || "Failed to clear data" };
    }
  },
});