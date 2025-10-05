import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();
    
    if (!lat || !lon) {
      throw new Error('Latitude and longitude are required');
    }

    const NASA_API_KEY = Deno.env.get('NASA_API_KEY');
    
    // Fetch data from NASA POWER API (Air Quality and Meteorological data)
    const powerResponse = await fetch(
      `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PS,T2M,RH2M,PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=20240101&end=20240101&format=JSON`
    );
    
    const powerData = await powerResponse.json();
    
    // Fetch from NASA EarthData API if available
    let earthData = null;
    if (NASA_API_KEY) {
      try {
        const earthResponse = await fetch(
          `https://api.earthdata.nasa.gov/v1/air-quality?lat=${lat}&lon=${lon}`,
          {
            headers: {
              'Authorization': `Bearer ${NASA_API_KEY}`
            }
          }
        );
        
        if (earthResponse.ok) {
          earthData = await earthResponse.json();
        }
      } catch (err) {
        console.error('EarthData API error:', err);
      }
    }

    // Process and return combined NASA data
    const result = {
      location: { lat, lon },
      power: powerData,
      earthData,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error fetching NASA data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
