import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Edit, Search, Filter, X, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ReceiptViewer } from "@/components/ReceiptViewer";

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
        toast.success("Account updated!");
      } else {
        await createAccount(accountForm);
        toast.success("Account created!");
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
      toast.success("Account deleted!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory(categoryForm);
      toast.success("Category created!");
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
      toast.success("Receipt uploaded successfully!");
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
      toast.success("Transaction created!");
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
        {/* Accounts and Categories Management */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Account Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accounts</CardTitle>
                  <Button size="sm" onClick={() => {
                    setEditingAccount(null);
                    setAccountForm({ name: "", type: "bank", initialBalance: 0 });
                    setAccountDialogOpen(true);
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {accounts && accounts.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardData?.accountBalances.map((acc) => (
                      <motion.div
                        key={acc._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border border-border rounded-md hover:border-primary/50 transition-all"
                      >
                        <div>
                          <div className="font-medium">{acc.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{acc.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">₹{acc.balance.toFixed(2)}</span>
                          <Button size="icon" variant="ghost" onClick={() => {
                            setEditingAccount(acc._id);
                            setAccountForm({ name: acc.name, type: acc.type, initialBalance: acc.initialBalance });
                            setAccountDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteAccount(acc._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No accounts yet</p>
                )}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-secondary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Categories</CardTitle>
                  <Button size="sm" onClick={() => setCategoryDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {categories && categories.length > 0 ? (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <motion.div
                        key={cat._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border border-border rounded-md hover:border-secondary/50 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: cat.color || "#00ffff" }} />
                          <div>
                            <div className="font-medium">{cat.name}</div>
                            <div className="text-sm text-muted-foreground capitalize">{cat.type}</div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Transactions with Filters */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">Transaction History</h2>
          <Card className="border-accent/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Recent Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <Button size="sm" onClick={() => setTransactionDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 border border-border rounded-md bg-card/50 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Type</label>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
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
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger>
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
                      <label className="text-sm font-medium mb-2 block">Account</label>
                      <Select value={filterAccount} onValueChange={setFilterAccount}>
                        <SelectTrigger>
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
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date To</label>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredTransactions.length} of {transactions?.length || 0} transactions
                      </p>
                      <Button size="sm" variant="ghost" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.slice(0, 50).map((txn) => {
                    const receiptUrl = txn.receiptId ? api.budget.getReceiptUrl : null;
                    
                    return (
                      <motion.div
                        key={txn._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border border-border rounded-md hover:border-accent/50 transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{txn.category?.name}</span>
                            <span className="text-xs text-muted-foreground">• {txn.account?.name}</span>
                            {txn.receiptId && (
                              <span title="Has receipt">
                                <FileText className="h-3 w-3 text-primary" />
                              </span>
                            )}
                          </div>
                          {txn.note && <div className="text-sm text-muted-foreground">{txn.note}</div>}
                          <div className="text-xs text-muted-foreground">
                            {new Date(txn.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${txn.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                            {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                          </span>
                          {txn.receiptId && (
                            <ReceiptViewer receiptId={txn.receiptId} />
                          )}
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteTransaction(txn._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    {hasActiveFilters ? "No transactions match your filters" : "No transactions yet"}
                  </p>
                </div>
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