import React, { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, Layers, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

// Indian state coordinates (approximate centers)
const STATE_COORDINATES: Record<string, [number, number]> = {
  "Andaman & Nicobar": [92.9375, 11.7401],
  "Andhra Pradesh": [79.74, 15.9129],
  "Arunachal Pradesh": [94.7278, 28.218],
  "Assam": [92.9376, 26.2006],
  "Bihar": [85.3131, 25.0961],
  "Chandigarh": [76.7794, 30.7333],
  "Chhattisgarh": [81.8661, 21.2787],
  "DNH & DD": [73.0169, 20.1809],
  "Delhi": [77.1025, 28.7041],
  "Goa": [74.124, 15.2993],
  "Gujarat": [71.1924, 22.2587],
  "Haryana": [76.0856, 29.0588],
  "Himachal Pradesh": [77.1734, 31.1048],
  "Jammu & Kashmir": [74.797, 33.7782],
  "Jharkhand": [85.2799, 23.6102],
  "Karnataka": [75.7139, 15.3173],
  "Kerala": [76.2711, 10.8505],
  "Ladakh": [77.577, 34.1526],
  "Lakshadweep": [72.6369, 10.5667],
  "Madhya Pradesh": [78.6569, 22.9734],
  "Maharashtra": [75.7139, 19.7515],
  "Manipur": [93.9063, 24.6637],
  "Meghalaya": [91.3662, 25.467],
  "Mizoram": [92.9376, 23.1645],
  "Nagaland": [94.5624, 26.1584],
  "Odisha": [85.0985, 20.9517],
  "Puducherry": [79.8083, 11.9416],
  "Punjab": [75.3412, 31.1471],
  "Rajasthan": [74.2179, 27.0238],
  "Sikkim": [88.5122, 27.533],
  "Tamil Nadu": [78.6569, 11.1271],
  "Telangana": [79.0193, 18.1124],
  "Tripura": [91.9882, 23.9408],
  "Uttar Pradesh": [80.9462, 26.8467],
  "Uttarakhand": [79.0193, 30.0668],
  "West Bengal": [87.855, 22.9868],
};

interface Centre {
  centre_id: string;
  centre_name: string;
  centre_type: string;
  state: string;
  district: string | null;
  operational_status: string | null;
  programme_subtype: string | null;
}

interface CentreSportLink {
  centre_id: string;
  sport_name: string | null;
  discipline_name: string | null;
}

interface IndiaMapProps {
  centres: Centre[];
  centreSportLinks?: CentreSportLink[];
  selectedState?: string;
  selectedCentreType?: string;
  selectedSport?: string;
}

const CENTRE_TYPE_COLORS: Record<string, string> = {
  "NCOE": "#ef4444",
  "STC": "#3b82f6",
  "KIC": "#22c55e",
  "KISCE": "#f59e0b",
};

const IndiaMap: React.FC<IndiaMapProps> = ({
  centres,
  centreSportLinks = [],
  selectedState,
  selectedCentreType,
  selectedSport,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);

  // Fetch Mapbox token from edge function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setTokenError('Mapbox token not configured');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setTokenError('Failed to load map configuration');
      } finally {
        setIsLoadingToken(false);
      }
    };
    fetchToken();
  }, []);

  // Filter centres based on selections
  const filteredCentres = useMemo(() => {
    let filtered = centres;
    
    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter(c => c.state === selectedState);
    }
    
    if (selectedCentreType && selectedCentreType !== "all") {
      filtered = filtered.filter(c => c.centre_type === selectedCentreType);
    }
    
    if (selectedSport && selectedSport !== "all") {
      const centreIdsWithSport = new Set(
        centreSportLinks
          .filter(link => link.sport_name === selectedSport)
          .map(link => link.centre_id)
      );
      filtered = filtered.filter(c => centreIdsWithSport.has(c.centre_id));
    }
    
    return filtered;
  }, [centres, selectedState, selectedCentreType, selectedSport, centreSportLinks]);

  // Aggregate centres by state
  const stateAggregates = useMemo(() => {
    const aggregates: Record<string, {
      total: number;
      byType: Record<string, number>;
      centres: Centre[];
    }> = {};
    
    filteredCentres.forEach(centre => {
      if (!aggregates[centre.state]) {
        aggregates[centre.state] = { total: 0, byType: {}, centres: [] };
      }
      aggregates[centre.state].total++;
      aggregates[centre.state].byType[centre.centre_type] = 
        (aggregates[centre.state].byType[centre.centre_type] || 0) + 1;
      aggregates[centre.state].centres.push(centre);
    });
    
    return aggregates;
  }, [filteredCentres]);

  // Get sports for a centre
  const getSportsForCentre = (centreId: string) => {
    return centreSportLinks
      .filter(link => link.centre_id === centreId)
      .map(link => link.sport_name)
      .filter((sport, idx, arr) => sport && arr.indexOf(sport) === idx);
  };

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 22.5937], // Center of India
      zoom: 4,
      pitch: 30,
      bearing: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Create markers for each state
    Object.entries(stateAggregates).forEach(([state, data]) => {
      const coords = STATE_COORDINATES[state];
      if (!coords) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      // Size based on total centres
      const size = Math.min(60, Math.max(30, 20 + data.total * 0.5));
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      el.style.color = 'white';
      el.style.cursor = 'pointer';
      el.style.transition = 'transform 0.2s';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
      
      // Determine dominant type for color
      const dominantType = Object.entries(data.byType)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'KIC';
      
      // Create gradient background
      const typeColors = Object.entries(data.byType).map(([type]) => CENTRE_TYPE_COLORS[type] || '#888');
      if (typeColors.length === 1) {
        el.style.background = typeColors[0];
      } else {
        el.style.background = `linear-gradient(135deg, ${typeColors.join(', ')})`;
      }
      
      el.textContent = data.total.toString();
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
        setHoveredState(state);
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        setHoveredState(null);
      });

      // Create popup content
      const popupContent = `
        <div class="p-3 max-w-xs">
          <h3 class="font-bold text-lg mb-2">${state}</h3>
          <p class="text-sm mb-2">Total Centres: <strong>${data.total}</strong></p>
          <div class="space-y-1">
            ${Object.entries(data.byType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => `
                <div class="flex justify-between items-center text-sm">
                  <span class="flex items-center gap-1">
                    <span class="w-3 h-3 rounded-full" style="background: ${CENTRE_TYPE_COLORS[type] || '#888'}"></span>
                    ${type}
                  </span>
                  <span class="font-medium">${count}</span>
                </div>
              `).join('')}
          </div>
          <div class="mt-3 pt-2 border-t border-gray-600">
            <p class="text-xs text-gray-400">Click for detailed list</p>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'custom-popup',
      }).setHTML(popupContent);

      el.addEventListener('click', () => {
        if (popupRef.current) {
          popupRef.current.remove();
        }
        
        // Create detailed popup
        const detailContent = `
          <div class="p-3 max-w-md max-h-80 overflow-y-auto">
            <h3 class="font-bold text-lg mb-2">${state}</h3>
            <p class="text-sm mb-3">Total Centres: <strong>${data.total}</strong></p>
            <div class="space-y-2">
              ${data.centres.slice(0, 10).map(centre => `
                <div class="p-2 bg-gray-800 rounded text-xs">
                  <div class="font-medium">${centre.centre_name}</div>
                  <div class="flex gap-2 mt-1">
                    <span class="px-1.5 py-0.5 rounded text-white text-[10px]" style="background: ${CENTRE_TYPE_COLORS[centre.centre_type] || '#888'}">${centre.centre_type}</span>
                    ${centre.district ? `<span class="text-gray-400">${centre.district}</span>` : ''}
                  </div>
                  ${getSportsForCentre(centre.centre_id).length > 0 ? `
                    <div class="mt-1 text-gray-400">
                      Sports: ${getSportsForCentre(centre.centre_id).slice(0, 3).join(', ')}${getSportsForCentre(centre.centre_id).length > 3 ? '...' : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
              ${data.centres.length > 10 ? `<p class="text-center text-gray-400 text-xs">+ ${data.centres.length - 10} more centres</p>` : ''}
            </div>
          </div>
        `;
        
        popupRef.current = new mapboxgl.Popup({
          offset: 25,
          className: 'custom-popup detailed',
        })
          .setLngLat(coords)
          .setHTML(detailContent)
          .addTo(map.current!);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [stateAggregates, mapLoaded, centreSportLinks]);

  // Fly to selected state
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedState || selectedState === "all") {
      if (map.current && mapLoaded) {
        map.current.flyTo({
          center: [78.9629, 22.5937],
          zoom: 4,
          pitch: 30,
        });
      }
      return;
    }

    const coords = STATE_COORDINATES[selectedState];
    if (coords) {
      map.current.flyTo({
        center: coords,
        zoom: 6,
        pitch: 45,
      });
    }
  }, [selectedState, mapLoaded]);

  if (isLoadingToken) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-muted-foreground">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <Layers className="h-4 w-4" />
          Centre Types
        </h4>
        <div className="space-y-1">
          {Object.entries(CENTRE_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
        <div className="text-xs text-muted-foreground">Showing</div>
        <div className="text-2xl font-bold">{filteredCentres.length}</div>
        <div className="text-xs text-muted-foreground">centres across {Object.keys(stateAggregates).length} states</div>
      </div>

      {/* Hovered state info */}
      {hoveredState && stateAggregates[hoveredState] && (
        <div className="absolute top-4 right-16 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border">
          <div className="font-semibold">{hoveredState}</div>
          <div className="text-sm text-muted-foreground">
            {stateAggregates[hoveredState].total} centres
          </div>
        </div>
      )}

      {/* Custom CSS for popups */}
      <style>{`
        .mapboxgl-popup-content {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: hsl(var(--background)) !important;
        }
        .mapboxgl-popup.detailed .mapboxgl-popup-content {
          max-height: 350px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default IndiaMap;
