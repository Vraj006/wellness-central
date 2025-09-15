import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const addBiometric = mutation({
  args: {
    type: v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("weight"),
      v.literal("bmi"),
      v.literal("temperature"),
    ),
    value: v.number(),
    systolic: v.optional(v.number()),
    diastolic: v.optional(v.number()),
    unit: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("biometrics", {
      userId: user._id,
      type: args.type,
      value: args.value,
      systolic: args.systolic,
      diastolic: args.diastolic,
      unit: args.unit,
      recordedAt: Date.now(),
      notes: args.notes,
    });
  },
});

export const getUserBiometrics = query({
  args: {
    userId: v.optional(v.id("users")),
    type: v.optional(v.union(
      v.literal("glucose"),
      v.literal("bloodPressure"),
      v.literal("heartRate"),
      v.literal("weight"),
      v.literal("bmi"),
      v.literal("temperature"),
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const userId = args.userId || user._id;
    
    // If requesting another user's data, check if current user is a provider
    if (userId !== user._id && user.role !== "provider") {
      throw new Error("Not authorized to view this data");
    }

    let query = ctx.db.query("biometrics").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.type) {
      query = ctx.db.query("biometrics").withIndex("by_user_and_type", (q) => 
        q.eq("userId", userId).eq("type", args.type!)
      );
    }

    const biometrics = await query
      .order("desc")
      .take(args.limit || 50);

    return biometrics;
  },
});

export const getLatestBiometrics = query({
  args: {
    userId: v.optional(v.id("users")),
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

    const types = ["glucose", "bloodPressure", "heartRate", "weight", "bmi", "temperature"];
    const latest: Record<string, any> = {};

    for (const type of types) {
      const biometric = await ctx.db
        .query("biometrics")
        .withIndex("by_user_and_type", (q) => q.eq("userId", userId).eq("type", type as any))
        .order("desc")
        .first();
      
      if (biometric) {
        latest[type] = biometric;
      }
    }

    return latest;
  },
});
