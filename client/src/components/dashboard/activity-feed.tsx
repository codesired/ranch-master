import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign, Syringe, Wrench } from "lucide-react";

const activities = [
  {
    icon: Plus,
    iconBg: "bg-green-100",
    iconColor: "text-farm-green",
    title: "Added new cattle: Holstein #H-2847",
    time: "2 hours ago",
  },
  {
    icon: DollarSign,
    iconBg: "bg-orange-100",
    iconColor: "text-harvest-orange",
    title: "Recorded feed purchase: $2,340",
    time: "5 hours ago",
  },
  {
    icon: Syringe,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    title: "Health check completed for Angus herd",
    time: "1 day ago",
  },
  {
    icon: Wrench,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    title: "Equipment maintenance: Tractor #T-001",
    time: "2 days ago",
  },
];

export function ActivityFeed() {
  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activity.icon;

            return (
              <div key={index} className="flex items-start space-x-3">
                <div className={`${activity.iconBg} p-2 rounded-full`}>
                  <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-dark-green">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
