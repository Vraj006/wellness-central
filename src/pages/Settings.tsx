import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const setName = useMutation(api.users.setName);
  const [name, setNameState] = useState(user?.name || "");

  const handleName = async () => {
    try {
      if (!name.trim()) return toast.error("Name cannot be empty");
      await setName({ name: name.trim() });
      toast.success("Name updated");
    } catch {
      toast.error("Failed to update name");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Settings</h1>

          <Card>
            <CardHeader><CardTitle>Change Username</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Input value={name} onChange={(e)=>setNameState(e.target.value)} placeholder="Your name" />
              <Button onClick={handleName}>Save</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This project uses email OTP for authentication; passwords are not used.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
