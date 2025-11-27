import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart, Sparkles, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function SelfCareCard() {
  const selfCare = useQuery(api.selfCare.getSelfCareSuggestions);

  if (!selfCare) return null;

  const { suggestions, financialHealth } = selfCare;

  return (
    <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 via-card/80 to-card/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" />
          Financial Self-Care
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Financial Health Score */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Savings Rate</span>
            <span className="text-lg font-bold text-accent">
              {Math.round(financialHealth.savingsRate)}%
            </span>
          </div>
          <Progress value={financialHealth.savingsRate} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            You're saving ₹{Math.round(financialHealth.monthlySavings)} this month!
          </p>
        </div>

        {/* Self-Care Suggestions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Treat Yourself (Guilt-Free!)
          </h4>
          
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <motion.div
              key={suggestion.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="p-3 rounded-lg bg-muted/50 border border-accent/20"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{suggestion.icon}</span>
                <div className="flex-1">
                  <h5 className="font-semibold text-sm">{suggestion.title}</h5>
                  <p className="text-xs text-muted-foreground mt-1">
                    {suggestion.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-accent">
                      Budget: ₹{suggestion.amount}
                    </span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Plan It
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Heart className="h-3 w-3 text-accent" />
            Remember: Financial wellness includes treating yourself!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
