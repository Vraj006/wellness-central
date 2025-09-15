import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Activity, 
  ArrowRight, 
  BarChart3, 
  Heart, 
  Shield, 
  Stethoscope, 
  Users,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      if (user.role === "provider") {
        navigate("/dashboard/provider");
      } else {
        navigate("/dashboard/patient");
      }
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Heart,
      title: "Personalized Wellness",
      description: "AI-powered recommendations tailored to your unique health profile and lifestyle."
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      description: "Track biometrics, visualize trends, and gain insights into your health journey."
    },
    {
      icon: Stethoscope,
      title: "Provider Dashboard",
      description: "Healthcare providers can monitor patients and assess health risks in real-time."
    },
    {
      icon: Shield,
      title: "Explainable AI",
      description: "Understand the 'why' behind every recommendation with transparent AI explanations."
    },
    {
      icon: Zap,
      title: "Smart Reminders",
      description: "Never miss medications, appointments, or wellness activities with intelligent alerts."
    },
    {
      icon: Users,
      title: "Care Coordination",
      description: "Seamless communication between patients and healthcare providers."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      {/* Animated background decorations */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -40, y: -40 }}
          animate={{ opacity: 1, x: [0, -10, 0], y: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-3xl rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, x: 40, y: 40 }}
          animate={{ opacity: 1, x: [0, 12, 0], y: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-chart-2/20 blur-3xl rounded-full"
        />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,transparent_1px),radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">WellnessAI</span>
            </div>
            <div className="flex items-center gap-4">
              {!isLoading && (
                <Button 
                  onClick={handleGetStarted}
                  className="gap-2"
                >
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                AI-Powered
                <span className="text-primary block">Wellness Assistant</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform your health journey with personalized recommendations, 
                real-time monitoring, and explainable AI insights that you can trust.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="gap-2 text-lg px-8 py-6"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 transition-transform hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <Activity className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Track Health</h3>
                      <p className="text-sm text-muted-foreground">Monitor vitals and biometrics</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 transition-transform hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">AI Insights</h3>
                      <p className="text-sm text-muted-foreground">Get personalized recommendations</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 transition-transform hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Trusted Care</h3>
                      <p className="text-sm text-muted-foreground">Explainable AI you can trust</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need for better health
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive wellness tools designed for both patients and healthcare providers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:supports-[backdrop-filter]:bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <CardContent className="p-8">
                    <feature.icon className="h-12 w-12 text-primary mb-6" />
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to transform your health?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers who trust WellnessAI 
              for personalized, explainable health insights.
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="gap-2 text-lg px-8 py-6"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">WellnessAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 WellnessAI. Empowering health through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}