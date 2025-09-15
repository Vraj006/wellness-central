import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PatientInputPage() {
  const { user, isLoading } = useAuth();
  const upsert = useMutation(api.patientInputs.upsertForCurrentUser);
  const existing = useQuery(api.patientInputs.getForCurrentUser, !isLoading && user ? {} : "skip");

  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [medications, setMedications] = useState("");
  const [exercise, setExercise] = useState("");
  const [sleep, setSleep] = useState("");
  const [diet, setDiet] = useState("");
  const [stress, setStress] = useState("");
  const [activity, setActivity] = useState("");
  const [env, setEnv] = useState("");

  useEffect(() => {
    if (existing) {
      setName(existing.personalInfo?.name || "");
      setAge(existing.personalInfo?.age?.toString() || "");
      setGender(existing.personalInfo?.gender || "");
      setLocation(existing.personalInfo?.location || "");
      setMedicalHistory((existing.medicalHistory || []).join(", "));
      setMedications((existing.medications || []).map(m => `${m.name}${m.dosage?` (${m.dosage})`:``}`).join("; "));
      setExercise(existing.lifestyle?.exerciseRoutines || "");
      setSleep(existing.lifestyle?.sleepPatterns || "");
      setDiet(existing.lifestyle?.dietHabits || "");
      setStress(existing.lifestyle?.stressLevels || "");
      setActivity(existing.activityData?.wearableInputs || "");
      setEnv(existing.environmentalFactors?.other || "");
    }
  }, [existing]);

  const handleSave = async () => {
    try {
      await upsert({
        personalInfo: {
          name: name || undefined,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          location: location || undefined,
        },
        medicalHistory: medicalHistory ? medicalHistory.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        medications: medications
          ? medications.split(";").map(s => s.trim()).filter(Boolean).map((x) => ({ name: x }))
          : undefined,
        lifestyle: {
          exerciseRoutines: exercise || undefined,
          sleepPatterns: sleep || undefined,
          dietHabits: diet || undefined,
          stressLevels: stress || undefined,
        },
        activityData: {
          wearableInputs: activity || undefined,
        },
        environmentalFactors: {
          other: env || undefined,
        },
      });
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Patient Intake</h1>

          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
              <Input placeholder="Age" value={age} onChange={(e)=>setAge(e.target.value)} />
              <Input placeholder="Gender" value={gender} onChange={(e)=>setGender(e.target.value)} />
              <Input placeholder="Location" value={location} onChange={(e)=>setLocation(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Medical History</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Comma separated list (e.g., Diabetes, Asthma)" value={medicalHistory} onChange={(e)=>setMedicalHistory(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
            <CardContent>
              <Textarea placeholder="Semicolon separated (e.g., Metformin 500mg; Atorvastatin 20mg)" value={medications} onChange={(e)=>setMedications(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Lifestyle</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="Exercise routines" value={exercise} onChange={(e)=>setExercise(e.target.value)} />
              <Input placeholder="Sleep patterns" value={sleep} onChange={(e)=>setSleep(e.target.value)} />
              <Input placeholder="Diet habits" value={diet} onChange={(e)=>setDiet(e.target.value)} />
              <Input placeholder="Stress levels" value={stress} onChange={(e)=>setStress(e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Activity & Environment</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              <Input placeholder="Wearable inputs / activity notes" value={activity} onChange={(e)=>setActivity(e.target.value)} />
              <Input placeholder="Environmental factors" value={env} onChange={(e)=>setEnv(e.target.value)} />
            </CardContent>
          </Card>

          <Button onClick={handleSave}>Save</Button>
        </div>
      </main>
    </div>
  );
}
