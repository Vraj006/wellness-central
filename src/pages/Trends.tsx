import { Sidebar } from "@/components/Sidebar";
import { BiometricChart } from "@/components/BiometricChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";

export default function TrendsPage() {
  const { user, isLoading } = useAuth();
  const biometrics = useQuery(api.biometrics.getUserBiometrics, !isLoading && user ? {} : "skip");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Trends</h1>
          {biometrics && biometrics.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <BiometricChart data={biometrics} type="glucose" title="Blood Glucose" color="#3b82f6" />
              <BiometricChart data={biometrics} type="bloodPressure" title="Blood Pressure" color="#ef4444" />
            </div>
          ) : (
            <Card><CardHeader><CardTitle>No data yet</CardTitle></CardHeader><CardContent>Add some biometrics to see trends.</CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
}
