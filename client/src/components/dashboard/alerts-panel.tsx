import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Calendar, Wrench } from "lucide-react";

const alerts = [
  {
    icon: AlertTriangle,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
    title: "Low Feed Stock",
    description: "Hay supply running low (3 days remaining)",
    textColor: "text-red-800",
    descColor: "text-red-600",
  },
  {
    icon: Calendar,
    iconColor: "text-yellow-500",
    bgColor: "bg-yellow-50",
    title: "Vaccination Due",
    description: "15 cattle need vaccination this week",
    textColor: "text-yellow-800",
    descColor: "text-yellow-600",
  },
  {
    icon: Wrench,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
    title: "Maintenance Scheduled",
    description: "Tractor service due in 2 days",
    textColor: "text-blue-800",
    descColor: "text-blue-600",
  },
];

export default function AlertsPanel() {
  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">System Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            
            return (
              <div key={index} className={`flex items-center space-x-3 p-3 ${alert.bgColor} rounded-lg`}>
                <Icon className={`h-5 w-5 ${alert.iconColor}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${alert.textColor}`}>{alert.title}</p>
                  <p className={`text-xs ${alert.descColor}`}>{alert.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
