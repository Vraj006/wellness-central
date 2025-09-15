import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import "./types/global.d.ts";
import PatientDashboard from "@/pages/PatientDashboard.tsx";
import ProviderDashboard from "@/pages/ProviderDashboard.tsx";
import BiometricsPage from "@/pages/Biometrics.tsx";
import RecommendationsPage from "@/pages/Recommendations.tsx";
import ProfilePage from "@/pages/Profile.tsx";
import TrendsPage from "@/pages/Trends.tsx";
import SettingsPage from "@/pages/Settings.tsx";
import HealthMetricsPage from "@/pages/HealthMetrics.tsx";
import PatientInputPage from "@/pages/PatientInput.tsx";
import PatientFormPage from "@/pages/PatientForm.tsx";
import DebugRolePage from "@/pages/DebugRole.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard/patient" />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/provider" element={<ProviderDashboard />} />
            <Route path="/biometrics" element={<BiometricsPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/health-metrics" element={<HealthMetricsPage />} />
            <Route path="/patient-intake" element={<PatientInputPage />} />
            <Route path="/patient-form" element={<PatientFormPage />} />
            <Route path="/debug-role" element={<DebugRolePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);