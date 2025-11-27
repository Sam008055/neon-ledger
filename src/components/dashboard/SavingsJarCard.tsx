import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Trash2, Coins } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SavingsJarCard() {
  const jars = useQuery(api.savingsJars.getSavingsJars);
  const createJar = useMutation(api.savingsJars.createSavingsJar);
  const addToJar = useMutation(api.savingsJars.addToSavingsJar);
  const deleteJar = useMutation(api.savingsJars.deleteSavingsJar);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState<string | null>(null);
  const [newJar, setNewJar] = useState({
    name: "",
    targetAmount: 0,
    emoji: "💰",
    color: "#00ffff",
  });
  const [addAmount, setAddAmount] = useState(0);

  const emojis = ["💰", "🏠", "✈️", "🚗", "🎓", "💍", "🎮", "📱"];
  const colors = ["#00ffff", "#ff0080", "#00ff00", "#ffff00", "#ff00ff", "#00ffaa"];

  const handleCreateJar = async () => {
    try {
      await createJar(newJar);
      toast.success("🎉 Savings jar created!");
      setShowCreateDialog(false);
      setNewJar({ name: "", targetAmount: 0, emoji: "💰", color: "#00ffff" });
    } catch (error) {
      toast.error("Failed to create jar");
    }
  };

  const handleAddToJar = async (jarId: string) => {
    try {
      const result = await addToJar({ jarId: jarId as any, amount: addAmount });
      if (result.status === "completed") {
        toast.success("🎊 Savings goal completed!", {
          description: "You've reached your target!"
        });
      } else {
        toast.success(`💵 Added ₹${addAmount} to your jar!`);
      }
      setShowAddDialog(null);
      setAddAmount(0);
    } catch (error) {
      toast.error("Failed to add to jar");
    }
  };

  return (
    <>
      <Card className="border-2 border-accent/30 bg-gradient-to-br from-card/80 to-card/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accent" />
              Virtual Savings Jars
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-accent to-primary"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Jar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jars?.map((jar, index) => {
              const progress = (jar.currentAmount / jar.targetAmount) * 100;
              return (
                <motion.div
                  key={jar._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative overflow-hidden rounded-xl border-2 p-4"
                  style={{ borderColor: jar.color }}
                >
                  <div className="absolute inset-0 opacity-10" style={{ backgroundColor: jar.color }} />
                  
                  <div className="relative space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{jar.emoji}</span>
                        <div>
                          <h4 className="font-bold">{jar.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            ₹{jar.currentAmount.toLocaleString()} / ₹{jar.targetAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteJar({ id: jar._id })}
                        className="h-6 w-6"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <Button
                      size="sm"
                      onClick={() => setShowAddDialog(jar._id)}
                      className="w-full"
                      style={{ backgroundColor: jar.color }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Money
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {(!jars || jars.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No savings jars yet. Create one to start saving!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Jar Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Savings Jar</DialogTitle>
            <DialogDescription>Set up a new savings goal</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Jar Name</Label>
              <Input
                value={newJar.name}
                onChange={(e) => setNewJar({ ...newJar, name: e.target.value })}
                placeholder="e.g., Vacation Fund"
              />
            </div>
            <div>
              <Label>Target Amount (₹)</Label>
              <Input
                type="number"
                value={newJar.targetAmount || ""}
                onChange={(e) => setNewJar({ ...newJar, targetAmount: Number(e.target.value) })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label>Choose Emoji</Label>
              <div className="flex gap-2 flex-wrap">
                {emojis.map(emoji => (
                  <Button
                    key={emoji}
                    variant={newJar.emoji === emoji ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewJar({ ...newJar, emoji })}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Choose Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded-full border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: newJar.color === color ? "#fff" : "transparent"
                    }}
                    onClick={() => setNewJar({ ...newJar, color })}
                  />
                ))}
              </div>
            </div>
            <Button onClick={handleCreateJar} className="w-full">
              Create Jar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={!!showAddDialog} onOpenChange={() => setShowAddDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Money to Jar</DialogTitle>
            <DialogDescription>How much would you like to save?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={addAmount || ""}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                placeholder="500"
              />
            </div>
            <Button 
              onClick={() => showAddDialog && handleAddToJar(showAddDialog)} 
              className="w-full"
            >
              Add to Jar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
