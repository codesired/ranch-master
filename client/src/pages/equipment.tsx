import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
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
import { Plus, Wrench, AlertTriangle, Truck, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EquipmentForm } from "@/components/forms/equipment-form";

export default function Equipment() {
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

  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ["/api/equipment"],
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

  if (isLoading || equipmentLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "default";
      case "maintenance":
        return "secondary";
      case "repair":
        return "destructive";
      case "retired":
        return "outline";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return "✓";
      case "maintenance":
        return "⚠";
      case "repair":
        return "⚠";
      case "retired":
        return "✗";
      default:
        return "?";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">
            Equipment Management
          </h1>
          <p className="text-gray-600">
            Track equipment status, schedule maintenance, and monitor costs.
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
            <option>All Equipment</option>
            <option>Tractors</option>
            <option>Harvesters</option>
            <option>Irrigation</option>
            <option>Feed Equipment</option>
          </select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <EquipmentForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Equipment
            </CardTitle>
            <Truck className="h-4 w-4 text-farm-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dark-green">
              {equipment?.length || 0}
            </div>
            <p className="text-xs text-gray-600">Active equipment</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <div className="w-4 h-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {equipment?.filter((e) => e.status === "operational").length || 0}
            </div>
            <p className="text-xs text-green-600">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {equipment?.filter((e) => e.status === "maintenance").length || 0}
            </div>
            <p className="text-xs text-yellow-600">Scheduled service</p>
          </CardContent>
        </Card>

        <Card className="ranch-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Repair</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {equipment?.filter((e) => e.status === "repair").length || 0}
            </div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      {equipment &&
        equipment.filter(
          (e) => e.status === "maintenance" || e.status === "repair",
        ).length > 0 && (
          <Card className="ranch-card border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-600 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Maintenance & Repair Alerts
              </CardTitle>
              <CardDescription>Equipment that needs attention:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {equipment
                  .filter(
                    (e) => e.status === "maintenance" || e.status === "repair",
                  )
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-yellow-800">
                          {item.name}
                        </p>
                        <p className="text-sm text-yellow-600">
                          {item.model} | Location:{" "}
                          {item.location || "Not specified"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === "repair" ? "destructive" : "secondary"
                        }
                      >
                        {item.status === "repair"
                          ? "Repair Needed"
                          : "Maintenance Due"}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Equipment Table */}
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Equipment Inventory</CardTitle>
          <CardDescription>
            All equipment and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipment && equipment.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.model || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)} {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.location || "Not specified"}</TableCell>
                      <TableCell>
                        {item.purchaseDate
                          ? new Date(item.purchaseDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        $
                        {parseFloat(item.purchasePrice || "0").toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
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
              No equipment found. Add your first equipment to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
