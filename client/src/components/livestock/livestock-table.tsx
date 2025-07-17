import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit } from "lucide-react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import EmptyState from "@/components/shared/empty-state";

interface LivestockTableProps {
  limit?: number;
  searchTerm?: string;
}

export default function LivestockTable({ limit, searchTerm }: LivestockTableProps) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: animals, isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!animals || animals.length === 0) {
    return (
      <EmptyState
        title="No animals found"
        description="Add your first animal to start tracking your livestock."
      />
    );
  }

  const filteredAnimals = animals?.filter(animal => {
    if (!searchTerm) return true;
    return (
      animal.tagId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const displayAnimals = limit ? filteredAnimals?.slice(0, limit) : filteredAnimals;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'ranch-status-healthy';
      case 'sold': return 'ranch-status-info';
      case 'deceased': return 'ranch-status-danger';
      default: return 'ranch-status-warning';
    }
  };

  const getTypeColor = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cattle': return 'bg-blue-100 text-blue-800';
      case 'sheep': return 'bg-green-100 text-green-800';
      case 'goat': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayAnimals?.map((animal) => (
            <TableRow key={animal.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${animal.tagId}`} />
                    <AvatarFallback>{animal.tagId.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-dark-green">
                      {animal.name || `${animal.breed} #${animal.tagId}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {animal.gender} • Tag: {animal.tagId}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getTypeColor(animal.species)}>
                  {animal.breed || animal.species}
                </Badge>
              </TableCell>
              <TableCell>
                {animal.birthDate 
                  ? `${Math.floor((new Date().getTime() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years`
                  : 'Unknown'
                }
              </TableCell>
              <TableCell>
                {animal.weight ? `${animal.weight} lbs` : 'N/A'}
              </TableCell>
              <TableCell>{animal.location || 'Not specified'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(animal.status)}>
                  {animal.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
