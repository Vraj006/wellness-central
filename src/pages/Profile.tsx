import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const upsert = useMutation(api.patientInputs.upsertForCurrentUser);
  const existing = useQuery(api.patientInputs.getForCurrentUser, !isLoading && user ? {} : "skip");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    location: "",
  });

  useEffect(() => {
    if (existing) {
      setFormData({
        name: existing.personalInfo?.name || "",
        age: existing.personalInfo?.age?.toString() || "",
        gender: existing.personalInfo?.gender || "",
        location: existing.personalInfo?.location || "",
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await upsert({
        personalInfo: {
          name: formData.name || undefined,
          age: formData.age ? Number(formData.age) : undefined,
          gender: formData.gender || undefined,
          location: formData.location || undefined,
        },
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Basic Info</CardTitle>
              <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {isEditing ? (
                <div className="grid gap-3">
                  <Input
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <Input
                    placeholder="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                  />
                  <Input
                    placeholder="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  />
                  <Input
                    placeholder="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <Button onClick={handleSave}>Save</Button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div>Name: {formData.name || "—"}</div>
                  <div>Age: {formData.age || "—"}</div>
                  <div>Gender: {formData.gender || "—"}</div>
                  <div>Location: {formData.location || "—"}</div>
                  <div>Email: {user?.email || "—"}</div>
                  <div>Role: {user?.role || "—"}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}