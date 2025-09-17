import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, X, Clock } from 'lucide-react';
import { LocationData } from '@/pages/Index';

interface SavedLocationsProps {
  locations: LocationData[];
  onLocationSelect: (location: LocationData) => void;
  onRemoveLocation: (locationId: string) => void;
}

export const SavedLocations: React.FC<SavedLocationsProps> = ({
  locations,
  onLocationSelect,
  onRemoveLocation,
}) => {
  if (locations.length === 0) {
    return (
      <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-xl bg-muted/30">
            <MapPin className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Saved Locations</h2>
        </div>
        <div className="text-center py-8">
          <div className="p-3 rounded-xl bg-muted/30 w-fit mx-auto mb-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">No saved locations yet</p>
          <p className="text-xs text-muted-foreground">
            Search and select locations to save them for quick access
          </p>
        </div>
      </Card>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="p-8 shadow-card-elegant hover:shadow-card-hover transition-all duration-300 bg-gradient-card border-0 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <MapPin className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Saved Locations</h2>
        <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary border-0">{locations.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {locations.map((location) => (
          <div
            key={location.id}
            className="group flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/70 border border-white/30 hover:border-primary/30 transition-all duration-200"
          >
            <button
              onClick={() => onLocationSelect(location)}
              className="flex-1 flex items-start space-x-3 text-left min-w-0"
            >
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {location.name}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="text-xs text-muted-foreground">
                    {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimestamp(location.timestamp)}</span>
                  </div>
                </div>
              </div>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveLocation(location.id);
              }}
              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/30">
        <p className="text-xs text-muted-foreground text-center">
          Click any location to view its environmental data
        </p>
      </div>
    </Card>
  );
};