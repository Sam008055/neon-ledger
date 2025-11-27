import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit, Search, Filter, X, Upload, FileText, TrendingUp, TrendingDown, Zap, Award, Target } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ReceiptViewer } from "@/components/ReceiptViewer";
import { Badge } from "@/components/ui/badge";

export default function AccountsPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const dashboardData = useQuery(api.budget.getDashboardData);
  const accounts = useQuery(api.budget.getAccounts);
  const categories = useQuery(api.budget.getCategories);
  const transactions = useQuery(api.budget.getTransactions);
  
  const createAccount = useMutation(api.budget.createAccount);
  const updateAccount = useMutation(api.budget.updateAccount);
  const deleteAccount = useMutation(api.budget.deleteAccount);
  const createCategory = useMutation(api.budget.createCategory);
  const deleteCategory = useMutation(api.budget.deleteCategory);
  const createTransaction = useMutation(api.budget.createTransaction);
  const deleteTransaction = useMutation(api.budget.deleteTransaction);
  const generateUploadUrl = useMutation(api.budget.generateUploadUrl);

  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Id<"accounts"> | null>(null);
  const [accountForm, setAccountForm] = useState({ name: "", type: "bank", initialBalance: 0 });
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", type: "expense", color: "#00ffff" });
  
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    accountId: "",
    categoryId: "",
    amount: 0,
    type: "expense",
    date: new Date().toISOString().split('T')[0],
    note: "",
    receiptId: undefined as Id<"_storage"> | undefined
  });

  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterAccount, setFilterAccount] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Filter transactions
  const filteredTransactions = transactions?.filter((txn) => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesNote = txn.note?.toLowerCase().includes(query);
      const matchesCategory = txn.category?.name.toLowerCase().includes(query);
      const matchesAccount = txn.account?.name.toLowerCase().includes(query);
      const matchesAmount = txn.amount.toString().includes(query);
      
      if (!matchesNote && !matchesCategory && !matchesAccount && !matchesAmount) {
        return false;
      }
    }

    // Type filter
    if (filterType !== "all" && txn.type !== filterType) {
      return false;
    }

    // Category filter
    if (filterCategory !== "all" && txn.categoryId !== filterCategory) {
      return false;
    }

    // Account filter
    if (filterAccount !== "all" && txn.accountId !== filterAccount) {
      return false;
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom).getTime();
      if (txn.date < fromDate) {
        return false;
      }
    }

    if (dateTo) {
      const toDate = new Date(dateTo).getTime() + 86400000; // Add 1 day to include the end date
      if (txn.date > toDate) {
        return false;
      }
    }

    return true;
  }) || [];

  const clearFilters = () => {
    setSearchQuery("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterAccount("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchQuery || filterType !== "all" || filterCategory !== "all" || 
                          filterAccount !== "all" || dateFrom || dateTo;

  const handleCreateAccount = async () => {
    try {
      if (editingAccount) {
        await updateAccount({
          id: editingAccount,
          name: accountForm.name,
          type: accountForm.type,
          initialBalance: accountForm.initialBalance
        });
        toast.success("🎉 Account leveled up!");
      } else {
        await createAccount(accountForm);
        toast.success("⚡ New account unlocked!");
      }
      setAccountDialogOpen(false);
      setEditingAccount(null);
      setAccountForm({ name: "", type: "bank", initialBalance: 0 });
    } catch (error) {
      toast.error("Failed to save account");
    }
  };

  const handleDeleteAccount = async (id: Id<"accounts">) => {
    try {
      await deleteAccount({ id });
      toast.success("Account removed!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory(categoryForm);
      toast.success("🎯 Category created!");
      setCategoryDialogOpen(false);
      setCategoryForm({ name: "", type: "expense", color: "#00ffff" });
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: Id<"categories">) => {
    try {
      await deleteCategory({ id });
      toast.success("Category deleted!");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleReceiptUpload = async (file: File) => {
    try {
      setUploadingReceipt(true);
      
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const { storageId } = await result.json();
      
      setTransactionForm({ ...transactionForm, receiptId: storageId });
      setReceiptFile(file);
      toast.success("📎 Receipt attached!");
    } catch (error) {
      toast.error("Failed to upload receipt");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleCreateTransaction = async () => {
    try {
      await createTransaction({
        accountId: transactionForm.accountId as Id<"accounts">,
        categoryId: transactionForm.categoryId as Id<"categories">,
        amount: transactionForm.amount,
        type: transactionForm.type,
        date: new Date(transactionForm.date).getTime(),
        note: transactionForm.note || undefined,
        receiptId: transactionForm.receiptId
      });
      toast.success("💰 Transaction recorded! +10 XP");
      setTransactionDialogOpen(false);
      setTransactionForm({
        accountId: "",
        categoryId: "",
        amount: 0,
        type: "expense",
        date: new Date().toISOString().split('T')[0],
        note: "",
        receiptId: undefined
      });
      setReceiptFile(null);
    } catch (error) {
      toast.error("Failed to create transaction");
    }
  };

  const handleDeleteTransaction = async (id: Id<"transactions">) => {
    try {
      await deleteTransaction({ id });
      toast.success("Transaction deleted!");
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

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
        {/* Gamified Header Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10"
            >
              <div className="p-3 rounded-lg bg-primary/20">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Accounts</p>
                <p className="text-2xl font-bold text-primary">{accounts?.length || 0}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-accent/20 shadow-lg shadow-accent/10"
            >
              <div className="p-3 rounded-lg bg-accent/20">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Categories</p>
                <p className="text-2xl font-bold text-accent">{categories?.length || 0}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-secondary/20 shadow-lg shadow-secondary/10"
            >
              <div className="p-3 rounded-lg bg-secondary/20">
                <Zap className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Transactions</p>
                <p className="text-2xl font-bold text-secondary">{transactions?.length || 0}</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card/80 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/10"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Active Filters</p>
                <p className="text-2xl font-bold text-primary">{hasActiveFilters ? "ON" : "OFF"}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Accounts and Categories Management */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-primary to-secondary rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Account Management</h2>
            <Badge variant="outline" className="ml-auto">
              <Zap className="h-3 w-3 mr-1" />
              Quick Actions
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent shadow-xl shadow-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-primary">Accounts</CardTitle>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                        onClick={() => {
                          setEditingAccount(null);
                          setAccountForm({ name: "", type: "bank", initialBalance: 0 });
                          setAccountDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  {accounts && accounts.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {dashboardData?.accountBalances.map((acc, index) => (
                          <motion.div
                            key={acc._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className="group relative p-4 border-2 border-border rounded-xl hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <Award className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <div className="font-bold text-foreground">{acc.name}</div>
                                  <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    {acc.type}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                  <span className="text-lg font-bold text-primary">₹{acc.balance.toFixed(2)}</span>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="hover:bg-primary/10"
                                  onClick={() => {
                                    setEditingAccount(acc._id);
                                    setAccountForm({ name: acc.name, type: acc.type, initialBalance: acc.initialBalance });
                                    setAccountDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="hover:bg-destructive/10"
                                  onClick={() => handleDeleteAccount(acc._id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Award className="h-8 w-8 text-primary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">No accounts yet. Start your journey!</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent shadow-xl shadow-secondary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-secondary/20">
                        <Target className="h-5 w-5 text-secondary" />
                      </div>
                      <CardTitle className="text-secondary">Categories</CardTitle>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg shadow-secondary/20"
                        onClick={() => setCategoryDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        New
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  {categories && categories.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {categories.map((cat, index) => (
                          <motion.div
                            key={cat._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, x: -5 }}
                            className="group relative p-4 border-2 border-border rounded-xl hover:border-secondary/50 transition-all bg-card/50 backdrop-blur-sm overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-l from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <motion.div 
                                  className="w-10 h-10 rounded-lg shadow-lg"
                                  style={{ backgroundColor: cat.color || "#00ffff" }}
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                />
                                <div>
                                  <div className="font-bold text-foreground">{cat.name}</div>
                                  <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                                    {cat.type}
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="hover:bg-destructive/10"
                                onClick={() => handleDeleteCategory(cat._id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="p-4 rounded-full bg-secondary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Target className="h-8 w-8 text-secondary/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">No categories yet. Create one!</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Transaction History */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-accent to-primary rounded-full" />
            <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
            <Badge variant="outline" className="ml-auto">
              <TrendingUp className="h-3 w-3 mr-1" />
              {filteredTransactions.length} Records
            </Badge>
          </div>

          <Card className="border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-transparent shadow-xl shadow-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Zap className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle className="text-accent">Recent Activity</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-accent/30 hover:bg-accent/10"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg shadow-accent/20"
                      onClick={() => setTransactionDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-accent/20 focus:border-accent/50"
                />
              </div>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 border-2 border-accent/20 rounded-xl bg-accent/5 backdrop-blur-sm space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          Type
                        </label>
                        <Select value={filterType} onValueChange={setFilterType}>
                          <SelectTrigger className="border-accent/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          Category
                        </label>
                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                          <SelectTrigger className="border-accent/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <Award className="h-3 w-3" />
                          Account
                        </label>
                        <Select value={filterAccount} onValueChange={setFilterAccount}>
                          <SelectTrigger className="border-accent/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Accounts</SelectItem>
                            {accounts?.map((acc) => (
                              <SelectItem key={acc._id} value={acc._id}>
                                {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Date From</label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="border-accent/20"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Date To</label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="border-accent/20"
                        />
                      </div>
                    </div>

                    {hasActiveFilters && (
                      <div className="flex items-center justify-between pt-2 border-t border-accent/20">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Zap className="h-3 w-3 text-accent" />
                          Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
                        </p>
                        <Button size="sm" variant="ghost" onClick={clearFilters} className="hover:bg-accent/10">
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardHeader>
            
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredTransactions.slice(0, 50).map((txn, index) => (
                      <motion.div
                        key={txn._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ scale: 1.01, x: 5 }}
                        className="group relative p-4 border-2 border-border rounded-xl hover:border-accent/50 transition-all bg-card/50 backdrop-blur-sm overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${txn.type === 'income' ? 'from-accent/0 via-accent/5 to-accent/0' : 'from-destructive/0 via-destructive/5 to-destructive/0'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex-1 flex items-center gap-3">
                            <motion.div 
                              className={`p-2 rounded-lg ${txn.type === 'income' ? 'bg-accent/20' : 'bg-destructive/20'}`}
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              {txn.type === 'income' ? (
                                <TrendingUp className="h-4 w-4 text-accent" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </motion.div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-foreground">{txn.category?.name}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">{txn.account?.name}</span>
                                {txn.receiptId && (
                                  <Badge variant="outline" className="text-xs">
                                    <FileText className="h-2 w-2 mr-1" />
                                    Receipt
                                  </Badge>
                                )}
                              </div>
                              {txn.note && (
                                <div className="text-sm text-muted-foreground">{txn.note}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(txn.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`text-lg font-bold ${txn.type === 'income' ? 'text-accent' : 'text-destructive'}`}
                            >
                              {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                            </motion.div>
                            {txn.receiptId && (
                              <ReceiptViewer receiptId={txn.receiptId} />
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="hover:bg-destructive/10"
                              onClick={() => handleDeleteTransaction(txn._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="p-6 rounded-full bg-accent/10 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-12 w-12 text-accent/50" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {hasActiveFilters ? "No transactions match your filters" : "No transactions yet"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveFilters ? "Try adjusting your filters" : "Start tracking your finances!"}
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </section>
      </motion.div>

      {/* Dialogs */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Account" : "Create Account"}</DialogTitle>
            <DialogDescription>Add a new account to track your finances</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={accountForm.name}
                onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                placeholder="Main Checking"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={accountForm.type} onValueChange={(value) => setAccountForm({ ...accountForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Initial Balance (₹)</label>
              <Input
                type="number"
                value={accountForm.initialBalance}
                onChange={(e) => setAccountForm({ ...accountForm, initialBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateAccount}>{editingAccount ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new category to organize transactions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="Groceries"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={categoryForm.type} onValueChange={(value) => setCategoryForm({ ...categoryForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Transaction</DialogTitle>
            <DialogDescription>Record a new income or expense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={transactionForm.type} onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Account</label>
              <Select value={transactionForm.accountId} onValueChange={(value) => setTransactionForm({ ...transactionForm, accountId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((acc) => (
                    <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={transactionForm.categoryId} onValueChange={(value) => setTransactionForm({ ...transactionForm, categoryId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.filter(c => c.type === transactionForm.type).map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount (₹)</label>
              <Input
                type="number"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm({ ...transactionForm, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Note (Optional)</label>
              <Input
                value={transactionForm.note}
                onChange={(e) => setTransactionForm({ ...transactionForm, note: e.target.value })}
                placeholder="Add a note..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Receipt (Optional)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleReceiptUpload(file);
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingReceipt}
                  className="w-full"
                >
                  {uploadingReceipt ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {receiptFile ? "Change Receipt" : "Upload Receipt"}
                    </>
                  )}
                </Button>
                {receiptFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReceiptFile(null);
                      setTransactionForm({ ...transactionForm, receiptId: undefined });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {receiptFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  {receiptFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTransaction}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}