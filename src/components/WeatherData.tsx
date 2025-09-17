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
    <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Thermometer className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Weather Conditions</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchWeatherData}
          disabled={isLoading}
          className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-200"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading && !weatherData && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Fetching weather data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="p-3 rounded-xl bg-destructive/10 w-fit mx-auto mb-4">
            <Thermometer className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-destructive mb-4 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWeatherData} className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10">
            Try Again
          </Button>
        </div>
      )}

      {weatherData && (
        <div className="space-y-8">
          {/* Main Temperature Display */}
          <div className="text-center pb-8 border-b border-white/20">
            <div className={`text-5xl font-bold mb-3 ${getTemperatureColor(weatherData.temperature)}`}>
              {weatherData.temperature}°C
            </div>
            <div className="text-lg text-muted-foreground capitalize mb-4">
              {weatherData.description}
            </div>
            <Badge variant={getTemperatureStatus(weatherData.temperature).variant} className="px-4 py-2 text-sm">
              {getTemperatureStatus(weatherData.temperature).label}
            </Badge>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <div className="p-2 rounded-xl bg-primary/20">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Feels Like</div>
                <div className="text-2xl font-semibold text-foreground">{weatherData.feelsLike}°C</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20">
              <div className="p-2 rounded-xl bg-blue-500/20">
                <Droplets className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Humidity</div>
                <div className="text-2xl font-semibold text-foreground">{weatherData.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Wind className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Wind Speed</div>
                <div className="text-2xl font-semibold text-foreground">{weatherData.windSpeed} m/s</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Eye className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Visibility</div>
                <div className="text-2xl font-semibold text-foreground">{weatherData.visibility} km</div>
              </div>
            </div>
          </div>

          {/* Pressure */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-sky border border-secondary/30">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-secondary-foreground/70"></div>
              <span className="text-lg font-medium text-secondary-foreground">Atmospheric Pressure</span>
            </div>
            <span className="text-2xl font-semibold text-secondary-foreground">{weatherData.pressure} hPa</span>
          </div>

          {lastUpdated && (
            <div className="text-xs text-muted-foreground text-center pt-6 border-t border-white/20">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};