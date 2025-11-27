import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Wallet, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Logo" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-primary">NEON LEDGER</span>
          </div>
          <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}>
            {isAuthenticated ? "Dashboard" : "Get Started"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <img
                  src="/logo.svg"
                  alt="Neon Ledger"
                  width={120}
                  height={120}
                  className="relative rounded-lg"
                />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-primary">NEON</span>{" "}
              <span className="text-secondary">LEDGER</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Track your finances in real-time with a{" "}
              <span className="text-accent font-bold">cyberpunk</span> edge.
              Manage accounts, categories, and transactions with style.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="text-lg"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Tracking"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg"
              >
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-primary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight">
              <span className="text-secondary">Features</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="p-6 border border-primary/30 rounded-lg bg-card/50 backdrop-blur-sm"
              >
                <Wallet className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Multi-Account</h3>
                <p className="text-muted-foreground">
                  Track multiple bank accounts, cash, credit cards, and investments in one place.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="p-6 border border-secondary/30 rounded-lg bg-card/50 backdrop-blur-sm"
              >
                <TrendingUp className="h-10 w-10 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">Real-Time Insights</h3>
                <p className="text-muted-foreground">
                  Get instant updates on your balance, income, expenses, and net flow.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="p-6 border border-accent/30 rounded-lg bg-card/50 backdrop-blur-sm"
              >
                <Shield className="h-10 w-10 text-secondary mb-4" />
                <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground">
                  Your financial data is encrypted and protected with enterprise-grade security.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="p-6 border border-destructive/30 rounded-lg bg-card/50 backdrop-blur-sm"
              >
                <Zap className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Built with modern tech for instant updates and seamless performance.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-primary/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Ready to take control of your{" "}
              <span className="text-primary">finances</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the future of personal budgeting today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="text-lg"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/30 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Built with{" "}
            <a
              href="https://vly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              vly.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}