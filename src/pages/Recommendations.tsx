// src/pages/recommendations.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRecommendation } from "@/hooks/useRecommendation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router";

export default function RecommendationsPage() {
  const [form, setForm] = useState<any>({
    HR: 72,
    weight: 70,
    bmi: 22.5,
    exercise: 150,
    sleep: 7,
    diet: "balanced",
    stress: 5,
    steps: 8000,
    airquality: "good",
  });

  const location = useLocation();
  const navState = location.state as any;
  const incomingPrediction = navState?.prediction;
  const incomingForm = navState?.form;

  const { getRecommendation, recommendation, loading } = useRecommendation();

  // Prepare a user-friendly prediction string
  const predictionText = useMemo(() => {
    if (!incomingPrediction) return null;
    if (typeof incomingPrediction === "string") return incomingPrediction;
    if (incomingPrediction?.prediction) return String(incomingPrediction.prediction);
    return JSON.stringify(incomingPrediction);
  }, [incomingPrediction]);

  useEffect(() => {
    if (incomingForm) {
      // Normalize and auto-trigger recommendation using provided form
      setForm((prev: any) => ({ ...prev, ...incomingForm }));
      getRecommendation(incomingForm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingForm]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Health Recommendations</h1>

      {predictionText && (
        <Card>
          <CardHeader>
            <CardTitle>Model Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap">{predictionText}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Input Your Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(form).map((key) => (
            <div key={key} className="flex justify-between items-center">
              <label className="capitalize">{key}</label>
              <input
                type="text"
                className="border p-1 rounded"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={() => getRecommendation(form)} disabled={loading}>
            {loading ? "Loading..." : "Get Recommendation"}
          </Button>
        </CardContent>
      </Card>

      {recommendation && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recommendation</CardTitle>
          </CardHeader>
          <CardContent>{recommendation}</CardContent>
        </Card>
      )}
    </div>
  );
}
