import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, user, signIn } = useAuth();
  const ensureRole = useMutation(api.users.ensureRole);
  const setNameMutation = useMutation(api.users.setName);
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add: auth mode selector (UI only; both paths use the same email OTP)
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  // Add: role selection state for both login and registration
  const [selectedRole, setSelectedRole] = useState<"patient" | "provider">("patient");
  // Add: track that we've ensured a role to avoid repeated calls
  const [roleEnsured, setRoleEnsured] = useState(false);
  // Add: prevent double navigation and ensure a single redirect path
  const [hasNavigated, setHasNavigated] = useState(false);

  // Persist selected role across re-mounts (especially after OTP sign-in)
  useEffect(() => {
    const savedRole = sessionStorage.getItem("auth_selected_role");
    if (savedRole === "patient" || savedRole === "provider") {
      setSelectedRole(savedRole);
    }
  }, []);

  // Ensure a default role exists when authenticated but missing role (avoid loops)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !user.role && !roleEnsured) {
      (async () => {
        try {
          await ensureRole({ defaultRole: "patient" });
          setRoleEnsured(true);
        } catch (e) {
          // do not block UX; stay on auth until role exists or user retries
          console.error("ensureRole on mount failed:", e);
        }
      })();
    }
  }, [authLoading, isAuthenticated, user, roleEnsured, ensureRole]);

  // Redirect ONLY when role is present to prevent bouncing
  useEffect(() => {
    if (hasNavigated) return;
    if (!authLoading && isAuthenticated && user) {
      // If logging in, respect the selected role for redirect without changing stored role
      if (authMode === "login") {
        const dashboard = selectedRole === "provider" ? "/dashboard/provider" : "/dashboard/patient";
        navigate(dashboard);
        setHasNavigated(true);
        return;
      }
      // Default path: respect user's stored role (e.g., after registration)
      if (user.role) {
        const dashboard = user.role === "provider" ? "/dashboard/provider" : "/dashboard/patient";
        navigate(dashboard);
        setHasNavigated(true);
      }
    }
  }, [authLoading, isAuthenticated, user, authMode, selectedRole, navigate, hasNavigated]);

  // Show a minimal loader while auth state initializes to prevent flicker
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      // Persist role choice for login so it's available after OTP
      sessionStorage.setItem("auth_selected_role", selectedRole);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      // Registration: persist role + name
      if (authMode === "register") {
        await ensureRole({ defaultRole: selectedRole });
        if (name.trim().length > 0) {
          try {
            await setNameMutation({ name: name.trim() });
          } catch (e) {
            console.error("Failed to save name:", e);
          }
        }
      } else {
        // Login: Immediately route based on selectedRole to avoid any race conditions
        const roleFromStorage = sessionStorage.getItem("auth_selected_role");
        const roleToUse = roleFromStorage === "provider" ? "provider" : "patient";
        const dashboard = roleToUse === "provider" ? "/dashboard/provider" : "/dashboard/patient";
        if (!hasNavigated) {
          navigate(dashboard);
          setHasNavigated(true);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -30, y: -30 }}
          animate={{ opacity: 1, x: [0, -8, 0], y: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-3xl rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, x: 30, y: 30 }}
          animate={{ opacity: 1, x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-chart-2/20 blur-3xl rounded-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,transparent_1px),radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          {/* Animate the card in */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card className="min-w-[350px] pb-0 border border-border/60 shadow-md backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-white/5">
              {step === "signIn" ? (
                <>
                  <CardHeader className="text-center">
                    <div className="flex justify-center">
                      <img
                        src="./logo.svg"
                        alt="Lock Icon"
                        width={64}
                        height={64}
                        className="rounded-lg mb-4 mt-4 cursor-pointer"
                        onClick={() => navigate("/")}
                      />
                    </div>
                    <CardTitle className="text-xl">
                      {authMode === "login" ? "Login" : "Create your account"}
                    </CardTitle>
                    <CardDescription>
                      Enter your email to receive a verification code
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleEmailSubmit}>
                    <CardContent>
                      {/* Login / Register selector */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Button
                          type="button"
                          size="sm"
                          variant={authMode === "login" ? "default" : "outline"}
                          onClick={() => setAuthMode("login")}
                          disabled={isLoading}
                        >
                          Login
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={authMode === "register" ? "default" : "outline"}
                          onClick={() => setAuthMode("register")}
                          disabled={isLoading}
                        >
                          Register
                        </Button>
                      </div>
                      <div className="space-y-2 mb-4">
                        {authMode === "register" && (
                          <>
                            <div className="relative">
                              <Input
                                name="name"
                                placeholder="Your full name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                                required
                              />
                            </div>
                          </>
                        )}
                        {/* Role selector (Shown for both Login and Register) */}
                        <div className="relative">
                          <Select
                            value={selectedRole}
                            onValueChange={(val) => {
                              const role = val as "patient" | "provider";
                              setSelectedRole(role);
                              sessionStorage.setItem("auth_selected_role", role);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="patient">Patient</SelectItem>
                              <SelectItem value="provider">Provider</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            className="pl-9"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="outline"
                          size="icon"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                      )}
                    </CardContent>
                  </form>
                </>
              ) : (
                <>
                  <CardHeader className="text-center mt-4">
                    <CardTitle>Check your email</CardTitle>
                    <CardDescription>
                      We've sent a code to {step.email}
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleOtpSubmit}>
                    <CardContent className="pb-4">
                      <input type="hidden" name="email" value={step.email} />
                      <input type="hidden" name="code" value={otp} />

                      <div className="flex justify-center">
                        <InputOTP
                          value={otp}
                          onChange={setOtp}
                          maxLength={6}
                          disabled={isLoading}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                              // Find the closest form and submit it
                              const form = (e.target as HTMLElement).closest("form");
                              if (form) {
                                form.requestSubmit();
                              }
                            }
                          }}
                        >
                          <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, index) => (
                              <InputOTPSlot key={index} index={index} />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-red-500 text-center">
                          {error}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground text-center mt-4">
                        Didn't receive a code?{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setStep("signIn")}
                        >
                          Try again
                        </Button>
                      </p>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || otp.length !== 6}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify code
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Use different email
                      </Button>
                    </CardFooter>
                  </form>
                </>
              )}

              <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
                Secured by{" "}
                <a
                  href="https://vly.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary transition-colors"
                >
                  vly.ai
                </a>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}