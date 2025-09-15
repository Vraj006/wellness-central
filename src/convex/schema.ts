import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  PROVIDER: "provider",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.PATIENT),
  v.literal(ROLES.PROVIDER),
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
      
      // Additional profile fields
      dateOfBirth: v.optional(v.string()),
      phone: v.optional(v.string()),
      address: v.optional(v.string()),
      emergencyContact: v.optional(v.string()),
      medicalHistory: v.optional(v.array(v.string())),
      currentMedications: v.optional(v.array(v.string())),
      allergies: v.optional(v.array(v.string())),
      lifestyle: v.optional(v.object({
        activityLevel: v.string(),
        smokingStatus: v.string(),
        alcoholConsumption: v.string(),
        dietaryPreferences: v.array(v.string()),
      })),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Biometric data for patients
    biometrics: defineTable({
      userId: v.id("users"),
      type: v.union(
        v.literal("glucose"),
        v.literal("bloodPressure"),
        v.literal("heartRate"),
        v.literal("weight"),
        v.literal("bmi"),
        v.literal("temperature"),
      ),
      value: v.number(),
      systolic: v.optional(v.number()), // for blood pressure
      diastolic: v.optional(v.number()), // for blood pressure
      unit: v.string(),
      recordedAt: v.number(),
      notes: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_type", ["userId", "type"])
      .index("by_user_type_and_date", ["userId", "type", "recordedAt"]),

    // Wellness recommendations
    recommendations: defineTable({
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
      explanation: v.string(), // AI explanation for why this recommendation
      completed: v.optional(v.boolean()),
      dueDate: v.optional(v.number()),
      createdBy: v.optional(v.id("users")), // provider who created it
    })
      .index("by_user", ["userId"])
      .index("by_user_and_type", ["userId", "type"])
      .index("by_priority", ["priority"]),

    // Health risk assessments
    riskAssessments: defineTable({
      userId: v.id("users"),
      riskType: v.string(), // e.g., "diabetes", "hypertension", "cardiovascular"
      riskLevel: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      score: v.number(), // 0-100 risk score
      factors: v.array(v.string()), // contributing risk factors
      recommendations: v.array(v.string()),
      assessedBy: v.optional(v.id("users")), // provider who assessed
      assessedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_risk_level", ["riskLevel"]),

    // Provider-patient relationships
    patientProviders: defineTable({
      patientId: v.id("users"),
      providerId: v.id("users"),
      relationship: v.string(), // "primary", "specialist", "consultant"
      active: v.boolean(),
    })
      .index("by_patient", ["patientId"])
      .index("by_provider", ["providerId"])
      .index("by_patient_and_provider", ["patientId", "providerId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;