// src/pages/api/recommendations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defined in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { HR, weight, bmi, exercise, sleep, diet, stress, steps, airquality } = req.body;

    const prompt = `
You are a health assistant. Based on the following health data, give clear and actionable recommendations:

- Heart Rate: ${HR}
- Weight: ${weight}
- BMI: ${bmi}
- Exercise (minutes/week): ${exercise}
- Sleep (hours/day): ${sleep}
- Diet quality: ${diet}
- Stress level (1-10): ${stress}
- Steps per day: ${steps}
- Air quality: ${airquality}

Provide a personalized health recommendation in 2–3 short bullet points.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // swap with llama model if provider supports
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0].message?.content ?? "No recommendation generated.";

    return res.status(200).json({ recommendation: text });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate recommendation" });
  }
}
