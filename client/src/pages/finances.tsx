import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Finances() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  if (isLoading || transactionsLoading || summaryLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Financial Management</h1>
          <p className="text-gray-600">Track expenses, monitor income, and analyze profitability.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
              {/* Transaction form would go here */}
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      {/* Recent Transactions */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Recent Transactions</CardTitle>
          <CardDescription>Latest financial activity</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
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
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-medium bg-light-grey rounded-full">
                          {transaction.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}$
                          {parseFloat(transaction.amount).toLocaleString()}
                        </span>
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
    </div>
  );
}
