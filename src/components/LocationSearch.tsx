import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { LocationData } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface LocationSearchProps {
  onLocationSelect: (location: LocationData) => void;
}

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchLocations = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au,de,fr,it,es,nl,se,no,dk,fi,in`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data: SearchResult[] = await response.json();
      setResults(data);
      setShowResults(data.length > 0);
    } catch (error) {
      console.error('Location search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to search locations. Please try again.",
        variant: "destructive",
      });
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSelectLocation = (result: SearchResult) => {
    const location: LocationData = {
      id: result.place_id,
      name: result.display_name.split(',').slice(0, 2).join(', '), // Simplified name
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      timestamp: Date.now(),
    };
    
    onLocationSelect(location);
    setQuery(location.name);
    setShowResults(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocations(query);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search for a city or location..."
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-12"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
          )}
        </div>
        <Button type="submit" className="w-full" disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Location
            </>
          )}
        </Button>
      </form>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto shadow-lg">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelectLocation(result)}
                className="w-full text-left p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {result.display_name.split(',').slice(0, 2).join(', ')}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {result.display_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};