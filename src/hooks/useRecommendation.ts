// src/hooks/useRecommendation.ts
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useRecommendation() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const generate = useAction(api.recommendations.generateAiRecommendation);

  const getRecommendation = async (data: any) => {
    setLoading(true);
    try {
      const res = await generate({ input: data });
      setRecommendation(res?.recommendation || "No recommendation");
    } catch (e) {
      console.error(e);
      setRecommendation("Error fetching recommendation");
    } finally {
      setLoading(false);
    }
  };

  return { getRecommendation, recommendation, loading };
}
