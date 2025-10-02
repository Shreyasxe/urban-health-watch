import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
import { MapPin, Leaf, Thermometer, Wind, AlertTriangle, BookOpen, MessageCircle, LogOut, Bell, MapPinned, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { User, Session } from '@supabase/supabase-js';

export interface LocationData {
  id: string;
  name: string;
  lat: number;
  lon: number;
  timestamp: number;
}

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [savedLocations, setSavedLocations] = useState<LocationData[]>([]);
  const [activeTab, setActiveTab] = useState('map');
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const { 
    locationPermission, 
    notificationPermission, 
    requestLocationPermission, 
    requestNotificationPermission 
  } = usePermissions();

  // Auth check
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Request permissions after auth
  useEffect(() => {
    if (user && (locationPermission === 'prompt' || notificationPermission === 'default')) {
      setShowPermissionsDialog(true);
    }
  }, [user, locationPermission, notificationPermission]);

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

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Handle permissions request
  const handleRequestPermissions = async () => {
    if (locationPermission !== 'granted') {
      await requestLocationPermission();
    }
    if (notificationPermission !== 'granted') {
      await requestNotificationPermission();
    }
    setShowPermissionsDialog(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="relative border-b bg-gradient-hero shadow-environmental backdrop-blur-sm">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-lg">
                <Shield className="h-10 w-10 text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-sm tracking-tight">Air Quality Guardian</h1>
                <p className="text-white/90 text-lg font-medium">City Health Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30 px-4 py-2 text-sm font-medium">
                NASA Earth Data Powered
              </Badge>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Location Search & Saved Locations */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-xl bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Search Location</h2>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm border border-white/50 p-2 rounded-2xl shadow-card-elegant">
                <TabsTrigger value="map" className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Map</span>
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <Thermometer className="h-4 w-4" />
                  <span className="hidden sm:inline">Data</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Tips</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center space-x-2 rounded-xl transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-md">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Feedback</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="space-y-8">
                <Card className="shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">Interactive Environmental Map</h2>
                      </div>
                      {selectedLocation && (
                        <Button 
                          onClick={() => handleSaveLocation(selectedLocation)}
                          variant="outline"
                          size="sm"
                          className="bg-white/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all duration-200"
                        >
                          Save Location
                        </Button>
                      )}
                    </div>
                    <div className="h-[600px] rounded-2xl overflow-hidden shadow-card-elegant">
                      <InteractiveMap 
                        selectedLocation={selectedLocation}
                        onLocationSelect={handleLocationSelect}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="space-y-8">
                {selectedLocation ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <WeatherData location={selectedLocation} />
                    <AirQualityData location={selectedLocation} />
                  </div>
                ) : (
                  <Card className="p-16 text-center shadow-card-elegant bg-gradient-card border-0 backdrop-blur-sm">
                    <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-6">
                      <Wind className="h-16 w-16 text-primary" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-foreground">Select a Location</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
                      Choose a location from the map or search to view comprehensive environmental data and health insights.
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

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Features</DialogTitle>
            <DialogDescription>
              To provide the best experience, we need your permission for:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/20">
              <MapPinned className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Location Access</h4>
                <p className="text-sm text-muted-foreground">
                  Get accurate environmental data for your current location
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-lg bg-secondary/20">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive health alerts when air quality or weather conditions change
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowPermissionsDialog(false)} variant="outline" className="flex-1">
              Skip for now
            </Button>
            <Button onClick={handleRequestPermissions} className="flex-1">
              Enable
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;