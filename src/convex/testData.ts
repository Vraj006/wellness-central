import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const seedTestData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Add sample biometric data
    const biometricData = [
      { type: "glucose" as const, value: 95, unit: "mg/dL" },
      { type: "bloodPressure" as const, value: 120, systolic: 120, diastolic: 80, unit: "mmHg" },
      { type: "heartRate" as const, value: 72, unit: "bpm" },
      { type: "weight" as const, value: 70, unit: "kg" },
      { type: "bmi" as const, value: 22.5, unit: "kg/m²" },
    ];

    for (const data of biometricData) {
      await ctx.db.insert("biometrics", {
        userId: user._id,
        type: data.type,
        value: data.value,
        systolic: data.systolic,
        diastolic: data.diastolic,
        unit: data.unit,
        recordedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last week
      });
    }

    // Add sample recommendations
    const recommendations = [
      {
        type: "diet" as const,
        title: "Increase Fiber Intake",
        description: "Add more vegetables and whole grains to your daily meals",
        priority: "medium" as const,
        explanation: "Based on your recent glucose levels, increasing fiber can help stabilize blood sugar throughout the day.",
      },
      {
        type: "exercise" as const,
        title: "30-Minute Daily Walk",
        description: "Take a brisk 30-minute walk after dinner",
        priority: "high" as const,
        explanation: "Regular cardio exercise will help improve your cardiovascular health and maintain healthy blood pressure.",
      },
      {
        type: "medication" as const,
        title: "Take Vitamin D Supplement",
        description: "Take 1000 IU vitamin D daily with breakfast",
        priority: "low" as const,
        explanation: "Your recent lab results show slightly low vitamin D levels, which can affect bone health and immune function.",
      },
    ];

    for (const rec of recommendations) {
      await ctx.db.insert("recommendations", {
        userId: user._id,
        type: rec.type,
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        explanation: rec.explanation,
        completed: false,
      });
    }

    return "Test data seeded successfully";
  },
});
