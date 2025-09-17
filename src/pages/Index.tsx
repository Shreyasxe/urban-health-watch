import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InteractiveMap } from '@/components/InteractiveMap';
import { LocationSearch } from '@/components/LocationSearch';
import { HealthAlerts } from '@/components/HealthAlerts';
import { EducationalTips } from '@/components/EducationalTips';
import { FeedbackForm } from '@/components/FeedbackForm';
import { SavedLocations } from '@/components/SavedLocations';
import { WeatherData } from '@/components/WeatherData';
import { AirQualityData } from '@/components/AirQualityData';
import { MapPin, Leaf, Thermometer, Wind, AlertTriangle, BookOpen, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  timestamp: number;
}

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [activeTab, setActiveTab] = useState('map');

  // Load saved locations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('smartwellbeing-locations');
    if (saved) {
      try {
        setSavedLocations(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved locations:', error);
      }
    }
  }, []);

  // Save location to localStorage and state
  const handleSaveLocation = (location: LocationData) => {
    const exists = savedLocations.find(loc => loc.id === location.id);
    if (!exists) {
      const updated = [...savedLocations, location];
      setSavedLocations(updated);
      localStorage.setItem('smartwellbeing-locations', JSON.stringify(updated));
      toast({
        title: "Location Saved",
        description: `${location.name} has been added to your saved locations.`,
      });
    }
  };

  // Remove saved location
  const handleRemoveLocation = (locationId: string) => {
    const updated = savedLocations.filter(loc => loc.id !== locationId);
    setSavedLocations(updated);
    localStorage.setItem('smartwellbeing-locations', JSON.stringify(updated));
    toast({
      title: "Location Removed",
      description: "Location has been removed from your saved locations.",
    });
  };

  // Handle location selection
  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    toast({
      title: "Location Selected",
      description: `Now showing environmental data for ${location.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-earth shadow-environmental">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SmartWellbeing</h1>
                <p className="text-white/80">City Health Tracker</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
              NASA Earth Data Powered
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Location Search & Saved Locations */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-data-card">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Search Location</h2>
              </div>
              <LocationSearch onLocationSelect={handleLocationSelect} />
            </Card>

            <SavedLocations 
              locations={savedLocations}
              onLocationSelect={handleLocationSelect}
              onRemoveLocation={handleRemoveLocation}
            />

            <HealthAlerts location={selectedLocation} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="map" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Map</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center space-x-2">
                  <Thermometer className="h-4 w-4" />
                  <span>Environmental Data</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Health Tips</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-6">
                <Card className="shadow-data-card">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Interactive Environmental Map</h2>
                      </div>
                      {selectedLocation && (
                        <Button 
                          onClick={() => handleSaveLocation(selectedLocation)}
                          variant="outline"
                          size="sm"
                        >
                          Save Location
                        </Button>
                      )}
                    </div>
                    <div className="h-[600px] rounded-lg overflow-hidden">
                      <InteractiveMap 
                        selectedLocation={selectedLocation}
                        onLocationSelect={handleLocationSelect}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                {selectedLocation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WeatherData location={selectedLocation} />
                    <AirQualityData location={selectedLocation} />
                  </div>
                ) : (
                  <Card className="p-12 text-center shadow-data-card">
                    <Wind className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Select a Location</h3>
                    <p className="text-muted-foreground">
                      Choose a location from the map or search to view environmental data.
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="tips">
                <EducationalTips />
              </TabsContent>

              <TabsContent value="feedback">
                <FeedbackForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;