import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { InventoryForm } from "@/components/forms/inventory-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Package,
  AlertTriangle,
  TrendingDown,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

export default function Inventory() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
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

  const { data: lowStockItems, isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/inventory/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
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
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsAddDialogOpen(true);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setIsAddDialogOpen(false);
  };

  const filteredInventory =
    inventory?.filter((item: any) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      const matchesLowStock =
        !filterLowStock || item.quantity <= item.lowStockThreshold;
      return matchesSearch && matchesCategory && matchesLowStock;
    }) || [];

  const allCategories = [
    ...new Set(inventory?.map((item: any) => item.category) || []),
  ];

  if (isLoading || inventoryLoading || lowStockLoading) {
    return <LoadingSpinner />;
  }

  const getStockLevel = (current: number, minimum: number) => {
    if (!minimum) return 100;
    return Math.min(100, (current / minimum) * 100);
  };

  const getStockStatus = (current: number, minimum: number) => {
    if (!minimum) return "good";
    if (current <= minimum) return "critical";
    if (current <= minimum * 1.5) return "low";
    return "good";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Track feed, supplies, and equipment inventory levels.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>All Categories</option>
            <option>Feed</option>
            <option>Medicine</option>
            <option>Supplies</option>
            <option>Equipment</option>
          </select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedItem
                    ? "Edit Inventory Item"
                    : "Add New Inventory Item"}
                </DialogTitle>
              </DialogHeader>
              <InventoryForm onClose={handleClose} item={selectedItem} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {inventory?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockItems?.length || 0}
            </div>
            <p className="text-xs text-red-600">Items need restocking</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-harvest-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-harvest-orange">
              $
              {inventory
                ?.reduce(
                  (sum, item) =>
                    sum +
                    parseFloat(item.cost || "0") *
                      parseFloat(item.quantity || "0"),
                  0,
                )
                .toLocaleString() || "0"}
            </div>
            <p className="text-xs text-gray-600">Current inventory value</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Package className="h-4 w-4 text-earth-brown" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-earth-brown">
              {[...new Set(inventory?.map((item) => item.category))].length ||
                0}
            </div>
            <p className="text-xs text-gray-600">Different categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems && lowStockItems.length > 0 && (
        <Card className="ranch-card border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              The following items are running low and need restocking:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-red-800">{item.name}</p>
                    <p className="text-sm text-red-600">
                      Current: {parseFloat(item.quantity)} {item.unit} |
                      Minimum: {parseFloat(item.minThreshold || "0")}{" "}
                      {item.unit}
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Current Inventory</CardTitle>
          <CardDescription>All items in your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {inventory && inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => {
                    const current = parseFloat(item.quantity);
                    const minimum = parseFloat(item.minThreshold || "0");
                    const status = getStockStatus(current, minimum);
                    const level = getStockLevel(current, minimum);

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {current} {item.unit}
                        </TableCell>
                        <TableCell>
                          {minimum} {item.unit}
                        </TableCell>
                        <TableCell className="w-32">
                          <div className="space-y-1">
                            <Progress
                              value={level}
                              className={`h-2 ${
                                status === "critical"
                                  ? "bg-red-100"
                                  : status === "low"
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                              }`}
                            />
                            <span className="text-xs text-gray-600">
                              {level.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.location || "Not specified"}
                        </TableCell>
                        <TableCell>
                          $
                          {(
                            parseFloat(item.cost || "0") * current
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              status === "critical"
                                ? "destructive"
                                : status === "low"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {status === "critical"
                              ? "Critical"
                              : status === "low"
                                ? "Low"
                                : "Good"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No inventory items found. Add your first item to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
