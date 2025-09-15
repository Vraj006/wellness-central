import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";

export default function DebugRolePage() {
  const { isLoading, user: authUser } = useAuth();
  const userDoc = useQuery(api.users.currentUser, {});

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold">Debug: Current User Role</h1>

          <Card>
            <CardHeader>
              <CardTitle>Auth Hook</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
{JSON.stringify({ isLoading, authUser }, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database User Document</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
{JSON.stringify(userDoc, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 