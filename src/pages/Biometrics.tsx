import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { BiometricChart } from "@/components/BiometricChart";

export default function BiometricsPage() {
  const { user, isLoading } = useAuth();
  const addBiometric = useMutation(api.biometrics.addBiometric);
  const biometrics = useQuery(api.biometrics.getUserBiometrics, !isLoading && user ? {} : "skip");
  const [type, setType] = useState<"glucose"|"bloodPressure"|"heartRate"|"weight"|"bmi"|"temperature">("glucose");
  const [value, setValue] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [unit, setUnit] = useState("mg/dL");

  const handleAdd = async () => {
    try {
      await addBiometric({
        type,
        value: Number(value),
        systolic: systolic ? Number(systolic) : undefined,
        diastolic: diastolic ? Number(diastolic) : undefined,
        unit,
      });
      setValue(""); setSystolic(""); setDiastolic("");
      toast.success("Biometric added");
    } catch {
      toast.error("Failed to add biometric");
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          <motion.h1 initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="text-2xl font-bold">
            Biometrics
          </motion.h1>

          <Card>
            <CardHeader>
              <CardTitle>Add Reading</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Select value={type} onValueChange={(v)=>setType(v as any)}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
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
              <Input placeholder="Value" value={value} onChange={(e)=>setValue(e.target.value)} />
              {type==="bloodPressure" && (
                <>
                  <Input placeholder="Systolic" value={systolic} onChange={(e)=>setSystolic(e.target.value)} />
                  <Input placeholder="Diastolic" value={diastolic} onChange={(e)=>setDiastolic(e.target.value)} />
                </>
              )}
              <Input placeholder="Unit" value={unit} onChange={(e)=>setUnit(e.target.value)} />
              <Button onClick={handleAdd}>Save</Button>
            </CardContent>
          </Card>

          {biometrics && biometrics.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <BiometricChart data={biometrics} type="glucose" title="Blood Glucose" color="#3b82f6" />
              <BiometricChart data={biometrics} type="bloodPressure" title="Blood Pressure" color="#ef4444" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
