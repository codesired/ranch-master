import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import LivestockTable from "@/components/livestock/livestock-table";
import AnimalForm from "@/components/livestock/animal-form";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Livestock() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  if (isLoading || animalsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-green mb-2">Livestock Management</h1>
          <p className="text-gray-600">Manage your animals, track health records, and monitor breeding.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="ranch-button-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Animal</DialogTitle>
              </DialogHeader>
              <AnimalForm onSuccess={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="ranch-card">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search animals by tag, name, or breed..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option>All Animals</option>
                <option>Cattle</option>
                <option>Sheep</option>
                <option>Goats</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option>All Status</option>
                <option>Active</option>
                <option>Sold</option>
                <option>Deceased</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="ranch-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Animals</p>
                <p className="text-2xl font-bold text-dark-green">{animals?.length || 0}</p>
              </div>
              <div className="bg-light-green p-3 rounded-full">
                <div className="w-6 h-6 bg-farm-green rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="ranch-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Healthy Animals</p>
                <p className="text-2xl font-bold text-dark-green">
                  {animals?.filter(a => a.status === 'active').length || 0}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="ranch-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Breeding Ready</p>
                <p className="text-2xl font-bold text-dark-green">12</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="ranch-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Need Attention</p>
                <p className="text-2xl font-bold text-dark-green">3</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Livestock Table */}
      <div className="ranch-card">
        <div className="p-6 border-b border-light-grey">
          <h3 className="text-lg font-semibold text-dark-green">All Animals</h3>
        </div>
        <LivestockTable searchTerm={searchTerm} />
      </div>
    </div>
  );
}
