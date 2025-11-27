import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { FinancialPlanner } from "@/components/dashboard/FinancialPlanner";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsPage() {
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
          <h1 className="text-3xl font-bold mb-2">Financial Goals</h1>
          <p className="text-muted-foreground">Set and track your financial objectives</p>
        </div>

        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GoalsCard />
            {dashboardData === undefined ? (
              <div className="border border-secondary/30 rounded-lg p-6">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <FinancialPlanner dashboardData={dashboardData} />
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}