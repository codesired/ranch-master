import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  Plus,
  Target,
  CreditCard,
  Wallet,
  Calculator,
  FileText,
  Download,
  Filter,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Receipt,
} from "lucide-react";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BudgetForm } from "@/components/forms/budget-form";
import { AccountForm } from "@/components/forms/account-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import LoadingSpinner from "@/components/shared/loading-spinner";

interface Transaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  createdAt: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: Array<{ category: string; amount: number }>;
  expensesByCategory: Array<{ category: string; amount: number }>;
}

interface Budget {
  id: number;
  name: string;
  category: string;
  budgetType: string;
  amount: number;
  period: string;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
}

interface Account {
  id: number;
  accountNumber: string;
  name: string;
  type: string;
  subType?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export default function Finances() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Queries with proper default values and error handling
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: financialSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: [],
    expensesByCategory: []
  }, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/financial-summary"],
    enabled: isAuthenticated,
  });

  const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
    enabled: isAuthenticated,
  });

  const { data: budgetStatus = [], isLoading: budgetStatusLoading } = useQuery({
    queryKey: ["/api/budget-status"],
    enabled: isAuthenticated,
  });

  // Mutations for CRUD operations
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/transactions/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      toast({ title: "Success", description: "Transaction deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/budgets/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({ title: "Success", description: "Budget deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/accounts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({ title: "Success", description: "Account deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    return <div>Please log in to view finances.</div>;
  }

  // Enhanced filtering logic
  const filteredTransactions = transactions.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    const matchesDateRange = !dateRange.start || !dateRange.end || 
                            (transaction.date >= dateRange.start && transaction.date <= dateRange.end);
    
    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  });

  // Calculate enhanced statistics
  const totalTransactions = transactions.length;
  const recentTransactions = transactions.slice(0, 5);
  const avgTransactionAmount = totalTransactions > 0 
    ? transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0) / totalTransactions 
    : 0;

  // Get unique categories for filter dropdown
  const uniqueCategories = [...new Set(transactions.map((t: Transaction) => t.category))];

  const handleTransactionSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
    setShowTransactionForm(false);
    toast({ title: "Success", description: "Transaction saved successfully" });
  };

  const handleBudgetSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    queryClient.invalidateQueries({ queryKey: ["/api/budget-status"] });
    setShowBudgetForm(false);
    toast({ title: "Success", description: "Budget saved successfully" });
  };

  const handleAccountSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
    setShowAccountForm(false);
    toast({ title: "Success", description: "Account saved successfully" });
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getTransactionIcon = (type: string) => 
    type === 'income' ? <TrendingUp className="h-4 w-4 text-green-600" /> : 
                       <TrendingDown className="h-4 w-4 text-red-600" />;

  const getBudgetStatusColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Financial Management</h1>
          <p className="text-gray-600">Track income, expenses, budgets, and accounts</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm onSuccess={handleTransactionSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summaryLoading ? "..." : formatCurrency(financialSummary.totalIncome)}
            </div>
            <p className="text-xs text-gray-600">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryLoading ? "..." : formatCurrency(financialSummary.totalExpenses)}
            </div>
            <p className="text-xs text-gray-600">
              This month
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialSummary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryLoading ? "..." : formatCurrency(financialSummary.netProfit)}
            </div>
            <p className="text-xs text-gray-600">
              {financialSummary.netProfit >= 0 ? 'Profit' : 'Loss'} this month
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {transactionsLoading ? "..." : totalTransactions}
            </div>
            <p className="text-xs text-gray-600">
              Average: {formatCurrency(avgTransactionAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Budgets</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">Transaction History</CardTitle>
                  <CardDescription>Track all your income and expenses</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <LoadingSpinner />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction: Transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTransactionIcon(transaction.type)}
                            <Badge 
                              variant={transaction.type === 'income' ? 'default' : 'secondary'}
                              className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {transaction.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                              disabled={deleteTransactionMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets">
          <div className="space-y-6">
            <Card className="ranch-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-dark-green">Budget Management</CardTitle>
                    <CardDescription>Set and monitor spending limits</CardDescription>
                  </div>
                  <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
                    <DialogTrigger asChild>
                      <Button className="ranch-button-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Budget
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Budget</DialogTitle>
                      </DialogHeader>
                      <BudgetForm onSuccess={handleBudgetSuccess} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {budgetsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((budget: Budget) => (
                      <Card key={budget.id} className="border-l-4 border-farm-green">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">{budget.name}</CardTitle>
                            <Badge variant={budget.isActive ? "default" : "secondary"}>
                              {budget.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Category:</span>
                              <span className="font-medium">{budget.category}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Budget:</span>
                              <span className="font-medium">{formatCurrency(budget.amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Period:</span>
                              <span className="font-medium">{budget.period}</span>
                            </div>
                            <div className="flex space-x-2 pt-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteBudgetMutation.mutate(budget.id)}
                                disabled={deleteBudgetMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts">
          <Card className="ranch-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-dark-green">Account Management</CardTitle>
                  <CardDescription>Manage your financial accounts</CardDescription>
                </div>
                <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
                  <DialogTrigger asChild>
                    <Button className="ranch-button-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Account</DialogTitle>
                    </DialogHeader>
                    <AccountForm onSuccess={handleAccountSuccess} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.map((account: Account) => (
                    <Card key={account.id} className="border-l-4 border-farm-green">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
                          <Badge variant={account.isActive ? "default" : "secondary"}>
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Type:</span>
                            <span className="font-medium">{account.type}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Account #:</span>
                            <span className="font-medium">{account.accountNumber}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Balance:</span>
                            <span className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(account.balance)}
                            </span>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteAccountMutation.mutate(account.id)}
                              disabled={deleteAccountMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Income by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {financialSummary.incomeByCategory?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {financialSummary.expensesByCategory?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-red-600 font-semibold">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}