// src/pages/recommendations.tsx
"use client";

import { useState } from "react";
import { useRecommendation } from "@/hooks/useRecommendation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const [form, setForm] = useState({
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

  const { getRecommendation, recommendation, loading } = useRecommendation();

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Health Recommendations</h1>

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
                value={form[key as keyof typeof form]}
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
