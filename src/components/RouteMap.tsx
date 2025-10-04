import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RouteData } from '@/pages/RoutePlanner';

interface RouteMapProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  onRouteSelect: (routeId: string) => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({ routes, selectedRouteId, onRouteSelect }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLayersRef = useRef<{ [key: string]: L.Polyline }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946], // Bangalore as default
      zoom: 10,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update routes on map
  useEffect(() => {
    if (!mapRef.current || !routes || routes.length === 0) return;

    // Clear existing route layers
    Object.values(routeLayersRef.current).forEach(layer => {
      mapRef.current?.removeLayer(layer);
    });
    routeLayersRef.current = {};

    // Find cleanest route
    const cleanestRoute = routes.reduce((prev, current) => 
      current.avgAqi < prev.avgAqi ? current : prev
    );

    // Add new route layers
    routes.forEach((route, index) => {
      const isSelected = route.id === selectedRouteId;
      const isCleanest = route.id === cleanestRoute.id;
      
      // Determine color based on AQI
      let color = '#ef4444'; // red for high AQI
      if (route.avgAqi <= 50) color = '#22c55e'; // green
      else if (route.avgAqi <= 100) color = '#eab308'; // yellow
      else if (route.avgAqi <= 150) color = '#f97316'; // orange

      const polyline = L.polyline(route.coordinates, {
        color: color,
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.6,
        smoothFactor: 1,
      }).addTo(mapRef.current!);

      // Add popup
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Route ${index + 1}</h3>
          <div style="margin: 4px 0; font-size: 12px;">
            <strong>Avg AQI:</strong> ${route.avgAqi.toFixed(0)}
          </div>
          <div style="margin: 4px 0; font-size: 12px;">
            <strong>Distance:</strong> ${(route.distance / 1000).toFixed(1)} km
          </div>
          <div style="margin: 4px 0; font-size: 12px;">
            <strong>Duration:</strong> ${Math.round(route.duration / 60)} min
          </div>
          ${isCleanest ? '<div style="margin-top: 8px; padding: 4px 8px; background: #dcfce7; color: #166534; border-radius: 4px; font-size: 11px; font-weight: 600;">✓ Recommended</div>' : ''}
        </div>
      `;
      polyline.bindPopup(popupContent);

      // Add click handler
      polyline.on('click', () => {
        onRouteSelect(route.id);
      });

      routeLayersRef.current[route.id] = polyline;

      // Add start and end markers
      if (route.coordinates.length > 0) {
        const startCoord = route.coordinates[0];
        const endCoord = route.coordinates[route.coordinates.length - 1];

        // Start marker (green)
        L.circleMarker(startCoord, {
          radius: 8,
          fillColor: '#22c55e',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapRef.current!).bindPopup('Start');

        // End marker (red)
        L.circleMarker(endCoord, {
          radius: 8,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        }).addTo(mapRef.current!).bindPopup('Destination');
      }
    });

    // Fit map to show all routes
    if (routes.length > 0) {
      const allCoords = routes.flatMap(r => r.coordinates);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routes, selectedRouteId, onRouteSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="text-xs font-semibold mb-2">AQI Levels</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-health-good"></div>
            <span className="text-xs">Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-health-moderate"></div>
            <span className="text-xs">Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-health-unhealthy"></div>
            <span className="text-xs">Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-health-hazardous"></div>
            <span className="text-xs">Hazardous (150+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
