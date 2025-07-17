import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, FileText, Download, Calendar, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

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

  const { data: animals, isLoading: animalsLoading } = useQuery({
    queryKey: ["/api/animals"],
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

  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/inventory"],
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

  if (isLoading || summaryLoading || animalsLoading || inventoryLoading) {
    return <LoadingSpinner />;
  }

  const reportData = [
    {
      title: "Financial Performance Report",
      description: "Income, expenses, and profitability analysis",
      type: "Financial",
      lastGenerated: "2 hours ago",
      status: "Ready"
    },
    {
      title: "Livestock Health Report",
      description: "Animal health status and vaccination records",
      type: "Livestock",
      lastGenerated: "1 day ago",
      status: "Ready"
    },
    {
      title: "Inventory Status Report",
      description: "Current stock levels and low inventory alerts",
      type: "Inventory",
      lastGenerated: "3 hours ago",
      status: "Ready"
    },
    {
      title: "Equipment Maintenance Report",
      description: "Equipment status and maintenance schedules",
      type: "Equipment",
      lastGenerated: "1 day ago",
      status: "Ready"
    },
    {
      title: "Breeding Performance Report",
      description: "Breeding records and success rates",
      type: "Breeding",
      lastGenerated: "1 week ago",
      status: "Ready"
    }
  ];

  const livestockBySpecies = animals?.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const inventoryByCategory = inventory?.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive reporting and analytics for your ranch operations.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button className="ranch-button-primary">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-farm-green">
              ${financialSummary?.totalIncome?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-600">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-harvest-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-harvest-orange">
              ${financialSummary?.netProfit?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-orange-600">Profit margin: {financialSummary?.totalIncome > 0 ? ((financialSummary.netProfit / financialSummary.totalIncome) * 100).toFixed(1) : "0"}%</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <div className="w-4 h-4 bg-farm-green rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {animals?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Active livestock</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <div className="w-4 h-4 bg-earth-brown rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-brown">
              {inventory?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Stock items</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Livestock Distribution */}
        <Card className="ranch-card">
          <CardHeader>
            <CardTitle className="text-dark-green">Livestock Distribution</CardTitle>
            <CardDescription>Animals by species</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(livestockBySpecies).map(([species, count]) => (
                <div key={species} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-farm-green rounded-full"></div>
                    <span className="font-medium capitalize">{species}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{count}</span>
                    <p className="text-sm text-gray-600">
                      {((count / (animals?.length || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Categories */}
        <Card className="ranch-card">
          <CardHeader>
            <CardTitle className="text-dark-green">Inventory Categories</CardTitle>
            <CardDescription>Items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(inventoryByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-earth-brown rounded-full"></div>
                    <span className="font-medium capitalize">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{count}</span>
                    <p className="text-sm text-gray-600">
                      {((count / (inventory?.length || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Available Reports</CardTitle>
          <CardDescription>Generate detailed reports for your ranch operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Last Generated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((report, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">{report.description}</TableCell>
                    <TableCell>{report.lastGenerated}</TableCell>
                    <TableCell>
                      <Badge className="ranch-status-healthy">{report.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          Generate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Breakdown */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Financial Breakdown</CardTitle>
          <CardDescription>Income and expense analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-dark-green mb-4">Income Sources</h4>
              <div className="space-y-3">
                {financialSummary?.incomeByCategory?.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="font-medium text-green-600">
                      ${category.amount.toLocaleString()}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    No income data available
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-dark-green mb-4">Expense Categories</h4>
              <div className="space-y-3">
                {financialSummary?.expensesByCategory?.map((category, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{category.category}</span>
                    <span className="font-medium text-red-600">
                      ${category.amount.toLocaleString()}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500">
                    No expense data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
