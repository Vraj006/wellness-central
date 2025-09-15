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
import { useEffect } from "react";

export default function PatientDashboard() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Add guarded query enable flag
  const enabled = !isLoading && !!user && user.role === "patient";

  // Guard queries so they only run when authenticated and role-appropriate
  const latestBiometrics = useQuery(api.biometrics.getLatestBiometrics, enabled ? {} : "skip");
  const recommendations = useQuery(api.recommendations.getUserRecommendations, enabled ? {} : "skip");

  // Redirect unauthenticated or wrong-role users after render settles
  // to prevent navigation during render warnings and flicker.
  // This replaces the inline navigate() call in render.
  // Add this effect:
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }
      // Only redirect when role is known and not patient
      if (user.role && user.role !== "patient") {
        navigate("/auth", { replace: true });
      }
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== "patient") {
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
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user.name || (user.email ? user.email.split("@")[0] : "User")}
            </h1>
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
            {/* Left Column replaced with Patient Form CTA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Patient Form</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/patient-form")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Open Form
                </Button>
              </div>

              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Manage your details and biometrics</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Use the Patient Form to update personal info and add biometric readings.
                  </p>
                  <Button onClick={() => navigate("/patient-form")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Go to Patient Form
                  </Button>
                </CardContent>
              </Card>
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