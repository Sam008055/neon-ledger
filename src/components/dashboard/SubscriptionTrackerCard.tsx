import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SubscriptionTrackerCard() {
  const analytics = useQuery(api.subscriptions.getSubscriptionAnalytics);

  if (!analytics || analytics.count === 0) {
    return (
      <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card/80 to-card/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary" />
            Subscription Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No subscriptions tracked yet.</p>
            <p className="text-xs mt-1">Mark transactions as subscriptions to track them here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-secondary/30 bg-gradient-to-br from-card/80 to-card/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-secondary" />
            Subscription Tracker
          </CardTitle>
          <Badge variant="outline" className="text-lg font-bold">
            ₹{analytics.monthlyTotal.toLocaleString()}/mo
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analytics.subscriptions.map((sub, index) => (
            <motion.div
              key={sub.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-secondary/20"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{sub.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {sub.count} transaction{sub.count > 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-secondary">
                  ₹{sub.monthlyAmount.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
            </motion.div>
          ))}
          
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-secondary" />
              <span>Tracking {analytics.count} recurring expenses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
