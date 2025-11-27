import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    accounts: defineTable({
      userId: v.id("users"),
      name: v.string(),
      type: v.string(), // 'bank', 'cash', 'credit', etc.
      initialBalance: v.number(),
    }).index("by_user", ["userId"]),

    categories: defineTable({
      userId: v.id("users"),
      name: v.string(),
      type: v.string(), // 'income', 'expense'
      color: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    transactions: defineTable({
      userId: v.id("users"),
      accountId: v.id("accounts"),
      categoryId: v.id("categories"),
      amount: v.number(),
      type: v.string(), // 'income', 'expense'
      date: v.number(), // timestamp
      note: v.optional(v.string()),
      receiptId: v.optional(v.id("_storage")), // File storage ID for receipt
    })
      .index("by_user", ["userId"])
      .index("by_account", ["accountId"])
      .index("by_user_and_date", ["userId", "date"]),

    goals: defineTable({
      userId: v.id("users"),
      name: v.string(),
      targetAmount: v.number(),
      currentAmount: v.number(),
      deadline: v.number(), // timestamp
      status: v.string(), // 'active', 'completed', 'failed'
      category: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    achievements: defineTable({
      userId: v.id("users"),
      type: v.string(), // 'first_transaction', 'savings_streak', 'budget_master', etc.
      title: v.string(),
      description: v.string(),
      unlockedAt: v.number(), // timestamp
      points: v.number(),
    }).index("by_user", ["userId"]),

    userProgress: defineTable({
      userId: v.id("users"),
      totalPoints: v.number(),
      level: v.number(),
      savingsStreak: v.number(), // consecutive months with positive savings
      transactionCount: v.number(),
      lastActivityDate: v.number(),
    }).index("by_user", ["userId"]),

    bankConnections: defineTable({
      userId: v.id("users"),
      bankName: v.string(),
      accountNumber: v.string(),
      provider: v.string(), // 'upi', 'setu', 'razorpayx', etc.
      status: v.string(), // 'connected', 'disconnected', 'error'
      lastSyncedAt: v.optional(v.number()),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;