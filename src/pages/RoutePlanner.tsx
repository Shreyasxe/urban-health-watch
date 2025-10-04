import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RouteMap } from '@/components/RouteMap';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { Link } from 'react-router-dom';

export interface RouteData {
  id: string;
  coordinates: [number, number][];
  distance: number;
  duration: number;
  avgAqi: number;
  aqiPoints: Array<{ lat: number; lon: number; aqi: number }>;
}

const RoutePlanner: React.FC = () => {
  const { t } = useTranslation();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
  const { routes, loading, error, calculateRoutes } = useRouteCalculation();

  const handleFindRoutes = () => {
    if (startLocation && endLocation) {
      calculateRoutes(startLocation, endLocation);
    }
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'health-good';
    if (aqi <= 100) return 'health-moderate';
    if (aqi <= 150) return 'health-unhealthy';
    return 'health-hazardous';
  };

  const getCleanestRoute = () => {
    if (!routes || routes.length === 0) return null;
    return routes.reduce((prev, current) => 
      current.avgAqi < prev.avgAqi ? current : prev
    );
  };

  const cleanestRoute = getCleanestRoute();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.back')}
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{t('routing.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('routing.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Route Input & Results */}
          <div className="lg:col-span-1 space-y-4">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  {t('routing.findRoutes')}
                </CardTitle>
                <CardDescription>
                  {t('routing.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('routing.from')}
                  </label>
                  <Input
                    placeholder="e.g., Bangalore, India"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('routing.to')}
                  </label>
                  <Input
                    placeholder="e.g., Mysore, India"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleFindRoutes} 
                  disabled={loading || !startLocation || !endLocation}
                  className="w-full"
                >
                  {loading ? t('routing.calculating') : t('routing.findRoutes')}
                </Button>
              </CardContent>
            </Card>

            {/* Alert for cleaner route */}
            {cleanestRoute && routes && routes.length > 1 && (
              <Alert className="border-health-good bg-health-good/10">
                <AlertTriangle className="h-4 w-4 text-health-good" />
                <AlertDescription className="text-health-good font-medium">
                  {t('routing.alert')}
                </AlertDescription>
              </Alert>
            )}

            {/* Routes List */}
            {routes && routes.length > 0 && (
              <div className="space-y-3">
                {routes.map((route, index) => {
                  const isCleanest = route.id === cleanestRoute?.id;
                  const cleanerPercent = cleanestRoute 
                    ? Math.round(((route.avgAqi - cleanestRoute.avgAqi) / cleanestRoute.avgAqi) * 100)
                    : 0;
                  
                  return (
                    <Card 
                      key={route.id}
                      className={`cursor-pointer transition-all ${
                        selectedRoute === route.id 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedRoute(route.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {t('routing.route')} {index + 1}
                              </h3>
                              {isCleanest && (
                                <Badge variant="default" className="bg-health-good">
                                  {t('routing.recommended')}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`bg-${getAqiColor(route.avgAqi)}/20`}>
                                {t('routing.avgAqi')}: {route.avgAqi.toFixed(0)}
                              </Badge>
                              {!isCleanest && cleanerPercent > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  +{cleanerPercent}% AQI
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex justify-between">
                            <span>{t('routing.distance')}:</span>
                            <span className="font-medium">{(route.distance / 1000).toFixed(1)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('routing.duration')}:</span>
                            <span className="font-medium">
                              {Math.round(route.duration / 60)} min
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!loading && routes && routes.length === 0 && startLocation && endLocation && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  {t('routing.noRoutes')}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)]">
              <CardContent className="p-0 h-full">
                <RouteMap 
                  routes={routes || []}
                  selectedRouteId={selectedRoute}
                  onRouteSelect={setSelectedRoute}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
