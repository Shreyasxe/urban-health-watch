import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, Wind, Eye, Loader2, RefreshCw } from 'lucide-react';
import { LocationData } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface WeatherInfo {
  temperature: number;
  humidity: number;
  description: string;
  windSpeed: number;
  visibility: number;
  pressure: number;
  feelsLike: number;
  icon: string;
}

interface WeatherDataProps {
  location: LocationData;
}

export const WeatherData: React.FC<WeatherDataProps> = ({ location }) => {
  const [weatherData, setWeatherData] = useState<WeatherInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Using OpenWeatherMap API (requires API key)
      // For demo purposes, we'll simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // In production, this would be:
      // const response = await fetch(
      //   `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}&units=metric`
      // );
      
      // Simulated weather data with some variation based on location
      const tempVariation = (location.lat / 90) * 15; // Temperature varies with latitude
      const baseTemp = 20 + tempVariation + (Math.random() - 0.5) * 10;
      
      const simulatedData: WeatherInfo = {
        temperature: Math.round(baseTemp),
        humidity: Math.round(40 + Math.random() * 40),
        description: ['Clear sky', 'Few clouds', 'Partly cloudy', 'Overcast'][Math.floor(Math.random() * 4)],
        windSpeed: Math.round((Math.random() * 15 + 2) * 10) / 10,
        visibility: Math.round((8 + Math.random() * 7) * 10) / 10,
        pressure: Math.round(1000 + Math.random() * 40),
        feelsLike: Math.round(baseTemp + (Math.random() - 0.5) * 5),
        icon: '01d', // OpenWeatherMap icon code
      };
      
      setWeatherData(simulatedData);
      setLastUpdated(new Date());
      
      toast({
        title: "Weather Data Updated",
        description: `Current temperature: ${simulatedData.temperature}°C`,
      });
    } catch (err) {
      setError('Failed to fetch weather data');
      toast({
        title: "Weather Data Error",
        description: "Unable to fetch weather data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-600';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTemperatureStatus = (temp: number) => {
    if (temp < 0) return { label: 'Very Cold', variant: 'secondary' as const };
    if (temp < 10) return { label: 'Cold', variant: 'secondary' as const };
    if (temp < 20) return { label: 'Cool', variant: 'default' as const };
    if (temp < 25) return { label: 'Comfortable', variant: 'default' as const };
    if (temp < 30) return { label: 'Warm', variant: 'secondary' as const };
    return { label: 'Hot', variant: 'destructive' as const };
  };

  return (
    <Card className="p-6 shadow-data-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Weather Conditions</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWeatherData}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading && !weatherData && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Fetching weather data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <Thermometer className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-destructive mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWeatherData}>
            Try Again
          </Button>
        </div>
      )}

      {weatherData && (
        <div className="space-y-6">
          {/* Main Temperature Display */}
          <div className="text-center pb-6 border-b">
            <div className={`text-4xl font-bold mb-2 ${getTemperatureColor(weatherData.temperature)}`}>
              {weatherData.temperature}°C
            </div>
            <div className="text-lg text-muted-foregroup capitalize mb-2">
              {weatherData.description}
            </div>
            <Badge variant={getTemperatureStatus(weatherData.temperature).variant}>
              {getTemperatureStatus(weatherData.temperature).label}
            </Badge>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
              <Thermometer className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Feels Like</div>
                <div className="text-lg font-semibold">{weatherData.feelsLike}°C</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
              <Droplets className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm font-medium">Humidity</div>
                <div className="text-lg font-semibold">{weatherData.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
              <Wind className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-sm font-medium">Wind Speed</div>
                <div className="text-lg font-semibold">{weatherData.windSpeed} m/s</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm font-medium">Visibility</div>
                <div className="text-lg font-semibold">{weatherData.visibility} km</div>
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-sm font-medium">Atmospheric Pressure</span>
            </div>
            <span className="text-lg font-semibold">{weatherData.pressure} hPa</span>
          </div>

          {lastUpdated && (
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};