import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";

export default function AnalyticsPage() {
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
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Deep dive into your financial data</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Insights & Visualization</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightsCard dashboardData={dashboardData} />
            {dashboardData && dashboardData.categoryBreakdown.length > 0 && (
              <SpendingChart categoryBreakdown={dashboardData.categoryBreakdown} />
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
