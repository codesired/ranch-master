import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/shared/loading-spinner";
import EmptyState from "@/components/shared/empty-state";

export function EquipmentStatus() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: equipment, isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "ranch-status-healthy";
      case "maintenance":
        return "ranch-status-warning";
      case "repair":
        return "ranch-status-danger";
      case "retired":
        return "ranch-status-info";
      default:
        return "ranch-status-info";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "maintenance":
        return "Maintenance";
      case "repair":
        return "Repair Needed";
      case "retired":
        return "Retired";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">Equipment Status</CardTitle>
      </CardHeader>
      <CardContent>
        {equipment && equipment.length > 0 ? (
          <div className="space-y-4">
            {equipment.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-earth-brown text-white">
                      {item.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-dark-green">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.type} • {item.model || "Unknown Model"}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {getStatusText(item.status)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No equipment found"
            description="Add equipment to track status and maintenance."
          />
        )}
      </CardContent>
    </Card>
  );
}
