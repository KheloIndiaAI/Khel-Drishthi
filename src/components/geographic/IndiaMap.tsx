import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import Map, {
  Marker,
  Popup,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useSupercluster from 'use-supercluster';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Layers,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Search,
  X,
  Building2,
  MapPinOff,
  Satellite,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppTheme } from '@/components/theme/AppThemeProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dataToGeoStates, geoToDataState } from '@/lib/stateNames';

const TOTAL_CENTRES = 1147;
const INDIA_CENTER: [number, number] = [78.9629, 22.5937];

export interface Centre {
  centre_id: string;
  centre_name: string;
  centre_type: string;
  state: string;
  district: string | null;
  operational_status: string | null;
  programme_subtype: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
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
  NCOE: '#ef4444',
  STC: '#3b82f6',
  KIC: '#22c55e',
  KISCE: '#f59e0b',
};

// Deterministic hue per SAI region (keyed by regional_centres.display_name)
export const REGION_COLORS: Record<string, string> = {
  Bangalore: '#e11d48',
  Bhopal: '#0ea5e9',
  Gandhinagar: '#f59e0b',
  Guwahati: '#10b981',
  Imphal: '#8b5cf6',
  Kolkata: '#ec4899',
  LNCPE: '#14b8a6',
  Lucknow: '#84cc16',
  Mumbai: '#6366f1',
  'NIS Patiala': '#f97316',
  Sonipat: '#06b6d4',
  Stadia: '#a855f7',
  Zirakpur: '#eab308',
};

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';
const ESRI_ATTRIBUTION =
  'Imagery &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>, Maxar, Earthstar Geographics, and the GIS User Community';

const STATES_GEOJSON = '/geo/india_states_simplified.geojson';
const DISTRICTS_GEOJSON = '/geo/india_district_simplified.geojson';

/**
 * ONE style object for the lifetime of the map: light, dark and satellite
 * basemaps live inside it as raster sources whose visibility we toggle.
 * That way MapLibre never runs setStyle(), so our custom sources/layers
 * (choropleth, borders, lazily added districts) always survive mode/theme switches.
 */
const buildMapStyle = (): StyleSpecification => ({
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: CARTO_ATTRIBUTION,
    },
    'carto-dark': {
      type: 'raster',
      tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: CARTO_ATTRIBUTION,
    },
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: ESRI_ATTRIBUTION,
    },
    'esri-reference': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: ESRI_ATTRIBUTION,
    },
    'india-states': {
      type: 'geojson',
      data: STATES_GEOJSON,
      promoteId: 'STNAME_SH',
    },
  },
  layers: [
    { id: 'carto-light', type: 'raster', source: 'carto-light', layout: { visibility: 'visible' } },
    { id: 'carto-dark', type: 'raster', source: 'carto-dark', layout: { visibility: 'none' } },
    {
      id: 'esri-satellite',
      type: 'raster',
      source: 'esri-satellite',
      layout: { visibility: 'none' },
    },
    {
      id: 'esri-reference',
      type: 'raster',
      source: 'esri-reference',
      layout: { visibility: 'none' },
    },
    {
      id: 'state-fills',
      type: 'fill',
      source: 'india-states',
      paint: {
        'fill-color': '#94a3b8',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.45,
          0.15,
        ],
      },
    },
    // district-lines gets inserted here lazily (before state-borders)
    {
      id: 'state-borders',
      type: 'line',
      source: 'india-states',
      paint: {
        'line-color': '#64748b',
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 1.6, 0.7],
        'line-opacity': 0.8,
      },
    },
  ],
});


const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
};

