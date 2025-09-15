import { BiometricChart } from "@/components/BiometricChart";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Activity, Heart, Plus, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";

export default function PatientDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Add guarded query enable flag
  const enabled = !isLoading && !!user && user.role === "patient";

  // Guard queries so they only run when authenticated and role-appropriate
  const biometrics = useQuery(api.biometrics.getUserBiometrics, enabled ? {} : "skip");
  const latestBiometrics = useQuery(api.biometrics.getLatestBiometrics, enabled ? {} : "skip");
  const recommendations = useQuery(api.recommendations.getUserRecommendations, enabled ? {} : "skip");

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== "patient") {
    navigate("/auth");
    return null;
  }

  const activeRecommendations = recommendations?.filter(r => !r.completed) || [];
  const completedCount = recommendations?.filter(r => r.completed).length || 0;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 hidden lg:block" />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name || "Patient"}</h1>
            <p className="text-muted-foreground">Here's your wellness overview for today</p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Recommendations</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeRecommendations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedCount} completed this week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Latest Glucose</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestBiometrics?.glucose?.value || "--"} 
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {latestBiometrics?.glucose?.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Normal range</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestBiometrics?.bloodPressure ? 
                      `${latestBiometrics.bloodPressure.systolic}/${latestBiometrics.bloodPressure.diastolic}` 
                      : "--"
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Optimal</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {latestBiometrics?.heartRate?.value || "--"}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {latestBiometrics?.heartRate?.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Resting</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts and Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Biometric Charts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Health Trends</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/biometrics")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reading
                </Button>
              </div>
              
              {biometrics && biometrics.length > 0 ? (
                <div className="grid gap-4">
                  <BiometricChart
                    data={biometrics}
                    type="glucose"
                    title="Blood Glucose"
                    color="#3b82f6"
                  />
                  <BiometricChart
                    data={biometrics}
                    type="bloodPressure"
                    title="Blood Pressure"
                    color="#ef4444"
                  />
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No biometric data yet</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      Start tracking your health by adding your first biometric reading
                    </p>
                    <Button onClick={() => navigate("/biometrics")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Reading
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Today's Recommendations</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/recommendations")}
                >
                  View All
                </Button>
              </div>
              
              {activeRecommendations.length > 0 ? (
                <div className="space-y-4">
                  {activeRecommendations.slice(0, 3).map((recommendation) => (
                    <RecommendationCard
                      key={recommendation._id}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                    <p className="text-muted-foreground text-center">
                      You have no active recommendations. Keep up the great work!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}