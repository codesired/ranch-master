import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, CloudSun, CloudRain, Wind, Thermometer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const mockWeatherData = [
  { day: "Today", icon: Sun, temp: "72°F", color: "text-harvest-orange" },
  { day: "Tomorrow", icon: CloudSun, temp: "68°F", color: "text-gray-500" },
  { day: "Wed", icon: CloudRain, temp: "65°F", color: "text-blue-500" },
  { day: "Thu", icon: CloudRain, temp: "63°F", color: "text-blue-500" },
];

function getWeatherIcon(condition: string) {
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
}

export function WeatherWidget() {
  const { user } = useAuth();
  const [location, setLocation] = useState({ lat: 40.7128, lon: -74.006 });

  const { data: weather, isLoading } = useQuery({
    queryKey: ["/api/weather", location.lat, location.lon],
    queryFn: () =>
      fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`).then(
        (res) => res.json(),
      ),
    enabled: !!user,
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  useEffect(() => {
    // Get user's geolocation if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Use default location (New York) if geolocation fails
          console.log("Using default location");
        },
      );
    }
  }, []);

  if (isLoading) {
    return (
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="text-dark-green">Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading weather...</div>
        </CardContent>
      </Card>
    );
  }

  if (!weather || weather.message) {
    // Fallback to mock data if API fails
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">
              {Math.round(weather.main.temp)}°F
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {weather.weather[0]?.description}
            </p>
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
      </CardContent>
    </Card>
  );
}
