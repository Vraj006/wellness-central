import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getProviderPatients = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "provider") {
      throw new Error("Not authorized - provider access required");
    }

    // Get all patient-provider relationships for this provider
    const relationships = await ctx.db
      .query("patientProviders")
      .withIndex("by_provider", (q) => q.eq("providerId", user._id))
      .filter((q) => q.eq(q.field("active"), true))
      .collect();

    // Get patient details
    const patients = await Promise.all(
      relationships.map(async (rel) => {
        const patient = await ctx.db.get(rel.patientId);
        return {
          ...patient,
          relationship: rel.relationship,
        };
      })
    );

    return patients.filter(Boolean);
  },
});

export const getPatientSummary = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "provider") {
      throw new Error("Not authorized - provider access required");
    }

    // Verify provider has access to this patient
    const relationship = await ctx.db
      .query("patientProviders")
      .withIndex("by_patient_and_provider", (q) => 
        q.eq("patientId", args.patientId).eq("providerId", user._id)
      )
      .filter((q) => q.eq(q.field("active"), true))
      .first();

    if (!relationship) {
      throw new Error("Not authorized to view this patient");
    }

    const patient = await ctx.db.get(args.patientId);
    
    // Get latest biometrics
    const latestBiometrics = await ctx.db
      .query("biometrics")
      .withIndex("by_user", (q) => q.eq("userId", args.patientId))
      .order("desc")
      .take(10);

    // Get recent recommendations
    const recommendations = await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", args.patientId))
      .order("desc")
      .take(5);

    // Get risk assessments
    const riskAssessments = await ctx.db
      .query("riskAssessments")
      .withIndex("by_user", (q) => q.eq("userId", args.patientId))
      .order("desc")
      .take(3);

    return {
      patient,
      latestBiometrics,
      recommendations,
      riskAssessments,
    };
  },
});
