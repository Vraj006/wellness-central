import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HealthMetricsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Health Metrics</h1>
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent>Coming soon — aggregated health metrics and insights.</CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
