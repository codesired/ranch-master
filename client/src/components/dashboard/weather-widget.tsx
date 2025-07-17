import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudSun, CloudRain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const mockWeatherData = [
  { day: "Today", icon: Sun, temp: "72°F", color: "text-harvest-orange" },
  { day: "Tomorrow", icon: CloudSun, temp: "68°F", color: "text-gray-500" },
  { day: "Wed", icon: CloudRain, temp: "65°F", color: "text-blue-500" },
  { day: "Thu", icon: CloudRain, temp: "63°F", color: "text-blue-500" },
];

export default function WeatherWidget() {
  // In a real app, you would fetch weather data from the API
  // const { data: weatherData } = useQuery({
  //   queryKey: ["/api/weather"],
  //   queryFn: () => fetch("/api/weather?lat=40.7128&lon=-74.0060").then(res => res.json()),
  // });

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          {mockWeatherData.map((day, index) => {
            const Icon = day.icon;
            
            return (
              <div key={index}>
                <p className="text-xs text-gray-600 mb-2">{day.day}</p>
                <Icon className={`h-8 w-8 ${day.color} mb-2 mx-auto`} />
                <p className="text-sm font-medium">{day.temp}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
