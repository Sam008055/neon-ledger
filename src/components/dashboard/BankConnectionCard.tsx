import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, AlertCircle, CheckCircle, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function BankConnectionCard() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const bankConnections = useQuery(api.budget.getBankConnections) as any;
  const connectBank = useMutation(api.budget.connectBank) as any;
  const syncTransactions = useMutation(api.budget.syncBankTransactions) as any;

  const handleConnectBank = async () => {
    setIsConnecting(true);
    
    try {
      // Placeholder for bank connection
      // In production, integrate with Setu, RazorpayX, or Plaid for Indian banks
      await connectBank({
        bankName: "Demo Bank",
        accountNumber: "XXXX1234",
        provider: "upi"
      });
      
      toast.success("🎉 Bank connected successfully!", {
        description: "You can now sync your UPI transactions automatically."
      });
    } catch (error) {
      toast.error("Failed to connect bank", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncTransactions = async (connectionId: string) => {
    setIsSyncing(true);
    
    try {
      const result = await syncTransactions({ connectionId });
      
      toast.success(`✨ Synced ${result.count} transactions!`, {
        description: "Your transaction history has been updated."
      });
    } catch (error) {
      toast.error("Failed to sync transactions", {
        description: "Please try again later."
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent shadow-xl shadow-accent/5 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
      
      <CardHeader className="relative border-b border-accent/20 bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="p-2 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg"
          >
            <Building2 className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary">
              Bank & UPI Connection
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Zap className="h-3 w-3 text-accent" />
              Auto-sync transactions from your bank
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 relative">
        <AnimatePresence mode="wait">
          {bankConnections && bankConnections.length > 0 ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {bankConnections.map((connection: any, index: number) => (
                <motion.div
                  key={connection._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border-2 border-accent/20 rounded-xl bg-card/50 backdrop-blur-sm hover:border-accent/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <CheckCircle className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{connection.bankName}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                          {connection.accountNumber}
                        </div>
                        {connection.lastSyncedAt && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last synced: {new Date(connection.lastSyncedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSyncTransactions(connection._id)}
                      disabled={isSyncing}
                      className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              <Button
                variant="outline"
                onClick={handleConnectBank}
                disabled={isConnecting}
                className="w-full border-accent/30 hover:bg-accent/10"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Add Another Bank
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="not-connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3 p-4 border-2 border-primary/30 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Connect your bank account to automatically import transactions
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Sync UPI transaction history for the last 1 month</li>
                    <li>Automatic categorization and analysis</li>
                    <li>Real-time balance updates</li>
                    <li>Secure bank-level encryption</li>
                  </ul>
                </div>
              </div>
              
              <Button 
                onClick={handleConnectBank} 
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 shadow-lg shadow-accent/20"
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-5 w-5" />
                    Connect Bank Account
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 justify-center">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs text-muted-foreground px-2">Supported Providers</p>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {["UPI", "Setu", "RazorpayX"].map((provider) => (
                  <div
                    key={provider}
                    className="p-2 text-center text-xs font-medium border border-border rounded-lg bg-card/50"
                  >
                    {provider}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" />
                We never store your banking credentials
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}