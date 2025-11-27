import { Button } from "@/components/ui/button";
import { Home, Target, Award, TrendingUp, Wallet, Bot, Trophy, BookOpen, Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Overview", keywords: ["home", "dashboard", "main", "overview"] },
    { path: "/dashboard/accounts", icon: Wallet, label: "Accounts", keywords: ["accounts", "wallet", "transactions", "money"] },
    { path: "/dashboard/analytics", icon: TrendingUp, label: "Analytics", keywords: ["analytics", "charts", "trends", "insights", "reports"] },
    { path: "/dashboard/goals", icon: Target, label: "Goals", keywords: ["goals", "targets", "objectives", "savings goals"] },
    { path: "/dashboard/challenges", icon: Trophy, label: "Challenges", keywords: ["challenges", "tasks", "daily", "weekly", "points"] },
    { path: "/dashboard/learn", icon: BookOpen, label: "Learn", keywords: ["learn", "lessons", "education", "finance", "courses"] },
    { path: "/dashboard/achievements", icon: Award, label: "Achievements", keywords: ["achievements", "rewards", "badges", "unlocked"] },
    { path: "/dashboard/ai-assistant", icon: Bot, label: "AI Assistant", keywords: ["ai", "assistant", "chatbot", "help", "advice"] },
  ];

  const filteredItems = navItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(query) ||
      item.keywords.some(keyword => keyword.includes(query))
    );
  });

  const handleSearch = (item: typeof navItems[0]) => {
    navigate(item.path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      handleSearch(filteredItems[0]);
    }
  };

  return (
    <>
      <nav className="border-b border-primary/30 bg-card/80 backdrop-blur-md sticky top-[57px] md:top-[73px] z-40 shadow-md">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto py-2 scrollbar-hide">
            {/* Search Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchOpen(true)}
                className="whitespace-nowrap text-xs md:text-sm px-2 md:px-4 border border-primary/20"
              >
                <Search className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </motion.div>

            {/* Navigation Items */}
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className={`relative whitespace-nowrap text-xs md:text-sm px-2 md:px-4 ${
                      isActive ? "shadow-lg shadow-primary/20" : ""
                    }`}
                  >
                    <item.icon className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-t-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Quick Navigation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search for pages, features, or sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="text-lg"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => handleSearch(item)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-card/50 hover:bg-card cursor-pointer transition-all"
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.label}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.keywords.slice(0, 3).join(", ")}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {location.pathname === item.path && (
                        <span className="text-primary font-semibold">Current</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {searchQuery && filteredItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Press <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd> to navigate to the first result
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}