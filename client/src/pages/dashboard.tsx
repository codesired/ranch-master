import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import ActivityFeed from "@/components/dashboard/activity-feed";
import WeatherWidget from "@/components/dashboard/weather-widget";
import AlertsPanel from "@/components/dashboard/alerts-panel";
import LivestockTable from "@/components/livestock/livestock-table";
import EquipmentStatus from "@/components/equipment/equipment-status";
import FinancialSummary from "@/components/finances/financial-summary";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Plus, Database, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
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

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
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

  const seedMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/seed-database", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Database seeded with sample data successfully!",
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

  const handleSeedDatabase = () => {
    if (window.confirm("This will add sample data to your ranch management system. Continue?")) {
      seedMutation.mutate();
    }
  };

  if (isLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening on your ranch today.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>
          <Button 
            variant="outline" 
            className="ranch-button-secondary"
            onClick={handleSeedDatabase}
            disabled={seedMutation.isPending}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {seedMutation.isPending ? "Seeding..." : "Seed Data"}
          </Button>
          <Button className="ranch-button-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards stats={dashboardStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <ActivityFeed />

        {/* Weather & Alerts */}
        <div className="space-y-6">
          <WeatherWidget />
          <AlertsPanel />
        </div>
      </div>

      {/* Livestock Overview */}
      <div className="ranch-card">
        <div className="p-6 border-b border-light-grey">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-dark-green mb-4 md:mb-0">
              Livestock Overview
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search animals..."
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48"
                />
                <Button size="sm" className="ranch-button-primary">
                  Search
                </Button>
              </div>
              <Button size="sm" className="ranch-button-accent">
                Filter
              </Button>
            </div>
          </div>
        </div>
        <LivestockTable limit={6} />
      </div>

      {/* Equipment & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EquipmentStatus />
        <FinancialSummary />
      </div>
    </div>
  );
}
