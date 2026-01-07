import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, AlertCircle, Loader2, RotateCcw, ZoomIn, ZoomOut, Compass, Eye, EyeOff, Search, X, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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

// Generate approximate district coordinates based on state with offset
const getDistrictCoordinates = (state: string, district: string, index: number): [number, number] => {
  const stateCoords = STATE_COORDINATES[state];
  if (!stateCoords) return [78.9629, 22.5937]; // India center
  
  // Create a deterministic offset based on district name hash
  const hash = district.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = (hash % 360) * (Math.PI / 180);
  const radius = 0.3 + (hash % 100) / 200; // 0.3 to 0.8 degrees offset
  
  return [
    stateCoords[0] + Math.cos(angle) * radius,
    stateCoords[1] + Math.sin(angle) * radius * 0.7, // Reduce latitude offset
  ];
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
  onStateSelect?: (state: string) => void;
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
  onStateSelect,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(4);
  
  // Local filter states for the map
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['NCOE', 'STC', 'KIC', 'KISCE']));
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);

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

  // Toggle centre type filter
  const toggleFilter = useCallback((type: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  }, []);

  // Reset map view
  const resetMapView = useCallback(() => {
    if (map.current) {
      map.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4,
        pitch: 0,
        bearing: 0,
      });
    }
    onStateSelect?.("all");
  }, [onStateSelect]);

  // Zoom controls
  const handleZoomIn = useCallback(() => map.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => map.current?.zoomOut(), []);

  // Change map style
  const cycleMapStyle = useCallback(() => {
    const styles = ['dark', 'light', 'satellite'] as const;
    const currentIndex = styles.indexOf(mapStyle);
    const nextStyle = styles[(currentIndex + 1) % styles.length];
    setMapStyle(nextStyle);
    
    if (map.current) {
      const styleUrls = {
        dark: 'mapbox://styles/mapbox/dark-v11',
        light: 'mapbox://styles/mapbox/light-v11',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
      };
      map.current.setStyle(styleUrls[nextStyle]);
    }
  }, [mapStyle]);

  // Search states
  const matchingStates = useMemo(() => {
    if (!searchQuery) return [];
    return Object.keys(STATE_COORDINATES).filter(state => 
      state.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Fly to searched state
  const flyToState = useCallback((state: string) => {
    const coords = STATE_COORDINATES[state];
    if (coords && map.current) {
      map.current.flyTo({
        center: coords,
        zoom: 7,
        pitch: 0,
      });
      setSearchQuery('');
      setShowSearch(false);
      onStateSelect?.(state);
    }
  }, [onStateSelect]);

  // Filter centres
  const filteredCentres = useMemo(() => {
    let filtered = centres;
    
    if (selectedState && selectedState !== "all") {
      filtered = filtered.filter(c => c.state === selectedState);
    }
    
    if (selectedCentreType && selectedCentreType !== "all") {
      filtered = filtered.filter(c => c.centre_type === selectedCentreType);
    } else {
      filtered = filtered.filter(c => activeFilters.has(c.centre_type));
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
  }, [centres, selectedState, selectedCentreType, selectedSport, centreSportLinks, activeFilters]);

  // Aggregate by district for district-level view
  const districtAggregates = useMemo(() => {
    const aggregates: Record<string, {
      state: string;
      district: string;
      total: number;
      byType: Record<string, number>;
      centres: Centre[];
      coords: [number, number];
    }> = {};
    
    filteredCentres.forEach((centre, idx) => {
      const districtKey = `${centre.state}|${centre.district || 'Unknown'}`;
      if (!aggregates[districtKey]) {
        aggregates[districtKey] = {
          state: centre.state,
          district: centre.district || 'Unknown',
          total: 0,
          byType: {},
          centres: [],
          coords: getDistrictCoordinates(centre.state, centre.district || 'Unknown', idx),
        };
      }
      aggregates[districtKey].total++;
      aggregates[districtKey].byType[centre.centre_type] = 
        (aggregates[districtKey].byType[centre.centre_type] || 0) + 1;
      aggregates[districtKey].centres.push(centre);
    });
    
    return aggregates;
  }, [filteredCentres]);

  // Aggregate by state for state-level view
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

  // Type-wise totals
  const typeTotals = useMemo(() => {
    const totals: Record<string, number> = { NCOE: 0, STC: 0, KIC: 0, KISCE: 0 };
    filteredCentres.forEach(c => {
      if (totals[c.centre_type] !== undefined) {
        totals[c.centre_type]++;
      }
    });
    return totals;
  }, [filteredCentres]);

  // Get sports for a centre
  const getSportsForCentre = useCallback((centreId: string) => {
    return centreSportLinks
      .filter(link => link.centre_id === centreId)
      .map(link => link.sport_name)
      .filter((sport, idx, arr): sport is string => !!sport && arr.indexOf(sport) === idx);
  }, [centreSportLinks]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 22.5937],
      zoom: 4,
      pitch: 0,
      bearing: 0,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    map.current.on('zoom', () => {
      setCurrentZoom(map.current?.getZoom() || 4);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update markers based on zoom level
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const showDistrictLevel = currentZoom >= 6;

    if (showDistrictLevel) {
      // District-level markers
      Object.entries(districtAggregates).forEach(([key, data]) => {
        const el = document.createElement('div');
        el.className = 'district-marker';
        
        const size = Math.min(50, Math.max(20, 15 + data.total * 3));
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '10px';
        el.style.color = 'white';
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.2s, box-shadow 0.2s';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.border = '2px solid white';
        
        const dominantType = Object.entries(data.byType)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || 'KIC';
        el.style.background = CENTRE_TYPE_COLORS[dominantType] || '#888';
        el.textContent = data.total.toString();
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
          el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        });

        // Click to show centres in district
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Create popup with centre list using safe DOM methods (XSS prevention)
          const popupContent = document.createElement('div');
          popupContent.className = 'p-3 max-w-xs max-h-80 overflow-y-auto';
          
          // Create header safely using textContent
          const heading = document.createElement('h3');
          heading.className = 'font-bold text-base mb-1';
          heading.textContent = data.district || '';
          popupContent.appendChild(heading);
          
          const stateText = document.createElement('p');
          stateText.className = 'text-xs text-gray-400 mb-2';
          stateText.textContent = data.state || '';
          popupContent.appendChild(stateText);
          
          // Create type badges container
          const badgesContainer = document.createElement('div');
          badgesContainer.className = 'flex gap-1 mb-3 flex-wrap';
          Object.entries(data.byType).forEach(([type, count]) => {
            const badge = document.createElement('span');
            badge.className = 'px-1.5 py-0.5 rounded text-[10px] text-white';
            badge.style.background = CENTRE_TYPE_COLORS[type] || '#888';
            badge.textContent = `${type}: ${count}`;
            badgesContainer.appendChild(badge);
          });
          popupContent.appendChild(badgesContainer);
          
          // Create centres list container
          const centresContainer = document.createElement('div');
          centresContainer.className = 'space-y-2';
          
          data.centres.slice(0, 10).forEach(centre => {
            const centreItem = document.createElement('div');
            centreItem.className = 'p-2 bg-gray-800/50 rounded text-xs cursor-pointer hover:bg-gray-700/50 centre-item';
            centreItem.dataset.centreId = centre.centre_id;
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'font-medium';
            nameDiv.textContent = centre.centre_name || '';
            centreItem.appendChild(nameDiv);
            
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'flex items-center gap-1 mt-1';
            
            const typeBadge = document.createElement('span');
            typeBadge.className = 'px-1 py-0.5 rounded text-[9px] text-white';
            typeBadge.style.background = CENTRE_TYPE_COLORS[centre.centre_type] || '#888';
            typeBadge.textContent = centre.centre_type || '';
            detailsDiv.appendChild(typeBadge);
            
            if (centre.operational_status) {
              const statusSpan = document.createElement('span');
              statusSpan.className = 'text-gray-400 text-[9px]';
              statusSpan.textContent = centre.operational_status;
              detailsDiv.appendChild(statusSpan);
            }
            
            centreItem.appendChild(detailsDiv);
            centresContainer.appendChild(centreItem);
          });
          
          if (data.centres.length > 10) {
            const moreText = document.createElement('p');
            moreText.className = 'text-center text-gray-400 text-[10px]';
            moreText.textContent = `+ ${data.centres.length - 10} more`;
            centresContainer.appendChild(moreText);
          }
          
          popupContent.appendChild(centresContainer);

          // Add click handlers to centre items
          setTimeout(() => {
            popupContent.querySelectorAll('.centre-item').forEach(item => {
              item.addEventListener('click', () => {
                const centreId = item.getAttribute('data-centre-id');
                const centre = data.centres.find(c => c.centre_id === centreId);
                if (centre) setSelectedCentre(centre);
              });
            });
          }, 0);

          new mapboxgl.Popup({ offset: 15, closeButton: true })
            .setLngLat(data.coords)
            .setDOMContent(popupContent)
            .addTo(map.current!);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(data.coords)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    } else {
      // State-level markers
      Object.entries(stateAggregates).forEach(([state, data]) => {
        const coords = STATE_COORDINATES[state];
        if (!coords) return;

        const el = document.createElement('div');
        el.className = 'state-marker';
        
        const size = Math.min(60, Math.max(30, 20 + data.total * 0.4));
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '11px';
        el.style.color = 'white';
        el.style.cursor = 'pointer';
        el.style.transition = 'transform 0.2s, box-shadow 0.2s';
        el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        el.style.border = '2px solid rgba(255,255,255,0.3)';
        
        // Create pie chart style background for multiple types
        const typeEntries = Object.entries(data.byType).sort((a, b) => b[1] - a[1]);
        if (typeEntries.length === 1) {
          el.style.background = CENTRE_TYPE_COLORS[typeEntries[0][0]] || '#888';
        } else {
          const total = data.total;
          let gradientParts: string[] = [];
          let currentAngle = 0;
          typeEntries.forEach(([type, count]) => {
            const angle = (count / total) * 360;
            gradientParts.push(`${CENTRE_TYPE_COLORS[type]} ${currentAngle}deg ${currentAngle + angle}deg`);
            currentAngle += angle;
          });
          el.style.background = `conic-gradient(${gradientParts.join(', ')})`;
        }
        
        el.textContent = data.total.toString();
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.15)';
          el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });

        // Click to zoom into state
        el.addEventListener('click', () => {
          if (map.current) {
            map.current.flyTo({
              center: coords,
              zoom: 7,
            });
            onStateSelect?.(state);
          }
        });

        // Tooltip on hover
        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: false,
          closeOnClick: false,
        });

        el.addEventListener('mouseenter', () => {
          // Create popup content using safe DOM methods (XSS prevention)
          const popupDiv = document.createElement('div');
          popupDiv.className = 'p-2';
          
          const stateNameDiv = document.createElement('div');
          stateNameDiv.className = 'font-semibold';
          stateNameDiv.textContent = state;
          popupDiv.appendChild(stateNameDiv);
          
          const countDiv = document.createElement('div');
          countDiv.className = 'text-xs text-gray-400';
          countDiv.textContent = `${data.total} centres`;
          popupDiv.appendChild(countDiv);
          
          const badgesDiv = document.createElement('div');
          badgesDiv.className = 'flex gap-1 mt-1 flex-wrap';
          Object.entries(data.byType).forEach(([type, count]) => {
            const badge = document.createElement('span');
            badge.className = 'px-1 py-0.5 rounded text-[9px] text-white';
            badge.style.background = CENTRE_TYPE_COLORS[type] || '#888';
            badge.textContent = `${type}: ${count}`;
            badgesDiv.appendChild(badge);
          });
          popupDiv.appendChild(badgesDiv);
          
          popup.setLngLat(coords)
            .setDOMContent(popupDiv)
            .addTo(map.current!);
        });

        el.addEventListener('mouseleave', () => {
          popup.remove();
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    }
  }, [stateAggregates, districtAggregates, mapLoaded, currentZoom, onStateSelect]);

  // Fly to selected state
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    if (!selectedState || selectedState === "all") {
      map.current.flyTo({
        center: [78.9629, 22.5937],
        zoom: 4,
        pitch: 0,
      });
      return;
    }

    const coords = STATE_COORDINATES[selectedState];
    if (coords) {
      map.current.flyTo({
        center: coords,
        zoom: 7,
        pitch: 0,
      });
    }
  }, [selectedState, mapLoaded]);

  if (isLoadingToken) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-muted-foreground">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Top Left - Stats */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border z-10">
        <div className="text-xs text-muted-foreground">Showing</div>
        <div className="text-2xl font-bold">{filteredCentres.length}</div>
        <div className="text-xs text-muted-foreground">
          centres • {Object.keys(currentZoom >= 6 ? districtAggregates : stateAggregates).length} {currentZoom >= 6 ? 'districts' : 'states'}
        </div>
        <div className="text-[10px] text-primary mt-1">
          {currentZoom >= 6 ? '📍 District view' : '🗺️ State view'}
        </div>
      </div>

      {/* Top Center - Search */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        {showSearch ? (
          <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden min-w-[250px]">
            <div className="flex items-center gap-2 p-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {matchingStates.length > 0 && (
              <div className="border-t max-h-40 overflow-y-auto">
                {matchingStates.map(state => (
                  <button
                    key={state}
                    onClick={() => flyToState(state)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    {state}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-background/95 backdrop-blur-sm shadow-lg"
            onClick={() => setShowSearch(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            Search State
          </Button>
        )}
      </div>

      {/* Bottom Left - Filter Buttons */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border z-10">
        <h4 className="text-xs font-semibold mb-2 flex items-center gap-1 text-muted-foreground">
          <Layers className="h-3 w-3" />
          FILTER BY TYPE
        </h4>
        <div className="space-y-1.5">
          {Object.entries(CENTRE_TYPE_COLORS).map(([type, color]) => {
            const isActive = activeFilters.has(type);
            const count = typeTotals[type] || 0;
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all",
                  isActive 
                    ? "bg-muted hover:bg-muted/80" 
                    : "opacity-40 hover:opacity-60"
                )}
              >
                <span 
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    !isActive && "ring-1 ring-inset ring-muted-foreground"
                  )}
                  style={{ backgroundColor: isActive ? color : 'transparent' }}
                />
                <span className="flex-1 text-left font-medium">{type}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1">
                  {count}
                </Badge>
                {isActive ? (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t flex gap-2">
          <button
            onClick={() => setActiveFilters(new Set(['NCOE', 'STC', 'KIC', 'KISCE']))}
            className="text-[10px] text-primary hover:underline"
          >
            Show All
          </button>
          <button
            onClick={() => setActiveFilters(new Set())}
            className="text-[10px] text-muted-foreground hover:underline"
          >
            Hide All
          </button>
        </div>
      </div>

      {/* Bottom Right - Map Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border overflow-hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="border-t" />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/95 backdrop-blur-sm shadow-lg"
          onClick={resetMapView}
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/95 backdrop-blur-sm shadow-lg"
          onClick={cycleMapStyle}
          title={`Style: ${mapStyle}`}
        >
          <Compass className="h-4 w-4" />
        </Button>
      </div>

      {/* Centre Detail Modal */}
      {selectedCentre && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20" onClick={() => setSelectedCentre(null)}>
          <div 
            className="bg-background rounded-lg shadow-xl border max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedCentre.centre_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCentre.district}, {selectedCentre.state}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCentre(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Badge style={{ backgroundColor: CENTRE_TYPE_COLORS[selectedCentre.centre_type] }}>
                  {selectedCentre.centre_type}
                </Badge>
                {selectedCentre.operational_status && (
                  <Badge variant="outline">{selectedCentre.operational_status}</Badge>
                )}
                {selectedCentre.programme_subtype && (
                  <Badge variant="secondary">{selectedCentre.programme_subtype}</Badge>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Centre Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Type</div>
                  <div>{selectedCentre.centre_type}</div>
                  <div className="text-muted-foreground">State</div>
                  <div>{selectedCentre.state}</div>
                  <div className="text-muted-foreground">District</div>
                  <div>{selectedCentre.district || 'N/A'}</div>
                  {selectedCentre.operational_status && (
                    <>
                      <div className="text-muted-foreground">Status</div>
                      <div>{selectedCentre.operational_status}</div>
                    </>
                  )}
                </div>
              </div>

              {getSportsForCentre(selectedCentre.centre_id).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Sports Available</h4>
                  <div className="flex flex-wrap gap-1">
                    {getSportsForCentre(selectedCentre.centre_id).map(sport => (
                      <Badge key={sport} variant="outline" className="text-xs">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border text-xs z-10">
        {mapStyle} • zoom {currentZoom.toFixed(1)}
      </div>

      {/* Custom CSS */}
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
        .mapboxgl-popup-close-button {
          color: hsl(var(--foreground)) !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
        .mapboxgl-ctrl-group {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default IndiaMap;
