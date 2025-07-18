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
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Wind, Thermometer } from "lucide-react";
import LoadingSpinner from "@/components/shared/loading-spinner";

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export default function WeatherWidget() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Default to a sample location if geolocation fails
          setLocation({ lat: 40.7128, lon: -74.0060 }); // New York
        }
      );
    }
  }, []);

  const { data: weather, isLoading } = useQuery({
    queryKey: ["/api/weather", location?.lat, location?.lon],
    enabled: isAuthenticated && !!location,
    queryFn: async () => {
      if (!location) return null;
      const response = await fetch(`/api/weather?lat=${location.lat}&lon=${location.lon}`);
      if (!response.ok) throw new Error("Weather fetch failed");
      return response.json() as WeatherData;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });

  const getWeatherIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear':
        return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'clouds':
        return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-8 w-8 text-blue-500" />;
      default:
        return <Cloud className="h-8 w-8 text-gray-500" />;
    }
  };

  if (isLoading || !location) {
    return (
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="ranch-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Weather data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="ranch-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {Math.round(weather.main.temp)}°F
              </div>
              <div className="text-sm text-muted-foreground capitalize">
                {weather.weather[0]?.description}
              </div>
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
