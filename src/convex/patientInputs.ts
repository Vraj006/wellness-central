import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const upsertForCurrentUser = mutation({
  args: {
    personalInfo: v.optional(
      v.object({
        name: v.optional(v.string()),
        age: v.optional(v.number()),
        gender: v.optional(v.string()),
        location: v.optional(v.string()),
      })
    ),
    medicalHistory: v.optional(v.array(v.string())),
    medications: v.optional(
      v.array(
        v.object({
          name: v.string(),
          dosage: v.optional(v.string()),
          frequency: v.optional(v.string()),
          sideEffects: v.optional(v.string()),
        })
      )
    ),
    lifestyle: v.optional(
      v.object({
        exerciseRoutines: v.optional(v.string()),
        sleepPatterns: v.optional(v.string()),
        dietHabits: v.optional(v.string()),
        stressLevels: v.optional(v.string()),
      })
    ),
    activityData: v.optional(
      v.object({
        stepCount: v.optional(v.number()),
        caloriesBurned: v.optional(v.number()),
        wearableInputs: v.optional(v.string()),
      })
    ),
    environmentalFactors: v.optional(
      v.object({
        seasonalAllergies: v.optional(v.string()),
        airQuality: v.optional(v.string()),
        other: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("patientInputs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { ...args });
      return existing._id;
    }
    return await ctx.db.insert("patientInputs", {
      userId: user._id,
      ...args,
    });
  },
});

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    return await ctx.db
      .query("patientInputs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});
