import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import TransactionForm from "@/components/forms/transaction-form";
import BudgetForm from "@/components/forms/budget-form";
import AccountForm from "@/components/forms/account-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, DollarSign, TrendingUp, TrendingDown, Edit, Trash2, Filter, Search, Target, AlertTriangle, Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Finances() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

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

  const { data: trialBalance, isLoading: trialBalanceLoading } = useQuery({
    queryKey: ["/api/trial-balance"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/transactions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/financial-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsAddDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedTransaction(null);
    setIsAddDialogOpen(false);
  };

  const handleCloseBudget = () => {
    setSelectedBudget(null);
    setIsBudgetDialogOpen(false);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setIsBudgetDialogOpen(true);
  };

  const handleCloseAccount = () => {
    setSelectedAccount(null);
    setIsAccountDialogOpen(false);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setIsAccountDialogOpen(true);
  };

  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  }) || [];

  const allCategories = [...new Set(transactions?.map((t: any) => t.category) || [])];

  if (isLoading || transactionsLoading || summaryLoading || budgetsLoading || accountsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Financial Management</h1>
          <p className="text-gray-600">Track expenses, monitor income, manage budgets, and analyze profitability.</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-green">
              ${financialSummary?.totalIncome?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-600">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-brown">
              ${financialSummary?.totalExpenses?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-red-600">+4.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-harvest-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-harvest-orange">
              ${financialSummary?.netProfit?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-600">+12.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {financialSummary?.totalIncome > 0 
                ? ((financialSummary.netProfit / financialSummary.totalIncome) * 100).toFixed(1) 
                : "0"}%
            </div>
            <p className="text-xs text-blue-600">Target: 15%</p>
          </CardContent>
        </Card>
          </div>

          {/* Budget Alerts */}
          {budgetStatus && budgetStatus.length > 0 && (
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Budget Alerts
                </CardTitle>
                <CardDescription>Budget status and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetStatus.map((budget: any) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{budget.name}</span>
                        <span className={`text-sm ${budget.isOverBudget ? 'text-red-600' : budget.isNearLimit ? 'text-yellow-600' : 'text-green-600'}`}>
                          ${budget.spent.toLocaleString()} / ${budget.amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(budget.percentage, 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-gray-500">
                        {budget.percentage.toFixed(1)}% used
                        {budget.isOverBudget && " (Over Budget!)"}
                        {budget.isNearLimit && !budget.isOverBudget && " (Near Limit)"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Income vs Expenses Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="ranch-card">
          <CardHeader>
            <CardTitle className="text-dark-green">Income by Category</CardTitle>
            <CardDescription>Monthly breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialSummary?.incomeByCategory?.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-farm-green">${category.amount.toLocaleString()}</span>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No income data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader>
            <CardTitle className="text-dark-green">Expenses by Category</CardTitle>
            <CardDescription>Monthly breakdown of expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialSummary?.expensesByCategory?.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-earth-brown">${category.amount.toLocaleString()}</span>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-dark-green">Transaction Management</h2>
              <p className="text-gray-600">Track and manage all financial transactions</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ranch-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedTransaction ? "Edit Transaction" : "Add New Transaction"}
                  </DialogTitle>
                </DialogHeader>
                <TransactionForm
                  onClose={handleClose}
                  transaction={selectedTransaction}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Transaction Management */}
      <Card className="ranch-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <CardTitle className="text-dark-green">All Transactions</CardTitle>
              <CardDescription>Manage and filter your financial transactions</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-light-grey">
                          {transaction.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}$
                          {parseFloat(transaction.amount).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions found. Add your first transaction to get started.
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-dark-green">Budget Management</h2>
              <p className="text-gray-600">Create and monitor spending budgets</p>
            </div>
            <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ranch-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedBudget ? "Edit Budget" : "Create New Budget"}
                  </DialogTitle>
                </DialogHeader>
                <BudgetForm
                  onClose={handleCloseBudget}
                  budget={selectedBudget}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Budget Status Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-dark-green">Current Budget Status</h3>
              {budgetStatus?.map((budget: any) => (
                <Card key={budget.id} className="ranch-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{budget.name}</CardTitle>
                        <CardDescription>{budget.category}</CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Spent: ${budget.spent.toLocaleString()}</span>
                        <span>Budget: ${budget.amount.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(budget.percentage, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{budget.percentage.toFixed(1)}% used</span>
                        <span className={budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${Math.abs(budget.remaining).toLocaleString()} {budget.remaining >= 0 ? 'remaining' : 'over'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* All Budgets List */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">All Budgets</CardTitle>
                <CardDescription>Manage your budget settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgets?.map((budget: any) => (
                    <div key={budget.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{budget.name}</div>
                        <div className="text-sm text-gray-500">
                          {budget.category} • {budget.budgetType} • {budget.period}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">${parseFloat(budget.amount).toLocaleString()}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-dark-green">Chart of Accounts</h2>
              <p className="text-gray-600">Manage your accounting structure</p>
            </div>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ranch-button-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAccount ? "Edit Account" : "Create New Account"}
                  </DialogTitle>
                </DialogHeader>
                <AccountForm
                  onClose={handleCloseAccount}
                  account={selectedAccount}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accounts by Type */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Accounts by Type</CardTitle>
                <CardDescription>Chart of accounts organized by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
                    const typeAccounts = accounts?.filter((acc: any) => acc.type === type) || [];
                    if (typeAccounts.length === 0) return null;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <h4 className="font-medium text-sm uppercase text-gray-600">
                          {type.replace('_', ' ')}
                        </h4>
                        {typeAccounts.map((account: any) => (
                          <div key={account.id} className="flex justify-between items-center text-sm">
                            <span>{account.accountNumber} - {account.name}</span>
                            <span className="font-medium">
                              ${parseFloat(account.balance).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Trial Balance */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Trial Balance
                </CardTitle>
                <CardDescription>Verify your books are balanced</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trialBalance?.map((account: any) => (
                    <div key={account.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium">
                        {account.accountNumber} - {account.name}
                      </span>
                      <span className={parseFloat(account.balance) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(parseFloat(account.balance)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  
                  {trialBalance && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-medium">
                        <span>Total Debits:</span>
                        <span>${trialBalance
                          .filter((acc: any) => ['asset', 'expense'].includes(acc.type))
                          .reduce((sum: number, acc: any) => sum + Math.abs(parseFloat(acc.balance)), 0)
                          .toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Credits:</span>
                        <span>${trialBalance
                          .filter((acc: any) => ['liability', 'equity', 'revenue'].includes(acc.type))
                          .reduce((sum: number, acc: any) => sum + Math.abs(parseFloat(acc.balance)), 0)
                          .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-dark-green mb-2">Financial Reports</h2>
            <p className="text-gray-600">Generate and view comprehensive financial reports</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Chart */}
            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Income by Category</CardTitle>
                <CardDescription>Monthly breakdown of income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialSummary?.incomeByCategory?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-farm-green">${category.amount.toLocaleString()}</span>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No income data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="ranch-card">
              <CardHeader>
                <CardTitle className="text-dark-green">Expenses by Category</CardTitle>
                <CardDescription>Monthly breakdown of expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialSummary?.expensesByCategory?.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-earth-brown">${category.amount.toLocaleString()}</span>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      No expense data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