const IndiaMap: React.FC<IndiaMapProps> = ({
  centres,
  centreSportLinks = [],
  selectedState,
  selectedCentreType,
  selectedSport,
  onStateSelect,
}) => {
  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useAppTheme();

  const [styleVariant, setStyleVariant] = useState<'light' | 'dark'>(resolvedTheme);
  const [userPickedStyle, setUserPickedStyle] = useState(false);
  const [zoom, setZoom] = useState(4);
  const [bounds, setBounds] = useState<[number, number, number, number] | undefined>();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(['NCOE', 'STC', 'KIC', 'KISCE'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [hoveredCentre, setHoveredCentre] = useState<string | null>(null);
  const [clusterPopup, setClusterPopup] = useState<{
    longitude: number;
    latitude: number;
    centres: Centre[];
  } | null>(null);
  const [satellite, setSatellite] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredState, setHoveredState] = useState<{
    dataName: string;
    x: number;
    y: number;
  } | null>(null);
  const hoveredFeatureId = useRef<string | null>(null);
  const districtsAdded = useRef(false);
  const lastHoverAt = useRef(0);

  // Map style follows portal theme unless the user cycles it manually
  useEffect(() => {
    if (!userPickedStyle) setStyleVariant(resolvedTheme);
  }, [resolvedTheme, userPickedStyle]);

  // The style object is created once — basemaps are toggled by layer visibility
  const mapStyle = useMemo(() => buildMapStyle(), []);

  // ---- SAI region data -----------------------------------------------------
  const { data: regionByState } = useQuery({
    queryKey: ['geo-region-state-mappings'],
    staleTime: Infinity,
    queryFn: async () => {
      const [{ data: mappings, error: mErr }, { data: centresRc, error: cErr }] = await Promise.all([
        supabase.from('region_state_mappings').select('state_name, region_id'),
        supabase.from('regional_centres').select('id, display_name'),
      ]);
      if (mErr) throw mErr;
      if (cErr) throw cErr;
      const nameById: Record<string, string> = {};
      (centresRc ?? []).forEach((r) => {
        nameById[r.id as string] = r.display_name as string;
      });
      const map: Record<string, string> = {};
      (mappings ?? []).forEach((m) => {
        const region = nameById[m.region_id as string];
        if (region) map[m.state_name as string] = region;
      });
      return map;
    },
  });

  // Basemap visibility (street light/dark vs satellite hybrid)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded) return;
    const vis = (id: string, on: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    };
    vis('carto-light', !satellite && styleVariant === 'light');
    vis('carto-dark', !satellite && styleVariant === 'dark');
    vis('esri-satellite', satellite);
    vis('esri-reference', satellite);

    if (map.getLayer('state-fills')) {
      map.setPaintProperty(
        'state-fills',
        'fill-opacity',
        satellite
          ? (['interpolate', ['linear'], ['zoom'], 6, 0.15, 7, 0] as never)
          : ([
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.45,
              0.15,
            ] as never)
      );
    }
    const lineColor = satellite ? '#ffffff' : '#64748b';
    if (map.getLayer('state-borders')) map.setPaintProperty('state-borders', 'line-color', lineColor);
    if (map.getLayer('district-lines'))
      map.setPaintProperty('district-lines', 'line-color', lineColor);
  }, [satellite, styleVariant, mapLoaded]);

  // Choropleth tint by SAI region
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded || !regionByState || !map.getLayer('state-fills')) return;
    const stops: unknown[] = ['match', ['get', 'STNAME_SH']];
    const seen = new Set<string>();
    Object.entries(regionByState).forEach(([dataState, region]) => {
      dataToGeoStates(dataState).forEach((geoName) => {
        if (seen.has(geoName)) return;
        seen.add(geoName);
        stops.push(geoName, REGION_COLORS[region] ?? '#94a3b8');
      });
    });
    stops.push('#94a3b8');
    map.setPaintProperty('state-fills', 'fill-color', stops as never);
  }, [regionByState, mapLoaded]);

  // Lazily mount district boundary lines the first time zoom crosses 5
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded || districtsAdded.current || zoom < 5) return;
    districtsAdded.current = true;
    if (!map.getSource('india-districts')) {
      map.addSource('india-districts', { type: 'geojson', data: DISTRICTS_GEOJSON });
    }
    if (!map.getLayer('district-lines')) {
      map.addLayer(
        {
          id: 'district-lines',
          type: 'line',
          source: 'india-districts',
          minzoom: 5.5,
          paint: {
            'line-color': satellite ? '#ffffff' : '#64748b',
            'line-width': 0.4,
            'line-opacity': 0.45,
          },
        },
        map.getLayer('state-borders') ? 'state-borders' : undefined
      );
    }
  }, [zoom, mapLoaded, satellite]);


  // ---- Filtering -----------------------------------------------------------
  const filteredCentres = useMemo(() => {
    let filtered = centres;

    if (selectedState && selectedState !== 'all') {
      filtered = filtered.filter((c) => c.state === selectedState);
    }

    if (selectedCentreType && selectedCentreType !== 'all') {
      filtered = filtered.filter((c) => c.centre_type === selectedCentreType);
    } else {
      filtered = filtered.filter((c) => activeFilters.has(c.centre_type));
    }

    if (selectedSport && selectedSport !== 'all') {
      const centreIdsWithSport = new Set(
        centreSportLinks
          .filter((link) => link.sport_name === selectedSport)
          .map((link) => link.centre_id)
      );
      filtered = filtered.filter((c) => centreIdsWithSport.has(c.centre_id));
    }

    return filtered;
  }, [centres, selectedState, selectedCentreType, selectedSport, centreSportLinks, activeFilters]);

  // Only centres with real coordinates get plotted
  const mappedCentres = useMemo(
    () =>
      filteredCentres
        .map((c) => ({
          centre: c,
          lng: toNumber(c.longitude),
          lat: toNumber(c.latitude),
        }))
        .filter((c): c is { centre: Centre; lng: number; lat: number } => c.lng !== null && c.lat !== null),
    [filteredCentres]
  );

  const unmappedCentres = useMemo(
    () => centres.filter((c) => toNumber(c.latitude) === null || toNumber(c.longitude) === null),
    [centres]
  );

  const unmappedByState = useMemo(() => {
    const groups: Record<string, Centre[]> = {};
    unmappedCentres.forEach((c) => {
      const key = c.state || 'Unknown';
      (groups[key] ||= []).push(c);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [unmappedCentres]);

  const points = useMemo(
    () =>
      mappedCentres.map(({ centre, lng, lat }) => ({
        type: 'Feature' as const,
        properties: {
          cluster: false,
          centreId: centre.centre_id,
          centreType: centre.centre_type,
          centre,
        },
        geometry: { type: 'Point' as const, coordinates: [lng, lat] },
      })),
    [mappedCentres]
  );

  const { clusters, supercluster } = useSupercluster({
    points: points as never,
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 11, minPoints: 3 },
  });

  const typeTotals = useMemo(() => {
    const totals: Record<string, number> = { NCOE: 0, STC: 0, KIC: 0, KISCE: 0 };
    filteredCentres.forEach((c) => {
      if (totals[c.centre_type] !== undefined) totals[c.centre_type]++;
    });
    return totals;
  }, [filteredCentres]);

  const getSportsForCentre = useCallback(
    (centreId: string) =>
      centreSportLinks
        .filter((link) => link.centre_id === centreId)
        .map((link) => link.sport_name)
        .filter((sport, idx, arr): sport is string => !!sport && arr.indexOf(sport) === idx),
    [centreSportLinks]
  );

  // ---- Controls ------------------------------------------------------------
  const syncViewport = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    setZoom(map.getZoom());
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, []);

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  const resetMapView = useCallback(() => {
    mapRef.current?.flyTo({ center: INDIA_CENTER, zoom: 4 });
    onStateSelect?.('all');
  }, [onStateSelect]);

  const cycleMapStyle = useCallback(() => {
    setUserPickedStyle(true);
    setStyleVariant((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const availableStates = useMemo(
    () => [...new Set(centres.map((c) => c.state).filter(Boolean))].sort(),
    [centres]
  );

  const matchingStates = useMemo(() => {
    if (!searchQuery) return [];
    return availableStates.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, availableStates]);

  // Fly to a state using the real bounds of its plotted centres
  const fitStateBounds = useCallback(
    (state: string) => {
      const map = mapRef.current;
      if (!map) return;
      const coords = centres
        .filter((c) => c.state === state)
        .map((c) => [toNumber(c.longitude), toNumber(c.latitude)] as [number | null, number | null])
        .filter((c): c is [number, number] => c[0] !== null && c[1] !== null);

      if (coords.length === 0) return;
      if (coords.length === 1) {
        map.flyTo({ center: coords[0], zoom: 9 });
        return;
      }
      const lngs = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 60, maxZoom: 10, duration: 1200 }
      );
    },
    [centres]
  );

  const flyToState = useCallback(
    (state: string) => {
      fitStateBounds(state);
      setSearchQuery('');
      setShowSearch(false);
      onStateSelect?.(state);
    },
    [fitStateBounds, onStateSelect]
  );

  // Centre counts per state (all centres, unaffected by type filters)
  const centreCountByState = useMemo(() => {
    const counts: Record<string, number> = {};
    centres.forEach((c) => {
      if (!c.state) return;
      counts[c.state] = (counts[c.state] || 0) + 1;
    });
    return counts;
  }, [centres]);

  const setStateHover = useCallback((geoId: string | null) => {
    const map = mapRef.current?.getMap();
    if (!map || !map.getSource('india-states')) return;
    if (hoveredFeatureId.current && hoveredFeatureId.current !== geoId) {
      map.setFeatureState(
        { source: 'india-states', id: hoveredFeatureId.current },
        { hover: false }
      );
    }
    hoveredFeatureId.current = geoId;
    if (geoId) {
      map.setFeatureState({ source: 'india-states', id: geoId }, { hover: true });
    }
  }, []);

  const handleMapMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const now = Date.now();
      if (now - lastHoverAt.current < 40) return;
      lastHoverAt.current = now;

      const feature = event.features?.find((f) => f.layer?.id === 'state-fills');
      if (!feature) {
        setStateHover(null);
        setHoveredState(null);
        return;
      }
      const geoName = String(feature.properties?.STNAME_SH ?? '');
      setStateHover(geoName);
      setHoveredState({
        dataName: geoToDataState(geoName),
        x: event.point.x,
        y: event.point.y,
      });
    },
    [setStateHover]
  );

  const handleMapMouseLeave = useCallback(() => {
    setStateHover(null);
    setHoveredState(null);
  }, [setStateHover]);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.find((f) => f.layer?.id === 'state-fills');
      if (!feature) return;
      const dataName = geoToDataState(String(feature.properties?.STNAME_SH ?? ''));
      setHoveredState(null);
      flyToState(dataName);
    },
    [flyToState]
  );

  useEffect(() => {
    if (!selectedState || selectedState === 'all') {
      mapRef.current?.flyTo({ center: INDIA_CENTER, zoom: 4 });
      return;
    }
    fitStateBounds(selectedState);
  }, [selectedState, fitStateBounds]);

  const toggleFilter = useCallback((type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      if (!supercluster) return;
      const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
      const currentZoom = mapRef.current?.getZoom() ?? zoom;

      // Co-located centres: cluster will never split — list its members instead
      if (expansionZoom <= currentZoom + 0.01) {
        const leaves = supercluster.getLeaves(clusterId, Infinity) as unknown as Array<{
          properties: { centre: Centre };
        }>;
        setClusterPopup({
          longitude,
          latitude,
          centres: leaves.map((leaf) => leaf.properties.centre),
        });
        return;
      }
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 800 });
    },
    [supercluster, zoom]
  );

  const dominantType = useCallback(
    (clusterId: number): string => {
      if (!supercluster) return 'KIC';
      const leaves = supercluster.getLeaves(clusterId, Infinity) as unknown as Array<{
        properties: { centreType: string };
      }>;
      const counts: Record<string, number> = {};
      leaves.forEach((leaf) => {
        counts[leaf.properties.centreType] = (counts[leaf.properties.centreType] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'KIC';
    },
    [supercluster]
  );

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: INDIA_CENTER[0], latitude: INDIA_CENTER[1], zoom: 4 }}
        mapStyle={mapStyle}
        style={{ position: 'absolute', inset: 0 }}
        onLoad={() => {
          setMapLoaded(true);
          syncViewport();
        }}
        onMove={syncViewport}
        interactiveLayerIds={['state-fills']}
        onMouseMove={handleMapMouseMove}
        onMouseLeave={handleMapMouseLeave}
        onClick={handleMapClick}
        attributionControl={{ compact: true }}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates as [number, number];
          const props = cluster.properties as Record<string, unknown>;

          if (props.cluster) {
            const count = props.point_count as number;
            const clusterId = cluster.id as number;
            const size = Math.min(60, Math.max(30, 26 + Math.log2(count + 1) * 6));
            const type = dominantType(clusterId);
            return (
              <Marker
                key={`cluster-${clusterId}`}
                longitude={longitude}
                latitude={latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleClusterClick(clusterId, longitude, latitude);
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full border-2 border-background font-bold text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{
                    width: size,
                    height: size,
                    background: CENTRE_TYPE_COLORS[type] || '#888',
                    fontSize: size > 45 ? 13 : 11,
                  }}
                >
                  {count}
                </div>
              </Marker>
            );
          }

          const centre = props.centre as Centre;
          return (
            <Marker
              key={`centre-${centre.centre_id}`}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedCentre(centre);
              }}
            >
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredCentre(centre.centre_id)}
                onMouseLeave={() => setHoveredCentre(null)}
              >
                {hoveredCentre === centre.centre_id && (
                  <div className="absolute bottom-full mb-1 whitespace-nowrap rounded bg-background/95 px-2 py-1 text-[10px] font-medium shadow-lg border z-10">
                    {centre.centre_name}
                  </div>
                )}
                <div
                  className="h-3.5 w-3.5 rounded-full border-2 border-background shadow-md cursor-pointer transition-transform hover:scale-150"
                  style={{ background: CENTRE_TYPE_COLORS[centre.centre_type] || '#888' }}
                />
              </div>
            </Marker>
          );
        })}

        {clusterPopup && (
          <Popup
            longitude={clusterPopup.longitude}
            latitude={clusterPopup.latitude}
            onClose={() => setClusterPopup(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="p-2 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold mb-2 text-foreground">
                {clusterPopup.centres.length} centres at this location
              </p>
              <div className="space-y-1">
                {clusterPopup.centres.map((c) => (
                  <button
                    key={c.centre_id}
                    onClick={() => {
                      setSelectedCentre(c);
                      setClusterPopup(null);
                    }}
                    className="w-full text-left rounded p-1.5 text-xs hover:bg-muted transition-colors"
                  >
                    <span className="block font-medium text-foreground">{c.centre_name}</span>
                    <span
                      className="mt-0.5 inline-block rounded px-1 py-0.5 text-[9px] text-white"
                      style={{ background: CENTRE_TYPE_COLORS[c.centre_type] || '#888' }}
                    >
                      {c.centre_type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Top Left - Stats */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border z-10">
        <div className="text-xs text-muted-foreground">Showing</div>
        <div className="text-2xl font-bold">{mappedCentres.length}</div>
        <div className="text-xs text-muted-foreground">
          of {TOTAL_CENTRES.toLocaleString()} centres mapped
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button className="mt-1 flex items-center gap-1 text-[10px] text-primary hover:underline">
              <MapPinOff className="h-3 w-3" />
              Unmapped centres ({unmappedCentres.length})
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Unmapped centres ({unmappedCentres.length})</SheetTitle>
              <SheetDescription>
                These centres have no verified coordinates yet and are never plotted on the map.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-9rem)] mt-4 pr-4">
              <div className="space-y-4">
                {unmappedByState.map(([state, list]) => (
                  <div key={state}>
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                      {state} ({list.length})
                    </h4>
                    <div className="space-y-1">
                      {list.map((c) => (
                        <div key={c.centre_id} className="rounded border p-2 text-xs">
                          <div className="font-medium">{c.centre_name}</div>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="rounded px-1 py-0.5 text-[9px] text-white"
                              style={{ background: CENTRE_TYPE_COLORS[c.centre_type] || '#888' }}
                            >
                              {c.centre_type}
                            </span>
                            <span className="text-muted-foreground">{c.district || '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {unmappedCentres.length === 0 && (
                  <p className="text-sm text-muted-foreground">Every centre has coordinates.</p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
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
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {matchingStates.length > 0 && (
              <div className="border-t max-h-40 overflow-y-auto">
                {matchingStates.map((state) => (
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
      <div className="absolute bottom-10 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border z-10">
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
                  'flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-all',
                  isActive ? 'bg-muted hover:bg-muted/80' : 'opacity-40 hover:opacity-60'
                )}
              >
                <span
                  className={cn(
                    'w-3 h-3 rounded-full transition-all',
                    !isActive && 'ring-1 ring-inset ring-muted-foreground'
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
      <div className="absolute bottom-10 right-4 flex flex-col gap-2 z-10">
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

        {!satellite && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/95 backdrop-blur-sm shadow-lg"
            onClick={cycleMapStyle}
            title={`Basemap: ${styleVariant}`}
          >
            {styleVariant === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant={satellite ? 'default' : 'secondary'}
          size="icon"
          className={cn('h-8 w-8 shadow-lg', !satellite && 'bg-background/95 backdrop-blur-sm')}
          onClick={() => setSatellite((prev) => !prev)}
          title={satellite ? 'Switch to street map' : 'Switch to satellite'}
        >
          <Satellite className="h-4 w-4" />
        </Button>
      </div>

      {/* Centre Detail Modal */}
      {selectedCentre && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
          onClick={() => setSelectedCentre(null)}
        >
          <div
            className="bg-background rounded-lg shadow-xl border max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{selectedCentre.centre_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCentre.district}, {selectedCentre.state}
                </p>
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
                  <div className="text-muted-foreground">Coordinates</div>
                  <div className="tabular-nums">
                    {toNumber(selectedCentre.latitude)?.toFixed(4) ?? '—'},{' '}
                    {toNumber(selectedCentre.longitude)?.toFixed(4) ?? '—'}
                  </div>
                </div>
              </div>

              {getSportsForCentre(selectedCentre.centre_id).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Sports Available</h4>
                  <div className="flex flex-wrap gap-1">
                    {getSportsForCentre(selectedCentre.centre_id).map((sport) => (
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

      {/* State hover tooltip */}
      {hoveredState && !clusterPopup && !selectedCentre && (
        <div
          className="pointer-events-none absolute z-20 rounded-md border bg-background/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm"
          style={{
            left: Math.min(hoveredState.x + 14, 1000),
            top: Math.max(hoveredState.y - 10, 8),
          }}
        >
          <div className="text-xs font-semibold text-foreground">{hoveredState.dataName}</div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                background:
                  REGION_COLORS[regionByState?.[hoveredState.dataName] ?? ''] ?? '#94a3b8',
              }}
            />
            {regionByState?.[hoveredState.dataName]
              ? `RC ${regionByState[hoveredState.dataName]}`
              : 'No SAI region'}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {centreCountByState[hoveredState.dataName] ?? 0} centres
          </div>
        </div>
      )}

      {/* Zoom level indicator */}
      <div className="absolute top-4 right-4 bg-background/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border text-xs z-10">
        {satellite ? 'satellite' : styleVariant} • zoom {zoom.toFixed(1)}
      </div>

      <style>{`
        .maplibregl-popup-content {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
          border: 1px solid hsl(var(--border)) !important;
        }
        .maplibregl-popup-tip {
          border-top-color: hsl(var(--background)) !important;
        }
        .maplibregl-popup-close-button {
          color: hsl(var(--foreground)) !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
      `}</style>
    </div>
  );
};

export default IndiaMap;
