import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Card>
            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div>Name: {user?.name || "—"}</div>
              <div>Email: {user?.email || "—"}</div>
              <div>Role: {user?.role || "—"}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
