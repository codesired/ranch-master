import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudSun, CloudRain, Thermometer, Wind } from "lucide-react";

const mockWeatherData = [
  { day: "Today", icon: Sun, temp: "72°F", color: "text-harvest-orange" },
  { day: "Tomorrow", icon: CloudSun, temp: "68°F", color: "text-gray-500" },
  { day: "Wed", icon: CloudRain, temp: "65°F", color: "text-blue-500" },
  { day: "Thu", icon: CloudRain, temp: "63°F", color: "text-blue-500" },
];

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Mock weather data for demonstration
    setWeather({
      main: {
        temp: 72,
        humidity: 65,
        feels_like: 75
      },
      weather: [
        { main: "Clear", description: "Clear sky" }
      ],
      wind: {
        speed: 8.5
      }
    });
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case "clear":
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case "clouds":
        return <CloudSun className="h-8 w-8 text-gray-500" />;
      case "rain":
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  if (!weather) {
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

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="text-dark-green">Current Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{Math.round(weather.main.temp)}°F</p>
              <p className="text-sm text-muted-foreground">{weather.weather[0]?.description}</p>
            </div>
            {getWeatherIcon(weather.weather[0]?.main)}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              <span>Feels like {Math.round(weather.main.feels_like)}°F</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              <span>{Math.round(weather.wind.speed)} mph</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Humidity: {weather.main.humidity}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}