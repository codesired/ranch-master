import { Card, CardContent } from "@/components/ui/card";
import { Dog, DollarSign, Package, Heart } from "lucide-react";

interface MetricsCardsProps {
  stats?: {
    totalAnimals: number;
    healthAlerts: number;
    lowStockItems: number;
    equipmentIssues: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
  };
}

export function MetricsCards({ stats }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Livestock",
      value: stats?.totalAnimals || 0,
      change: "+12 this month",
      icon: Dog,
      iconBg: "bg-light-green",
      iconColor: "text-farm-green",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats?.monthlyRevenue?.toLocaleString() || "0"}`,
      change: "+8.2% from last month",
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-harvest-orange",
    },
    {
      title: "Feed Inventory",
      value: "15.2 tons",
      change: stats?.lowStockItems
        ? `${stats.lowStockItems} low stock items`
        : "Stock levels normal",
      icon: Package,
      iconBg: "bg-orange-100",
      iconColor: "text-earth-brown",
      changeColor: stats?.lowStockItems ? "text-amber-600" : "text-green-600",
    },
    {
      title: "Health Alerts",
      value: stats?.healthAlerts || 0,
      change: "Requires attention",
      icon: Heart,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      changeColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index} className="ranch-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-dark-green">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm ${card.changeColor || "text-green-600"}`}
                >
                  {card.change}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
