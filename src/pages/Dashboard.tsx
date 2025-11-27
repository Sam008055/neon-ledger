import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Outlet } from "react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Navigation } from "@/components/Navigation";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">NEON LEDGER</h1>
              <p className="text-xs text-muted-foreground">Financial Management System</p>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground">Welcome back,</p>
            <p className="font-semibold text-secondary">{user.name || user.email || "Guest"}</p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Page Content */}
      <Outlet />
    </div>
  );
}