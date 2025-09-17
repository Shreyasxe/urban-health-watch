import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Wind, Loader2, RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LocationData } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface AirQualityInfo {
  aqi: number;
  category: string;
  healthMessage: string;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
    co: number;
  };
  recommendations: string[];
}

interface AirQualityDataProps {
  location: LocationData;
}

export const AirQualityData: React.FC<AirQualityDataProps> = ({ location }) => {
  const [airQualityData, setAirQualityData] = useState<AirQualityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getAQIInfo = (aqi: number) => {
    if (aqi <= 50) {
      return {
        category: 'Good',
        healthMessage: 'Air quality is satisfactory, and air pollution poses little or no risk.',
        color: 'health-good',
        bgColor: 'bg-health-good',
        textColor: 'text-health-good-foreground',
        icon: CheckCircle,
        recommendations: [
          'Perfect conditions for outdoor activities',
          'Enjoy your time outside',
          'All groups can be active outdoors'
        ]
      };
    } else if (aqi <= 100) {
      return {
        category: 'Moderate',
        healthMessage: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
        color: 'health-moderate',
        bgColor: 'bg-health-moderate',
        textColor: 'text-health-moderate-foreground',
        icon: AlertTriangle,
        recommendations: [
          'Unusually sensitive people should limit outdoor exertion',
          'Consider reducing time spent outdoors if experiencing symptoms',
          'Generally safe for most people'
        ]
      };
    } else if (aqi <= 150) {
      return {
        category: 'Unhealthy for Sensitive Groups',
        healthMessage: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        color: 'health-unhealthy-sensitive',
        bgColor: 'bg-health-unhealthy-sensitive',
        textColor: 'text-health-unhealthy-sensitive-foreground',
        icon: AlertTriangle,
        recommendations: [
          'Sensitive groups should limit outdoor exertion',
          'People with heart or lung disease should reduce outdoor activities',
          'Watch for symptoms like coughing or shortness of breath'
        ]
      };
    } else if (aqi <= 200) {
      return {
        category: 'Unhealthy',
        healthMessage: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
        color: 'health-unhealthy',
        bgColor: 'bg-health-unhealthy',
        textColor: 'text-health-unhealthy-foreground',
        icon: XCircle,
        recommendations: [
          'Everyone should limit outdoor exertion',
          'Sensitive groups should avoid outdoor activities',
          'Consider staying indoors with windows closed'
        ]
      };
    } else {
      return {
        category: 'Hazardous',
        healthMessage: 'Health alert: The risk of health effects is increased for everyone.',
        color: 'health-hazardous',
        bgColor: 'bg-health-hazardous',
        textColor: 'text-health-hazardous-foreground',
        icon: XCircle,
        recommendations: [
          'Everyone should avoid outdoor activities',
          'Stay indoors with air filtration if possible',
          'Seek medical attention if experiencing symptoms'
        ]
      };
    }
  };

  const fetchAirQualityData = async () => {
    if (!location) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call with realistic AQI data
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // In production, this would use IQAir API:
      // const response = await fetch(
      //   `https://api.airvisual.com/v2/nearest_city?lat=${location.lat}&lon=${location.lon}&key=${API_KEY}`
      // );
      
      // Generate realistic AQI based on location (urban areas tend to have higher AQI)
      const baseAQI = 30 + Math.random() * 120; // Range 30-150
      const aqi = Math.round(baseAQI);
      const aqiInfo = getAQIInfo(aqi);
      
      const simulatedData: AirQualityInfo = {
        aqi,
        category: aqiInfo.category,
        healthMessage: aqiInfo.healthMessage,
        pollutants: {
          pm25: Math.round((10 + Math.random() * 40) * 10) / 10,
          pm10: Math.round((15 + Math.random() * 50) * 10) / 10,
          no2: Math.round((20 + Math.random() * 60) * 10) / 10,
          o3: Math.round((80 + Math.random() * 40) * 10) / 10,
          so2: Math.round((5 + Math.random() * 20) * 10) / 10,
          co: Math.round((0.5 + Math.random() * 2) * 100) / 100,
        },
        recommendations: aqiInfo.recommendations,
      };
      
      setAirQualityData(simulatedData);
      setLastUpdated(new Date());
      
      toast({
        title: "Air Quality Updated",
        description: `Current AQI: ${aqi} (${aqiInfo.category})`,
        variant: aqi > 100 ? "destructive" : "default",
      });
    } catch (err) {
      setError('Failed to fetch air quality data');
      toast({
        title: "Air Quality Error",
        description: "Unable to fetch air quality data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchAirQualityData();
    }
  }, [location]);

  return (
    <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Wind className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Air Quality Index</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAirQualityData}
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

      {isLoading && !airQualityData && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Fetching air quality data...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <div className="p-3 rounded-xl bg-destructive/10 w-fit mx-auto mb-4">
            <Wind className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-destructive mb-4 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchAirQualityData} className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10">
            Try Again
          </Button>
        </div>
      )}

      {airQualityData && (
        <div className="space-y-8">
          {/* AQI Display */}
          <div className="text-center pb-8 border-b border-white/20">
            <div className="text-5xl font-bold mb-4 text-foreground">
              {airQualityData.aqi}
            </div>
            <Badge 
              className={`${getAQIInfo(airQualityData.aqi).bgColor} ${getAQIInfo(airQualityData.aqi).textColor} mb-6 px-4 py-2 text-sm`}
            >
              {airQualityData.category}
            </Badge>
            <div className="mb-4">
              <Progress value={(airQualityData.aqi / 200) * 100} className="h-3 rounded-full" />
            </div>
          </div>

          {/* Health Message */}
          <div className="flex items-start space-x-4 p-6 rounded-2xl bg-gradient-to-r from-accent/20 to-accent/30 border border-accent/40">
            {React.createElement(getAQIInfo(airQualityData.aqi).icon, {
              className: `h-6 w-6 text-${getAQIInfo(airQualityData.aqi).color} mt-1 flex-shrink-0`
            })}
            <div>
              <div className="font-semibold mb-2 text-lg text-foreground">Health Impact</div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {airQualityData.healthMessage}
              </div>
            </div>
          </div>

          {/* Pollutants */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Key Pollutants (μg/m³)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/30 border border-secondary/40">
                <span className="text-sm font-medium text-secondary-foreground">PM2.5</span>
                <span className="font-bold text-xl text-secondary-foreground">{airQualityData.pollutants.pm25}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/30 border border-secondary/40">
                <span className="text-sm font-medium text-secondary-foreground">PM10</span>
                <span className="font-bold text-xl text-secondary-foreground">{airQualityData.pollutants.pm10}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/30 border border-accent/40">
                <span className="text-sm font-medium text-accent-foreground">NO₂</span>
                <span className="font-bold text-xl text-accent-foreground">{airQualityData.pollutants.no2}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/30 border border-accent/40">
                <span className="text-sm font-medium text-accent-foreground">O₃</span>
                <span className="font-bold text-xl text-accent-foreground">{airQualityData.pollutants.o3}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/60 border border-muted/60">
                <span className="text-sm font-medium text-muted-foreground">SO₂</span>
                <span className="font-bold text-xl text-muted-foreground">{airQualityData.pollutants.so2}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/60 border border-muted/60">
                <span className="text-sm font-medium text-muted-foreground">CO</span>
                <span className="font-bold text-xl text-muted-foreground">{airQualityData.pollutants.co}</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Health Recommendations</h3>
            <div className="space-y-3">
              {airQualityData.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-white/50 border border-white/30">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <span className="text-sm leading-relaxed text-foreground">{rec}</span>
                </div>
              ))}
            </div>
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