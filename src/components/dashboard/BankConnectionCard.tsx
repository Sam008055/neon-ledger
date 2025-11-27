import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function BankConnectionCard() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectBank = async () => {
    setIsConnecting(true);
    
    // Placeholder for bank connection
    // In production, integrate with Plaid, Yodlee, or similar service
    toast.info("Bank connection feature coming soon!", {
      description: "This will integrate with Plaid or similar services to sync your accounts automatically."
    });
    
    setTimeout(() => {
      setIsConnecting(false);
    }, 2000);
  };

  return (
    <Card className="border-accent/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent" />
          <CardTitle>Connect Bank Account</CardTitle>
        </div>
        <CardDescription>
          Automatically sync transactions from your bank
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 border border-primary/30 rounded-md bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Connect your bank account to automatically import transactions, track spending, and get personalized insights.
            </p>
          </div>
          
          <Button 
            onClick={handleConnectBank} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Connect Bank Account
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Secured with bank-level encryption. We never store your credentials.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
