// src/hooks/useRecommendation.ts
import { useState } from "react";

export function useRecommendation() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const getRecommendation = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setRecommendation(json.recommendation || "No recommendation");
    } catch (e) {
      console.error(e);
      setRecommendation("Error fetching recommendation");
    } finally {
      setLoading(false);
    }
  };

  return { getRecommendation, recommendation, loading };
}
