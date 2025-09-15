import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router";

export default function PatientFormPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Patient intake mutations/queries
  const upsert = useMutation(api.patientInputs.upsertForCurrentUser);
  const existing = useQuery(
    api.patientInputs.getForCurrentUser,
    !isLoading && user ? {} : "skip"
  );

  // Biometric mutations
  const addBiometric = useMutation(api.biometrics.addBiometric);

  // Patient intake state
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

  // Biometric units per type
  const UNIT_OPTIONS: Record<
    "glucose" | "bloodPressure" | "heartRate" | "weight" | "bmi" | "temperature",
    string[]
  > = {
    glucose: ["mg/dL", "mmol/L"],
    bloodPressure: ["mmHg"],
    heartRate: ["bpm"],
    weight: ["kg", "lb"],
    bmi: ["kg/m²"],
    temperature: ["°C", "°F"],
  };
  const DEFAULT_UNIT: Record<
    "glucose" | "bloodPressure" | "heartRate" | "weight" | "bmi" | "temperature",
    string
  > = {
    glucose: "mg/dL",
    bloodPressure: "mmHg",
    heartRate: "bpm",
    weight: "kg",
    bmi: "kg/m²",
    temperature: "°C",
  };

  // Biometric input state
  const [bType, setBType] = useState<
    "glucose" | "bloodPressure" | "heartRate" | "weight" | "bmi" | "temperature"
  >("glucose");
  const [bValue, setBValue] = useState("");
  const [bSystolic, setBSystolic] = useState("");
  const [bDiastolic, setBDiastolic] = useState("");
  const [bUnit, setBUnit] = useState(DEFAULT_UNIT["glucose"]);

  useEffect(() => {
    if (existing) {
      setName(existing.personalInfo?.name || "");
      setAge(existing.personalInfo?.age?.toString() || "");
      setGender(existing.personalInfo?.gender || "");
      setLocation(existing.personalInfo?.location || "");
      setMedicalHistory((existing.medicalHistory || []).join(", "));
      setMedications(
        (existing.medications || [])
          .map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ``}`)
          .join("; ")
      );
      setExercise(existing.lifestyle?.exerciseRoutines || "");
      setSleep(existing.lifestyle?.sleepPatterns || "");
      setDiet(existing.lifestyle?.dietHabits || "");
      setStress(existing.lifestyle?.stressLevels || "");
      setActivity(existing.activityData?.wearableInputs || "");
      setEnv(existing.environmentalFactors?.other || "");
    }
  }, [existing]);

  async function getPrediction(payload: any) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", payload);
      return response.data; // expect shape with prediction
    } catch (error) {
      return { error: true, message: "Prediction service error" };
    }
  }

  const handleSavePatient = async () => {
    try {
      const payload = {
        personalInfo: {
          name: name || undefined,
          age: age ? Number(age) : undefined,
          gender: gender || undefined,
          location: location || undefined,
        },
        medicalHistory: medicalHistory
          ? medicalHistory
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        medications: medications
          ? medications
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((x) => ({ name: x }))
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
      } as const;

      console.log("Patient Form Payload:", payload);

      await upsert(payload);

      // Build prediction input from current form values
      const predictionInput = {
        Age: age ? Number(age) : undefined,
        Gender: gender,
        BMI: undefined, // optional: you may compute BMI if weight/height exists
        Exercise: exercise,
        Diet: diet,
        Stress: stress,
        Glucose: undefined,
        Weight: undefined,
        BP_sys: bSystolic ? Number(bSystolic) : undefined,
        BP_dia: bDiastolic ? Number(bDiastolic) : undefined,
        HR: undefined,
        AirQuality: undefined,
        Sleep: sleep,
        Steps: activity || undefined,
        disease: "P_T2D",
      };

      const prediction = await getPrediction(predictionInput);

      navigate("/recommendations", { state: { prediction, form: predictionInput } });
      toast.success("Patient info saved");
    } catch {
      toast.error("Failed to save patient info");
    }
  };

  const handleAddBiometric = async () => {
    try {
      await addBiometric({
        type: bType,
        value: Number(bValue),
        systolic: bSystolic ? Number(bSystolic) : undefined,
        diastolic: bDiastolic ? Number(bDiastolic) : undefined,
        unit: bUnit,
      });
      setBValue("");
      setBSystolic("");
      setBDiastolic("");
      toast.success("Biometric added");
    } catch {
      toast.error("Failed to add biometric");
    }
  };

  const handleUploadBiometricCsv = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length === 0) {
        toast.error("CSV is empty");
        return;
      }

      // Expect header: type,value,unit,systolic,diastolic
      const [header, ...rows] = lines;
      const normalizedHeader = header.toLowerCase().replace(/\s+/g, "");
      const expected = "type,value,unit,systolic,diastolic";
      if (normalizedHeader !== expected) {
        toast.error(
          "Invalid CSV header. Use: type,value,unit,systolic,diastolic"
        );
        return;
      }

      let successCount = 0;
      for (const row of rows) {
        const parts = row.split(",");
        if (parts.length < 3) continue;
        const [t, v, u, s, d] = parts.map((p) => p.trim());
        const parsedType = (
          [
            "glucose",
            "bloodPressure",
            "heartRate",
            "weight",
            "bmi",
            "temperature",
          ] as const
        ).includes(t as any)
          ? (t as
              | "glucose"
              | "bloodPressure"
              | "heartRate"
              | "weight"
              | "bmi"
              | "temperature")
          : null;
        const parsedValue = Number(v);
        if (!parsedType || Number.isNaN(parsedValue)) continue;

        const fallbackUnit = DEFAULT_UNIT[parsedType];
        const unitFinal = u || fallbackUnit;

        try {
          // eslint-disable-next-line no-await-in-loop
          await addBiometric({
            type: parsedType,
            value: parsedValue,
            unit: unitFinal,
            systolic: s ? Number(s) : undefined,
            diastolic: d ? Number(d) : undefined,
          });
          successCount += 1;
        } catch {
          // Skip row on error
        }
      }

      if (successCount > 0) {
        toast.success(`Imported ${successCount} biometrics`);
      } else {
        toast.error("No biometrics imported. Check your CSV values.");
      }
    } catch {
      toast.error("Failed to read CSV file");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Patient Form</h1>
{/* Biometric Inputs */}
<Card>
            <CardHeader>
              <CardTitle>Add Biometric Reading</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Select value={bType} onValueChange={(v) => { setBType(v as any); setBUnit(DEFAULT_UNIT[v as keyof typeof DEFAULT_UNIT]); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="glucose">Glucose</SelectItem>
                    <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                    <SelectItem value="heartRate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="bmi">BMI</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                placeholder="Value"
                value={bValue}
                onChange={(e) => setBValue(e.target.value)}
              />
              {bType === "bloodPressure" && (
                <>
                  <Input
                    placeholder="Systolic"
                    value={bSystolic}
                    onChange={(e) => setBSystolic(e.target.value)}
                  />
                  <Input
                    placeholder="Diastolic"
                    value={bDiastolic}
                    onChange={(e) => setBDiastolic(e.target.value)}
                  />
                </>
              )}
              <div>
                <Select value={bUnit} onValueChange={(u) => setBUnit(u)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS[bType].map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBiometric}>Save Reading</Button>
            </CardContent>
          </Card>

          {/* Patient Intake */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
              <Input
                placeholder="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Comma separated list (e.g., Diabetes, Asthma)"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Semicolon separated (e.g., Metformin 500mg; Atorvastatin 20mg)"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input
                placeholder="Exercise routines"
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
              />
              <Input
                placeholder="Sleep patterns"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
              />
              <Input
                placeholder="Diet habits"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              />
              <Input
                placeholder="Stress levels"
                value={stress}
                onChange={(e) => setStress(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity & Environment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Input
                placeholder="Wearable inputs / activity notes"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
              />
              <Input
                placeholder="Environmental factors"
                value={env}
                onChange={(e) => setEnv(e.target.value)}
              />
              <div>
                <Button onClick={handleSavePatient}>Save Patient Info</Button>
              </div>
            </CardContent>
          </Card>

          
          {/* <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Biometrics (CSV)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Expected columns: type,value,unit,systolic,diastolic
              </p>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadBiometricCsv(file);
                }}
              />
            </CardContent>
          </Card> */}
        </div>
      </main>
    </div>
  );
} 