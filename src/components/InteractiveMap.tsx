import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData } from '@/pages/Index';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface InteractiveMapProps {
  selectedLocation: LocationData | null;
  onLocationSelect: (location: LocationData) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  selectedLocation,
  onLocationSelect,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current, {
      center: [40.7128, -74.0060], // Default to New York
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);

    // Add click handler for map
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      try {
        // Reverse geocoding to get place name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();
        
        const locationName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        const newLocation: LocationData = {
          id: `${lat}_${lng}_${Date.now()}`,
          name: locationName.split(',').slice(0, 3).join(', '), // Simplified name
          lat,
          lon: lng,
          timestamp: Date.now(),
        };
        
        onLocationSelect(newLocation);
      } catch (error) {
        console.error('Error getting location name:', error);
        // Fallback to coordinates
        const newLocation: LocationData = {
          id: `${lat}_${lng}_${Date.now()}`,
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat,
          lon: lng,
          timestamp: Date.now(),
        };
        onLocationSelect(newLocation);
      }
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationSelect]);

  // Update marker when location changes
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;

    // Remove existing marker
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lon])
      .addTo(mapRef.current)
      .bindPopup(`
        <div style="font-family: system-ui, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${selectedLocation.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #666;">
            Lat: ${selectedLocation.lat.toFixed(4)}<br>
            Lon: ${selectedLocation.lon.toFixed(4)}
          </p>
          <div style="margin-top: 8px; font-size: 11px; color: #888;">
            Click on map to select different location
          </div>
        </div>
      `)
      .openPopup();

    // Center map on selected location
    mapRef.current.setView([selectedLocation.lat, selectedLocation.lon], 12);
  }, [selectedLocation]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-xs text-muted-foreground mb-2">Map Layers</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-good rounded-full"></div>
            <span className="text-xs">Good Air Quality</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-moderate rounded-full"></div>
            <span className="text-xs">Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-health-unhealthy rounded-full"></div>
            <span className="text-xs">Unhealthy</span>
          </div>
        </div>
      </div>
    </div>
  );
};