import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { BankConnectionCard } from "@/components/dashboard/BankConnectionCard";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
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
  const seedData = useMutation(api.budget.seedData);

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
    note: ""
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSeedData = async () => {
    try {
      await seedData({});
      toast.success("Sample data created!");
    } catch (error) {
      toast.error("Failed to seed data");
    }
  };

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

  const handleCreateTransaction = async () => {
    try {
      await createTransaction({
        accountId: transactionForm.accountId as Id<"accounts">,
        categoryId: transactionForm.categoryId as Id<"categories">,
        amount: transactionForm.amount,
        type: transactionForm.type,
        date: new Date(transactionForm.date).getTime(),
        note: transactionForm.note || undefined
      });
      toast.success("Transaction created!");
      setTransactionDialogOpen(false);
      setTransactionForm({
        accountId: "",
        categoryId: "",
        amount: 0,
        type: "expense",
        date: new Date().toISOString().split('T')[0],
        note: ""
      });
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight text-primary">NEON LEDGER</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            Welcome, <span className="text-secondary">{user.name || user.email || "Guest"}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Dashboard Stats */}
          <StatsCards dashboardData={dashboardData} />

          {/* Quick Actions */}
          {(!accounts || accounts.length === 0) && (
            <Card className="my-8 border-primary/30">
              <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>Create sample data to explore the app</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSeedData} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Sample Data
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Insights and Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            <InsightsCard dashboardData={dashboardData} />
            <BankConnectionCard />
          </div>

          {/* Spending Chart */}
          {dashboardData && dashboardData.categoryBreakdown.length > 0 && (
            <div className="mb-8">
              <SpendingChart categoryBreakdown={dashboardData.categoryBreakdown} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <div key={acc._id} className="flex items-center justify-between p-3 border border-border rounded-md">
                        <div>
                          <div className="font-medium">{acc.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">{acc.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">${acc.balance.toFixed(2)}</span>
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
                      </div>
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
                      <div key={cat._id} className="flex items-center justify-between p-3 border border-border rounded-md">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-8 border-accent/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button size="sm" onClick={() => setTransactionDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 10).map((txn) => (
                    <div key={txn._id} className="flex items-center justify-between p-3 border border-border rounded-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{txn.category?.name}</span>
                          <span className="text-xs text-muted-foreground">• {txn.account?.name}</span>
                        </div>
                        {txn.note && <div className="text-sm text-muted-foreground">{txn.note}</div>}
                        <div className="text-xs text-muted-foreground">
                          {new Date(txn.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${txn.type === 'income' ? 'text-accent' : 'text-destructive'}`}>
                          {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                        </span>
                        <Button size="icon" variant="ghost" onClick={() => handleDeleteTransaction(txn._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Dialog */}
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
              <label className="text-sm font-medium">Initial Balance</label>
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

      {/* Category Dialog */}
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

      {/* Transaction Dialog */}
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
              <label className="text-sm font-medium">Amount</label>
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