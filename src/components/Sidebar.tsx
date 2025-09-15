import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  Activity, 
  Heart, 
  Home, 
  LogOut, 
  Settings, 
  Users, 
  User,
  Stethoscope,
  BarChart3
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const patientNavItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard/patient" },
    { icon: Activity, label: "Patient-form", path: "/patient-form" },
    { icon: Heart, label: "Recommendations", path: "/recommendations" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const providerNavItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard/provider" },
    { icon: Users, label: "Patients", path: "/patients" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Stethoscope, label: "Assessments", path: "/assessments" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const navItems = user?.role === "provider" ? providerNavItems : patientNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border-r border-border h-full flex flex-col ${className}`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">WellnessAI</h1>
            <p className="text-xs text-muted-foreground">
              {user?.role === "provider" ? "Provider Portal" : "Patient Portal"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3"
          onClick={() => navigate("/settings")}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
}