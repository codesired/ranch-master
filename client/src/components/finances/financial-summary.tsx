import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/shared/loading-spinner";

export default function FinancialSummary() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: financialSummary, isLoading } = useQuery({
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const expenseCategories = [
    { name: "Feed & Supplies", amount: 12450 },
    { name: "Veterinary", amount: 3200 },
    { name: "Equipment", amount: 8900 },
    { name: "Labor", amount: 9570 },
  ];

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-farm-green">
              ${financialSummary?.totalIncome?.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-gray-600">Monthly Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-earth-brown">
              ${financialSummary?.totalExpenses?.toLocaleString() || "0"}
            </p>
            <p className="text-sm text-gray-600">Monthly Expenses</p>
          </div>
        </div>

        <div className="space-y-4">
          {(financialSummary?.expensesByCategory || expenseCategories).map((category, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{category.category || category.name}</span>
              <span className="text-sm font-medium text-dark-green">
                ${(category.amount || 0).toLocaleString()}
              </span>
            </div>
          ))}
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-dark-green">Net Profit</span>
              <span className="text-sm font-bold text-farm-green">
                ${financialSummary?.netProfit?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
