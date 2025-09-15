import { Sidebar } from "@/components/Sidebar";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";

export default function RecommendationsPage() {
  const { user, isLoading } = useAuth();
  const recommendations = useQuery(api.recommendations.getUserRecommendations, !isLoading && user ? {} : "skip");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Recommendations</h1>
          {recommendations && recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <RecommendationCard key={rec._id} recommendation={rec} />
              ))}
            </div>
          ) : (
            <Card><CardHeader><CardTitle>No recommendations</CardTitle></CardHeader><CardContent>Check back later.</CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
}
