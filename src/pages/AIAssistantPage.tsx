import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AIChatbot } from "@/components/dashboard/AIChatbot";

export default function AIAssistantPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dashboardData = useQuery(api.budget.getDashboardData);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Financial Assistant</h1>
          <p className="text-muted-foreground">Get intelligent insights about your finances</p>
        </div>

        <section>
          <AIChatbot dashboardData={dashboardData} />
        </section>
      </motion.div>
    </div>
  );
}
