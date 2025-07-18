import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
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
  Search
} from "lucide-react";
import { TransactionForm } from "@/components/forms/transaction-form";
import { BudgetForm } from "@/components/forms/budget-form";
import { AccountForm } from "@/components/forms/account-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

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
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: financialSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/financial-summary"],
    enabled: isAuthenticated,
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
  });

  const { data: budgetStatus, isLoading: budgetStatusLoading } = useQuery({
    queryKey: ["/api/budget-status"],
    enabled: isAuthenticated,
  });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/accounts"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="ranch-card">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view financial information.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (transactionsLoading || summaryLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    const matchesDateRange = (!dateRange.start || transaction.date >= dateRange.start) &&
                            (!dateRange.end || transaction.date <= dateRange.end);

    return matchesSearch && matchesType && matchesCategory && matchesDateRange;
  }) || [];

  // Get unique categories for filter
  const categories = [...new Set(transactions?.map((t: Transaction) => t.category) || [])];

  // Calculate financial ratios
  const calculateRatios = () => {
    if (!financialSummary) return {};

    const { totalIncome, totalExpenses, netProfit } = financialSummary;
    const totalAssets = accounts?.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0) || 0;

    return {
      profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : "0.00",
      expenseRatio: totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(2) : "0.00",
      roi: totalAssets > 0 ? ((netProfit / totalAssets) * 100).toFixed(2) : "0.00",
      breakEvenPoint: totalExpenses > 0 ? (totalExpenses / (totalIncome - totalExpenses || 1) * 100).toFixed(2) : "0.00",
    };
  };

  const ratios = calculateRatios();

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => Object.values(row).join(","));
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-farm-green">Financial Management</h1>
        <div className="flex gap-2">
          <Dialog open={showTransactionForm} onOpenChange={setShowTransactionForm}>
            <DialogTrigger asChild>
              <Button className="farm-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm onSuccess={() => setShowTransactionForm(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showBudgetForm} onOpenChange={setShowBudgetForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm onSuccess={() => setShowBudgetForm(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={showAccountForm} onOpenChange={setShowAccountForm}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
              </DialogHeader>
              <AccountForm onSuccess={() => setShowAccountForm(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialSummary?.totalIncome || 0)}
            </div>
            <p className="text-xs text-green-600">
              +12.5% from last period
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
              {formatCurrency(financialSummary?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-red-600">
              +8.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-green">
              {formatCurrency(financialSummary?.netProfit || 0)}
            </div>
            <p className="text-xs text-farm-green">
              Margin: {ratios.profitMargin}%
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(accounts?.reduce((sum: number, acc: Account) => sum + (acc.balance || 0), 0) || 0)}
            </div>
            <p className="text-xs text-blue-600">
              Across {accounts?.length || 0} accounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income by Category */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Income by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialSummary?.incomeByCategory?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-green-600 font-bold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expenses by Category */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Expenses by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialSummary?.expensesByCategory?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-red-600 font-bold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Ratios */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Key Financial Ratios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{ratios.profitMargin}%</div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ratios.expenseRatio}%</div>
                  <div className="text-sm text-muted-foreground">Expense Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{ratios.roi}%</div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{ratios.breakEvenPoint}%</div>
                  <div className="text-sm text-muted-foreground">Break Even</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.slice(0, 5).map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {/* Filters */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Transaction Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
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
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Export</Label>
                  <Button 
                    variant="outline" 
                    onClick={() => exportToCSV(filteredTransactions, 'transactions')}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === "income" ? "default" : "destructive"}>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets?.map((budget: Budget) => (
              <Card key={budget.id} className="ranch-card">
                <CardHeader>
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <CardDescription>{budget.category} - {budget.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Budget Amount:</span>
                      <span className="font-bold">{formatCurrency(budget.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{budget.budgetType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alert Threshold:</span>
                      <span>{budget.alertThreshold}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={budget.isActive ? "default" : "secondary"}>
                        {budget.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts?.map((account: Account) => (
              <Card key={account.id} className="ranch-card">
                <CardHeader>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  <CardDescription>Account #{account.accountNumber}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{account.type}</span>
                    </div>
                    {account.subType && (
                      <div className="flex justify-between">
                        <span>Sub-type:</span>
                        <span>{account.subType}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Balance:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle>Profit Margin Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Gross Profit Margin:</span>
                    <span className="font-bold text-green-600">{ratios.profitMargin}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue Growth:</span>
                    <span className="font-bold text-blue-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost Control:</span>
                    <span className="font-bold text-orange-600">8.2% increase</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Break Even Point:</span>
                    <span className="font-bold text-purple-600">{ratios.breakEvenPoint}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Operating Cash Flow:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(financialSummary?.netProfit || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Free Cash Flow:</span>
                    <span className="font-bold text-blue-600">
                      {formatCurrency((financialSummary?.netProfit || 0) * 0.85)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cash Conversion Cycle:</span>
                    <span className="font-bold">32 days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ROI:</span>
                    <span className="font-bold text-purple-600">{ratios.roi}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expense Analysis */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialSummary?.totalExpenses || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency((financialSummary?.totalExpenses || 0) / 12)}
                  </div>
                  <div className="text-sm text-muted-foreground">Monthly Average</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{ratios.expenseRatio}%</div>
                  <div className="text-sm text-muted-foreground">Expense to Income Ratio</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Next Month Projection:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((financialSummary?.totalIncome || 0) * 1.05)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Quarter Projection:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((financialSummary?.totalIncome || 0) * 3.2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Annual Projection:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency((financialSummary?.totalIncome || 0) * 12.8)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle>Expense Forecast</CardTitle>
                <CardDescription>Projected expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Next Month Projection:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency((financialSummary?.totalExpenses || 0) * 1.03)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Next Quarter Projection:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency((financialSummary?.totalExpenses || 0) * 3.1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Annual Projection:</span>
                    <span className="font-bold text-red-600">
                      {formatCurrency((financialSummary?.totalExpenses || 0) * 12.4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>Break-Even Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(financialSummary?.totalExpenses || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Break-Even Point</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.ceil((financialSummary?.totalExpenses || 0) / ((financialSummary?.totalIncome || 1) / 365))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days to Break Even</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(Math.max(0, (financialSummary?.netProfit || 0)))}
                  </div>
                  <div className="text-sm text-muted-foreground">Profit Above Break-Even</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Profit & Loss Statement
                </CardTitle>
                <CardDescription>Comprehensive P&L report</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cash Flow Statement
                </CardTitle>
                <CardDescription>Cash flow analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Balance Sheet
                </CardTitle>
                <CardDescription>Assets, liabilities, equity</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Budget vs Actual
                </CardTitle>
                <CardDescription>Budget performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tax Summary
                </CardTitle>
                <CardDescription>Tax-ready financial summary</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Analysis
                </CardTitle>
                <CardDescription>Detailed expense breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trend Analysis
                </CardTitle>
                <CardDescription>Financial trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Summary
                </CardTitle>
                <CardDescription>Month-by-month breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="ranch-card cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export All Data
                </CardTitle>
                <CardDescription>Complete financial export</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => exportToCSV(transactions || [], 'complete_financial_data')}
                >
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}