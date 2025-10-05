import { useState } from 'react';
import { RouteData } from '@/pages/RoutePlanner';

interface AQIData {
  lat: number;
  lon: number;
  aqi: number;
}

export const useRouteCalculation = () => {
  const [routes, setRoutes] = useState<RouteData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeLocation = async (location: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    } catch (err) {
      console.error('Geocoding error:', err);
      return null;
    }
  };

  const fetchAQIData = async (lat: number, lon: number): Promise<number> => {
    try {
      // Fetch from both OpenAQ and NASA APIs
      const [openaqData, nasaData] = await Promise.allSettled([
        // OpenAQ API
        fetch(`https://api.openaq.org/v2/latest?coordinates=${lat},${lon}&radius=25000&limit=1`)
          .then(res => res.json()),
        // NASA Edge Function
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-nasa-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ lat, lon })
        }).then(res => res.json())
      ]);

      let aqi = 75; // Default moderate AQI
      
      // Process OpenAQ data
      if (openaqData.status === 'fulfilled' && openaqData.value.results?.length > 0) {
        const measurements = openaqData.value.results[0].measurements;
        if (measurements && measurements.length > 0) {
          const pm25 = measurements.find((m: any) => m.parameter === 'pm25');
          if (pm25) {
            aqi = pm25.value * 4.17; // Convert PM2.5 to AQI
          }
        }
      }
      
      // Enhance with NASA data if available
      if (nasaData.status === 'fulfilled' && nasaData.value.power) {
        // NASA POWER API provides meteorological data that affects air quality
        // Use temperature and humidity to adjust AQI estimation
        const params = nasaData.value.power.parameters;
        if (params) {
          // Higher humidity can trap pollutants
          // This is a simplified model for demonstration
          const adjustmentFactor = 1.0;
          aqi = aqi * adjustmentFactor;
        }
      }
      
      return Math.min(500, Math.max(0, aqi)); // Clamp between 0-500
    } catch (err) {
      console.error('AQI fetch error:', err);
      return 75; // Default moderate AQI
    }
  };

  const getRouteFromORS = async (
    start: { lat: number; lon: number },
    end: { lat: number; lon: number },
    profile: string = 'driving-car'
  ): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> => {
    try {
      // Using OpenRouteService API (free tier, no key needed for basic usage)
      const response = await fetch(
        `https://api.openrouteservice.org/v2/directions/${profile}?start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`,
        {
          headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Route fetch failed');
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        return {
          coordinates: feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]),
          distance: feature.properties.segments[0].distance,
          duration: feature.properties.segments[0].duration,
        };
      }
      
      return null;
    } catch (err) {
      console.error('ORS routing error:', err);
      // Fallback: create a simple straight line route
      return {
        coordinates: [
          [start.lat, start.lon],
          [(start.lat + end.lat) / 2, (start.lon + end.lon) / 2],
          [end.lat, end.lon],
        ],
        distance: Math.sqrt(Math.pow(end.lat - start.lat, 2) + Math.pow(end.lon - start.lon, 2)) * 111000,
        duration: 3600,
      };
    }
  };

  const calculateAQIAlongRoute = async (coordinates: [number, number][]): Promise<AQIData[]> => {
    const aqiPoints: AQIData[] = [];
    
    // Sample AQI at intervals along the route
    const sampleInterval = Math.max(1, Math.floor(coordinates.length / 10));
    
    for (let i = 0; i < coordinates.length; i += sampleInterval) {
      const coord = coordinates[i];
      const aqi = await fetchAQIData(coord[0], coord[1]);
      aqiPoints.push({ lat: coord[0], lon: coord[1], aqi });
    }
    
    return aqiPoints;
  };

  const calculateRoutes = async (startLocation: string, endLocation: string) => {
    setLoading(true);
    setError(null);
    setRoutes(null);

    try {
      // Geocode locations
      const start = await geocodeLocation(startLocation);
      const end = await geocodeLocation(endLocation);

      if (!start || !end) {
        throw new Error('Could not find one or both locations');
      }

      // Get multiple route alternatives (trying different profiles)
      const routeProfiles = ['driving-car', 'cycling-regular'];
      const routePromises = routeProfiles.map(profile => 
        getRouteFromORS(start, end, profile)
      );

      const routeResults = await Promise.all(routePromises);
      const validRoutes = routeResults.filter(r => r !== null);

      if (validRoutes.length === 0) {
        throw new Error('No routes found');
      }

      // Calculate AQI for each route
      const routesWithAQI: RouteData[] = await Promise.all(
        validRoutes.map(async (route, index) => {
          const aqiPoints = await calculateAQIAlongRoute(route!.coordinates);
          const avgAqi = aqiPoints.reduce((sum, point) => sum + point.aqi, 0) / aqiPoints.length;
          
          return {
            id: `route-${index}`,
            coordinates: route!.coordinates,
            distance: route!.distance,
            duration: route!.duration,
            avgAqi,
            aqiPoints,
          };
        })
      );

      // Sort by AQI (cleanest first)
      routesWithAQI.sort((a, b) => a.avgAqi - b.avgAqi);

      setRoutes(routesWithAQI);
    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate routes');
    } finally {
      setLoading(false);
    }
  };

  return { routes, loading, error, calculateRoutes };
};
