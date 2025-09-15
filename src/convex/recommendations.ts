import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const createRecommendation = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("diet"),
      v.literal("exercise"),
      v.literal("medication"),
      v.literal("lifestyle"),
    ),
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    explanation: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("recommendations", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      description: args.description,
      priority: args.priority,
      explanation: args.explanation,
      completed: false,
      dueDate: args.dueDate,
      createdBy: user._id,
    });
  },
});

export const getUserRecommendations = query({
  args: {
    userId: v.optional(v.id("users")),
    type: v.optional(v.union(
      v.literal("diet"),
      v.literal("exercise"),
      v.literal("medication"),
      v.literal("lifestyle"),
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const userId = args.userId || user._id;
    
    if (userId !== user._id && user.role !== "provider") {
      throw new Error("Not authorized to view this data");
    }

    let query = ctx.db.query("recommendations").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.type) {
      query = ctx.db.query("recommendations").withIndex("by_user_and_type", (q) => 
        q.eq("userId", userId).eq("type", args.type!)
      );
    }

    return await query.order("desc").collect();
  },
});

export const completeRecommendation = mutation({
  args: {
    recommendationId: v.id("recommendations"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const recommendation = await ctx.db.get(args.recommendationId);
    if (!recommendation) {
      throw new Error("Recommendation not found");
    }

    if (recommendation.userId !== user._id && user.role !== "provider") {
      throw new Error("Not authorized to modify this recommendation");
    }

    await ctx.db.patch(args.recommendationId, {
      completed: true,
    });
  },
});
