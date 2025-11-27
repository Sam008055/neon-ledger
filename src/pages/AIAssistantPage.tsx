import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Brain, Zap } from "lucide-react";
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
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 p-8 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
          
          <div className="relative flex items-center justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                    AI Financial Assistant
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Powered by intelligent insights
                  </p>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="hidden md:flex items-center gap-4"
            >
              <div className="text-right">
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
                  24/7
                </div>
                <div className="text-xs text-muted-foreground">Always Available</div>
              </div>
              <Zap className="h-12 w-12 text-accent animate-pulse" />
            </motion.div>
          </div>
        </motion.div>

        {/* AI Chatbot Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AIChatbot dashboardData={dashboardData} />
        </motion.section>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: Brain, title: "Smart Analysis", desc: "AI-powered financial insights", color: "from-primary to-primary/50" },
            { icon: Sparkles, title: "Personalized Tips", desc: "Tailored recommendations", color: "from-accent to-accent/50" },
            { icon: Zap, title: "Instant Answers", desc: "Real-time responses", color: "from-secondary to-secondary/50" }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative overflow-hidden rounded-2xl border-2 border-white/10 bg-gradient-to-br from-card/80 to-card/40 p-6 backdrop-blur-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />
              <div className="relative">
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}