import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Package,
  Wrench,
  FileText,
  PlusCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { WeatherWidget } from "@/components/dashboard/weather-widget";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { format } from "date-fns";

interface DashboardStats {
  totalAnimals: number;
  healthAlerts: number;
  lowStockItems: number;
  equipmentIssues: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

interface Animal {
  id: number;
  name: string;
  species: string;
  breed?: string;
  status: string;
  tagId: string;
  createdAt: string;
}

interface Transaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
}

interface Budget {
  id: number;
  name: string;
  category: string;
  amount: number;
  period: string;
  alertThreshold: number;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
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

  const { data: animals } = useQuery({
    queryKey: ["/api/animals"],
    enabled: isAuthenticated,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["/api/financial-summary"],
    enabled: isAuthenticated,
  });

  const { data: budgets } = useQuery({
    queryKey: ["/api/budgets"],
    enabled: isAuthenticated,
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: isAuthenticated,
  });

  const { data: equipment } = useQuery({
    queryKey: ["/api/equipment"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="ranch-card">
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">
              Welcome to Ranch Manager
            </h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your dashboard and manage your ranch
              operations.
            </p>
            <Button onClick={() => (window.location.href = "/api/login")}>
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsLoading) {
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

  // Calculate additional metrics
  const netProfit =
    (stats?.monthlyRevenue || 0) - (stats?.monthlyExpenses || 0);
  const profitMargin =
    stats?.monthlyRevenue > 0 ? (netProfit / stats.monthlyRevenue) * 100 : 0;

  // Get species distribution
  const speciesDistribution =
    animals?.reduce((acc: any, animal: Animal) => {
      acc[animal.species] = (acc[animal.species] || 0) + 1;
      return acc;
    }, {}) || {};

  // Calculate equipment efficiency
  const totalEquipment = equipment?.length || 0;
  const operationalEquipment =
    equipment?.filter((eq: any) => eq.status === "operational").length || 0;
  const equipmentEfficiency =
    totalEquipment > 0 ? (operationalEquipment / totalEquipment) * 100 : 100;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-farm-green">
            Ranch Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening on your ranch.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), "MMM dd, yyyy")}
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Live View
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAnimals || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active livestock count
            </p>
            <div className="mt-2">
              <Progress
                value={Math.min(100, ((stats?.totalAnimals || 0) / 100) * 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.totalAnimals > 0
                ? Math.round(
                    ((stats.totalAnimals - (stats?.healthAlerts || 0)) /
                      stats.totalAnimals) *
                      100,
                  )
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.healthAlerts || 0} alerts pending
            </p>
            <div className="mt-2">
              <Progress
                value={
                  stats?.totalAnimals > 0
                    ? ((stats.totalAnimals - (stats?.healthAlerts || 0)) /
                        stats.totalAnimals) *
                      100
                    : 100
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-green-600">+12.5% from last month</p>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(netProfit)}
            </p>
            <div className="mt-2">
              <Progress value={Math.max(0, profitMargin)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Equipment Efficiency
            </CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {equipmentEfficiency.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {operationalEquipment}/{totalEquipment} operational
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Status
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inventory?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.lowStockItems || 0} items low stock
            </p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.monthlyExpenses || 0)}
            </div>
            <p className="text-xs text-red-600">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Budgets
            </CardTitle>
            <Target className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {budgets?.filter((b: Budget) => b.alertThreshold).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Budget tracking active
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Species Distribution */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Livestock Distribution
              </CardTitle>
              <CardDescription>Animals by species</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(speciesDistribution).map(([species, count]) => (
                  <div
                    key={species}
                    className="text-center p-4 border rounded-lg"
                  >
                    <div className="text-2xl font-bold text-farm-green">
                      {count as number}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {species}
                    </div>
                  </div>
                ))}
                {Object.keys(speciesDistribution).length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No animals added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Overview
              </CardTitle>
              <CardDescription>Income vs expenses breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialSummary?.incomeByCategory
                  ?.slice(0, 3)
                  .map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-green-600 font-bold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                {financialSummary?.expensesByCategory
                  ?.slice(0, 3)
                  .map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">
                          {item.category}
                        </span>
                      </div>
                      <span className="text-red-600 font-bold">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                {!financialSummary?.incomeByCategory?.length &&
                  !financialSummary?.expensesByCategory?.length && (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No financial data available</p>
                      <Button className="mt-2" variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add First Transaction
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>Recent Animals</CardTitle>
              <CardDescription>Latest additions to your herd</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {animals?.slice(0, 5).map((animal: Animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {animal.name || `Animal ${animal.tagId}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {animal.species} {animal.breed && `• ${animal.breed}`}
                        <span className="ml-2 text-xs">
                          Added {format(new Date(animal.createdAt), "MMM dd")}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        animal.status === "active" ? "default" : "secondary"
                      }
                    >
                      {animal.status}
                    </Badge>
                  </div>
                ))}
                {(!animals || animals.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No animals added yet</p>
                    <Button className="mt-2" variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add First Animal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <WeatherWidget />

          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alerts & Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.healthAlerts > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
                    <Heart className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">
                      {stats.healthAlerts} health alerts
                    </span>
                  </div>
                )}
                {stats?.lowStockItems > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">
                      {stats.lowStockItems} low stock items
                    </span>
                  </div>
                )}
                {stats?.equipmentIssues > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                    <Wrench className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      {stats.equipmentIssues} equipment issues
                    </span>
                  </div>
                )}
                {!stats?.healthAlerts &&
                  !stats?.lowStockItems &&
                  !stats?.equipmentIssues && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="text-green-600 mb-2">✓</div>
                      <p className="text-sm">All systems running smoothly</p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Animal
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Transaction
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Update Inventory
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="ranch-card">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions
                  ?.slice(0, 3)
                  .map((transaction: Transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="truncate flex-1">
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.category}
                        </div>
                      </div>
                      <div
                        className={`font-bold ml-2 ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                {(!recentTransactions || recentTransactions.length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">No transactions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
