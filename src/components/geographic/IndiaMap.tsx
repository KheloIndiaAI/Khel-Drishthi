import './maplibreWorker';
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
import StateReportCard from './StateReportCard';
import {
  useSaiProjects,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUSES,
  type SaiProject,
} from '@/hooks/useSaiProjects';



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
  sport_id?: string | null;
  sport_name: string | null;
  discipline_name: string | null;
}

export interface ProjectFocus {
  project_code: string;
  latitude: number;
  longitude: number;
}

interface IndiaMapProps {
  centres: Centre[];
  centreSportLinks?: CentreSportLink[];
  selectedState?: string;
  selectedCentreType?: string;
  /** Matched against centre_sport_links.sport_id (id, never name). */
  selectedSportId?: string;
  onStateSelect?: (state: string) => void;
  focusProject?: ProjectFocus | null;
  /** Wrapper height (also applied to the loading skeleton). */
  height?: string;
  /** Denominator of the "X of N centres mapped" overlay. */
  totalCentres?: number;
  /** Paint the SAI-region choropleth on state fills. */
  showChoropleth?: boolean;
  /**
   * Database state name -> value. When supplied (and showChoropleth is true) the
   * state fills switch from categorical SAI-region colours to a sequential ramp.
   * A state missing from this map is a real zero ("no presence"), not missing data.
   */
  choroplethValues?: Record<string, number>;
  /** Noun used in the sequential legend and hover tooltip, e.g. "Archery centres". */
  choroplethLabel?: string;
  /** Initial visibility of the infrastructure projects layer; false skips the query. */
  showProjects?: boolean;
  /** Lazy-add district boundary lines on zoom. */
  showDistricts?: boolean;
  /** Fit viewport to supplied centres' bounds on first load. */
  fitToBounds?: boolean;
  /** Extra callback fired alongside internal centre selection. */
  onCentreClick?: (centre: Centre) => void;
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

// Sequential single-hue ramp used when choroplethValues is supplied.
const SEQUENTIAL_RAMP = ['#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#15803d'];
// A state with no presence at all — deliberately off-hue so it can never be
// mistaken for the lowest bucket (nor for a state whose data failed to load,
// in which case the sequential ramp is not applied at all).
const NO_PRESENCE_FILL = '#94a3b8';

/** Equal-interval buckets across the positive values, low -> high. */
const buildBuckets = (values: number[]) => {
  const positives = values.filter((v) => v > 0);
  if (positives.length === 0) return [] as { min: number; max: number; color: string }[];
  const max = Math.max(...positives);
  const steps = Math.min(SEQUENTIAL_RAMP.length, Math.max(1, max));
  const width = max / steps;
  return Array.from({ length: steps }, (_, i) => ({
    min: i === 0 ? 1 : Math.floor(i * width) + 1,
    max: i === steps - 1 ? max : Math.floor((i + 1) * width),
    color: SEQUENTIAL_RAMP[SEQUENTIAL_RAMP.length - steps + i],
  }));
};

const bucketColor = (
  value: number,
  buckets: { min: number; max: number; color: string }[]
) => {
  if (value <= 0 || buckets.length === 0) return NO_PRESENCE_FILL;
  const hit = buckets.find((b) => value >= b.min && value <= b.max);
  return hit?.color ?? buckets[buckets.length - 1].color;
};



import {
  getCompliantMapStyle,
  retryCompliantMapStyle,
  DISTRICTS_GEOJSON,
  DARK_PREFIX,
  LIGHT_PREFIX,
} from './compliantMapStyle';



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
  selectedSportId,
  onStateSelect,
  focusProject,
  height = '600px',
  totalCentres,
  showChoropleth = true,
  choroplethValues,
  choroplethLabel = 'centres',
  showProjects: showProjectsDefault = true,
  showDistricts = true,
  fitToBounds = false,
  onCentreClick,
}) => {

  const mapRef = useRef<MapRef | null>(null);
  const { resolvedTheme } = useAppTheme();

  // Sequential shading only when caller supplied values AND the choropleth is on.
  const sequentialMode =
    showChoropleth && !!choroplethValues && Object.keys(choroplethValues).length > 0;
  const buckets = useMemo(
    () => (choroplethValues ? buildBuckets(Object.values(choroplethValues).map(Number)) : []),
    [choroplethValues]
  );



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
  const [reportOpen, setReportOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // ---- Infrastructure projects layer ---------------------------------------
  const {
    data: projects = [],
    isError: projectsError,
  } = useSaiProjects(showProjectsDefault);
  const [showProjects, setShowProjects] = useState(showProjectsDefault);
  const [projectStatuses, setProjectStatuses] = useState<Set<string>>(
    new Set(['Completed', 'In Progress'])
  );
  const [selectedProject, setSelectedProject] = useState<SaiProject | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [projectPopup, setProjectPopup] = useState<{
    longitude: number;
    latitude: number;
    projects: SaiProject[];
  } | null>(null);


  const [hoveredState, setHoveredState] = useState<{
    dataName: string;
    x: number;
    y: number;
  } | null>(null);
  const hoveredFeatureId = useRef<string | null>(null);
  const districtsAdded = useRef(false);
  const basemapErrorLogged = useRef(false);
  const lastHoverAt = useRef(0);

  // Map style follows portal theme unless the user cycles it manually
  useEffect(() => {
    if (!userPickedStyle) setStyleVariant(resolvedTheme);
  }, [resolvedTheme, userPickedStyle]);

  // The style object is built once (CARTO vector styles with all admin
  // boundary / state-label layers stripped), cached in module scope.
  // If CARTO is unreachable we mount a compliant degraded style instead.
  const [mapStyle, setMapStyle] = useState<StyleSpecification | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [degradedDismissed, setDegradedDismissed] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [styleEpoch, setStyleEpoch] = useState(0);
  const [dataStalled, setDataStalled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => !cancelled && setSlowLoad(true), 3000);
    getCompliantMapStyle().then(({ style, degraded: isDegraded }) => {
      if (cancelled) return;
      setMapStyle(style);
      setDegraded(isDegraded);
    });
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  const handleRetryStyle = useCallback(async () => {
    setRetrying(true);
    const result = await retryCompliantMapStyle();
    setRetrying(false);
    if (!result) return;
    districtsAdded.current = false;
    setMapStyle(result.style);
    setDegraded(false);
    setDataStalled(false);
    setStyleEpoch((n) => n + 1);
  }, []);

  // Query failures are non-fatal for the map surface; log once so they are
  // observable rather than silently rendering empty layers.
  useEffect(() => {
    if (projectsError) console.warn('[map] SAI projects query failed — projects layer empty');
  }, [projectsError]);

  // ---- Data watchdog -------------------------------------------------------
  // Guards against the class of failure where the map instance mounts fine
  // (DOM markers + attribution render) but nothing that requires worker-parsed
  // data ever paints — e.g. the MapLibre web worker failing to start in a
  // production bundle. Six seconds after 'load', if no source has data, we
  // surface the chip instead of leaving a silent blank canvas.
  useEffect(() => {
    if (!mapLoaded) return;
    const timer = setTimeout(() => {
      const map = mapRef.current?.getMap?.();
      if (!map) return;
      let statesLoaded = false;
      try {
        statesLoaded = map.isSourceLoaded('india-states');
      } catch {
        statesLoaded = false;
      }
      const tilesLoaded = typeof map.areTilesLoaded === 'function' ? map.areTilesLoaded() : false;
      if (!statesLoaded && !tilesLoaded) {
        console.warn('[map] no source data rendered 6s after load — worker or network failure', {
          statesLoaded,
          tilesLoaded,
          styleEpoch,
        });
        setDataStalled(true);
        setDegradedDismissed(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [mapLoaded, styleEpoch]);



  // ---- SAI region data -----------------------------------------------------
  const { data: regionByState, isError: regionError } = useQuery({
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

  useEffect(() => {
    if (regionError) console.warn('[map] SAI region mapping query failed — choropleth not tinted');
  }, [regionError]);

  // Basemap visibility (street light/dark vs pure satellite imagery)
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !mapLoaded) return;
    const vis = (id: string, on: boolean) => {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    };
    const showLight = !satellite && styleVariant === 'light';
    const showDark = !satellite && styleVariant === 'dark';
    map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith(LIGHT_PREFIX)) vis(layer.id, showLight);
      else if (layer.id.startsWith(DARK_PREFIX)) vis(layer.id, showDark);
    });
    vis('esri-satellite', satellite);

    if (map.getLayer('state-fills')) {
      // A sequential ramp carries meaning in its shade, so it needs more opacity
      // than the purely decorative categorical region tint.
      const base = sequentialMode ? 0.6 : 0.15;
      map.setPaintProperty(
        'state-fills',
        'fill-opacity',
        satellite
          ? (['interpolate', ['linear'], ['zoom'], 6, base, 7, 0] as never)
          : ([
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              sequentialMode ? 0.8 : 0.45,
              base,
            ] as never)
      );
    }
    const lineColor = satellite ? '#ffffff' : '#64748b';
    if (map.getLayer('state-borders')) map.setPaintProperty('state-borders', 'line-color', lineColor);
    if (map.getLayer('district-lines'))
      map.setPaintProperty('district-lines', 'line-color', lineColor);

    // Official external boundary — always the most prominent line on the map
    if (map.getLayer('india-outline')) {
      map.setPaintProperty(
        'india-outline',
        'line-color',
        satellite ? '#ffffff' : styleVariant === 'dark' ? '#e2e8f0' : '#0f172a'
      );
      map.setPaintProperty('india-outline', 'line-width', satellite ? 2.2 : 1.8);
    }
  }, [satellite, styleVariant, mapLoaded, styleEpoch, sequentialMode]);

  // Choropleth tint — sequential when values are supplied, else SAI-region categorical
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!showChoropleth) return;
    if (!map || !mapLoaded || !map.getLayer('state-fills')) return;

    const stops: unknown[] = ['match', ['get', 'STNAME_SH']];
    const seen = new Set<string>();

    if (sequentialMode && choroplethValues) {
      Object.entries(choroplethValues).forEach(([dataState, value]) => {
        dataToGeoStates(dataState).forEach((geoName) => {
          if (seen.has(geoName)) return;
          seen.add(geoName);
          stops.push(geoName, bucketColor(Number(value) || 0, buckets));
        });
      });
      // Every other polygon is a genuine "no presence", not missing data.
      stops.push(NO_PRESENCE_FILL);
    } else {
      if (!regionByState) return;
      Object.entries(regionByState).forEach(([dataState, region]) => {
        dataToGeoStates(dataState).forEach((geoName) => {
          if (seen.has(geoName)) return;
          seen.add(geoName);
          stops.push(geoName, REGION_COLORS[region] ?? '#94a3b8');
        });
      });
      stops.push('#94a3b8');
    }
    map.setPaintProperty('state-fills', 'fill-color', stops as never);
  }, [regionByState, mapLoaded, styleEpoch, showChoropleth, sequentialMode, choroplethValues, buckets]);

  // Lazily mount district boundary lines the first time zoom crosses 5
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!showDistricts) return;
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
  }, [zoom, mapLoaded, satellite, styleEpoch, showDistricts]);


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

    if (selectedSportId && selectedSportId !== 'all') {
      const centreIdsWithSport = new Set(
        centreSportLinks
          .filter((link) => link.sport_id === selectedSportId)
          .map((link) => link.centre_id)
      );
      filtered = filtered.filter((c) => centreIdsWithSport.has(c.centre_id));
    }

    return filtered;
  }, [centres, selectedState, selectedCentreType, selectedSportId, centreSportLinks, activeFilters]);


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

  // ---- Projects: state scoping, status filters, own cluster instance -------
  const stateProjects = useMemo(
    () =>
      selectedState && selectedState !== 'all'
        ? projects.filter((p) => p.state === selectedState)
        : projects,
    [projects, selectedState]
  );

  const projectStatusTotals = useMemo(() => {
    const totals: Record<string, number> = { Completed: 0, 'In Progress': 0, Cancelled: 0 };
    stateProjects.forEach((p) => {
      if (totals[p.status] !== undefined) totals[p.status]++;
    });
    return totals;
  }, [stateProjects]);

  const visibleProjects = useMemo(() => {
    if (!showProjects) return [];
    return stateProjects.filter(
      (p) =>
        projectStatuses.has(p.status) &&
        toNumber(p.latitude) !== null &&
        toNumber(p.longitude) !== null
    );
  }, [stateProjects, projectStatuses, showProjects]);

  const projectPoints = useMemo(
    () =>
      visibleProjects.map((project) => ({
        type: 'Feature' as const,
        properties: { cluster: false, projectCode: project.project_code, status: project.status, project },
        geometry: {
          type: 'Point' as const,
          coordinates: [toNumber(project.longitude)!, toNumber(project.latitude)!],
        },
      })),
    [visibleProjects]
  );

  const { clusters: projectClusters, supercluster: projectSupercluster } = useSupercluster({
    points: projectPoints as never,
    bounds,
    zoom,
    options: { radius: 50, maxZoom: 11, minPoints: 3 },
  });

  const handleProjectClusterClick = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      if (!projectSupercluster) return;
      const expansionZoom = Math.min(projectSupercluster.getClusterExpansionZoom(clusterId), 20);
      const currentZoom = mapRef.current?.getZoom() ?? zoom;
      if (expansionZoom <= currentZoom + 0.01) {
        const leaves = projectSupercluster.getLeaves(clusterId, Infinity) as unknown as Array<{
          properties: { project: SaiProject };
        }>;
        setProjectPopup({
          longitude,
          latitude,
          projects: leaves.map((l) => l.properties.project),
        });
        return;
      }
      mapRef.current?.flyTo({ center: [longitude, latitude], zoom: expansionZoom, duration: 800 });
    },
    [projectSupercluster, zoom]
  );

  const dominantStatus = useCallback(
    (clusterId: number): string => {
      if (!projectSupercluster) return 'Completed';
      const leaves = projectSupercluster.getLeaves(clusterId, Infinity) as unknown as Array<{
        properties: { status: string };
      }>;
      const counts: Record<string, number> = {};
      leaves.forEach((l) => {
        counts[l.properties.status] = (counts[l.properties.status] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Completed';
    },
    [projectSupercluster]
  );

  const toggleProjectStatus = useCallback((status: string) => {
    setProjectStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }, []);

  // Fly to a project requested from the Projects analytics tab
  useEffect(() => {
    if (!focusProject) return;
    const project = projects.find((p) => p.project_code === focusProject.project_code);
    setShowProjects(true);
    if (project) setProjectStatuses((prev) => new Set([...prev, project.status]));
    mapRef.current?.flyTo({
      center: [focusProject.longitude, focusProject.latitude],
      zoom: 12,
      duration: 1200,
    });
    if (project) setSelectedProject(project);
  }, [focusProject, projects]);


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
  const syncViewport = useCallback((evt?: { target?: unknown }) => {
    const map =
      (evt?.target as { getZoom?: () => number; getBounds?: () => unknown } | undefined)
        ?.getBounds
        ? (evt!.target as ReturnType<NonNullable<MapRef['getMap']>>)
        : mapRef.current?.getMap();
    if (!map) return;
    setZoom(map.getZoom());
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, []);

  const selectCentre = useCallback(
    (centre: Centre) => {
      setSelectedCentre(centre);
      onCentreClick?.(centre);
    },
    [onCentreClick]
  );

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

  // Fly to a state using the real bounds of its currently visible markers
  // (training centres + infrastructure projects)
  const fitStateBounds = useCallback(
    (state: string) => {
      const map = mapRef.current;
      if (!map) return;
      const centreCoords = centres
        .filter((c) => c.state === state && activeFilters.has(c.centre_type))
        .map((c) => [toNumber(c.longitude), toNumber(c.latitude)] as [number | null, number | null]);
      const projectCoords =
        showProjects
          ? projects
              .filter((p) => p.state === state && projectStatuses.has(p.status))
              .map(
                (p) => [toNumber(p.longitude), toNumber(p.latitude)] as [number | null, number | null]
              )
          : [];
      const coords = [...centreCoords, ...projectCoords].filter(
        (c): c is [number, number] => c[0] !== null && c[1] !== null
      );



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
    [centres, projects, activeFilters, projectStatuses, showProjects]

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

  const fitStateBoundsRef = useRef(fitStateBounds);
  fitStateBoundsRef.current = fitStateBounds;

  useEffect(() => {
    if (!selectedState || selectedState === 'all') {
      setReportOpen(false);
      mapRef.current?.flyTo({ center: INDIA_CENTER, zoom: 4 });
      return;
    }
    setReportOpen(true);
    fitStateBoundsRef.current(selectedState);
  }, [selectedState]);



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

  if (!mapStyle) {
    return (
      <div className="relative w-full rounded-lg overflow-hidden bg-muted animate-pulse" style={{ height }}>
        {slowLoad && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading map…</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: INDIA_CENTER[0], latitude: INDIA_CENTER[1], zoom: 4 }}
        mapStyle={mapStyle}
        style={{ position: 'absolute', inset: 0 }}
        onLoad={(evt) => {
          setMapLoaded(true);
          if (fitToBounds && mappedCentres.length > 0) {
            const lngs = mappedCentres.map((c) => c.lng);
            const lats = mappedCentres.map((c) => c.lat);
            mapRef.current?.fitBounds(
              [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)],
              ],
              { padding: 48, duration: 0, maxZoom: 10 }
            );
          }
          syncViewport(evt as unknown as { target?: unknown });
        }}
        onError={(evt) => {
          const message = (evt as unknown as { error?: { message?: string } })?.error?.message;
          if (!basemapErrorLogged.current) {
            basemapErrorLogged.current = true;
            console.warn('[map] basemap resource error (map remains usable)', { message });
          }
        }}
        onMove={(evt) => syncViewport(evt as unknown as { target?: unknown })}
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
                selectCentre(centre);
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

        {/* Infrastructure projects — diamond markers */}
        {projectClusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates as [number, number];
          const props = cluster.properties as Record<string, unknown>;

          if (props.cluster) {
            const count = props.point_count as number;
            const clusterId = cluster.id as number;
            const size = Math.min(52, Math.max(26, 22 + Math.log2(count + 1) * 5));
            const status = dominantStatus(clusterId);
            return (
              <Marker
                key={`pcluster-${clusterId}`}
                longitude={longitude}
                latitude={latitude}
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleProjectClusterClick(clusterId, longitude, latitude);
                }}
              >
                <div
                  className="flex items-center justify-center border-2 border-background shadow-lg cursor-pointer transition-transform hover:scale-110"
                  style={{
                    width: size,
                    height: size,
                    transform: 'rotate(45deg)',
                    background: PROJECT_STATUS_COLORS[status] || '#64748b',
                  }}
                >
                  <span
                    className="font-bold text-white"
                    style={{ transform: 'rotate(-45deg)', fontSize: size > 40 ? 12 : 10 }}
                  >
                    {count}
                  </span>
                </div>
              </Marker>
            );
          }

          const project = props.project as SaiProject;
          return (
            <Marker
              key={`project-${project.project_code}`}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedProject(project);
              }}
            >
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredProject(project.project_code)}
                onMouseLeave={() => setHoveredProject(null)}
              >
                {hoveredProject === project.project_code && (
                  <div className="absolute bottom-full mb-1.5 whitespace-nowrap rounded bg-background/95 px-2 py-1 text-[10px] font-medium shadow-lg border z-10">
                    {project.project_name}
                  </div>
                )}
                <div
                  className="h-3 w-3 border-2 border-background shadow-md cursor-pointer transition-transform hover:scale-150"
                  style={{
                    transform: 'rotate(45deg)',
                    background: PROJECT_STATUS_COLORS[project.status] || '#64748b',
                  }}
                />
              </div>
            </Marker>
          );
        })}

        {projectPopup && (
          <Popup
            longitude={projectPopup.longitude}
            latitude={projectPopup.latitude}
            onClose={() => setProjectPopup(null)}
            closeOnClick={false}
            maxWidth="280px"
          >
            <div className="p-2 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold mb-2 text-foreground">
                {projectPopup.projects.length} projects at this location
              </p>
              <div className="space-y-1">
                {projectPopup.projects.map((p) => (
                  <button
                    key={p.project_code}
                    onClick={() => {
                      setSelectedProject(p);
                      setProjectPopup(null);
                    }}
                    className="w-full text-left rounded p-1.5 text-xs hover:bg-muted transition-colors"
                  >
                    <span className="block font-medium text-foreground">{p.project_name}</span>
                    <span
                      className="mt-0.5 inline-block rounded px-1 py-0.5 text-[9px] text-white"
                      style={{ background: PROJECT_STATUS_COLORS[p.status] || '#64748b' }}
                    >
                      {p.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Popup>
        )}


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
                      selectCentre(c);
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

      {(degraded || dataStalled) && !degradedDismissed && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 shadow-md backdrop-blur">
          <span className="text-xs text-muted-foreground">
            {dataStalled ? 'Map data failed to load' : 'Street basemap unavailable'}
          </span>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-xs"
            disabled={retrying}
            onClick={handleRetryStyle}
          >
            {retrying ? 'Retrying…' : 'Retry'}
          </Button>
          <button
            type="button"
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setDegradedDismissed(true)}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Left - Stats */}
      {/* z-20: the honesty counter must never be covered by the legend on short maps. */}
      <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border z-20">

        <div className="text-xs text-muted-foreground">Showing</div>
        <div className="text-2xl font-bold">{mappedCentres.length}</div>
        <div className="text-xs text-muted-foreground">
          of {(totalCentres ?? centres.length).toLocaleString()} centres mapped
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
        {sequentialMode && buckets.length > 0 && (
          <div className="mb-3 pb-2 border-b max-w-[180px]">
            <h4 className="text-[10px] font-semibold mb-1.5 text-muted-foreground uppercase leading-tight">
              {choroplethLabel} per state
            </h4>
            <div className="flex items-center gap-0.5">
              {buckets.map((b) => (
                <span
                  key={b.min}
                  title={b.min === b.max ? `${b.min}` : `${b.min}–${b.max}`}
                  className="h-2.5 flex-1 first:rounded-l-sm last:rounded-r-sm"
                  style={{ backgroundColor: b.color }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
              <span>{buckets[0].min}</span>
              <span>{buckets[buckets.length - 1].max}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] mt-1">
              <span
                className="inline-block h-2.5 w-4 rounded-sm border border-border/50"
                style={{ backgroundColor: NO_PRESENCE_FILL }}
              />
              <span className="text-muted-foreground">No presence</span>
            </div>
          </div>
        )}
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

        {/* PROJECTS — omitted entirely when the projects layer is disabled. */}
        {showProjectsDefault && (
        <div className="mt-3 pt-2 border-t">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground">PROJECTS</h4>
            <button
              onClick={() => setShowProjects((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-primary hover:underline"
            >
              {showProjects ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {showProjects ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="space-y-1">
            {PROJECT_STATUSES.map((status) => {
              const isActive = showProjects && projectStatuses.has(status);
              return (
                <button
                  key={status}
                  onClick={() => toggleProjectStatus(status)}
                  className={cn(
                    'flex items-center gap-2 w-full px-2 py-1 rounded-md text-xs transition-all',
                    isActive ? 'bg-muted hover:bg-muted/80' : 'opacity-40 hover:opacity-60'
                  )}
                >
                  <span
                    className={cn(
                      'w-2.5 h-2.5 rotate-45 transition-all',
                      !isActive && 'ring-1 ring-inset ring-muted-foreground'
                    )}
                    style={{
                      backgroundColor: isActive ? PROJECT_STATUS_COLORS[status] : 'transparent',
                    }}
                  />
                  <span className="flex-1 text-left font-medium">{status}</span>
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">
                    {projectStatusTotals[status] || 0}
                  </Badge>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[9px] text-muted-foreground">
            3 projects with invalid GPS not shown
          </p>
          <div className="mt-2 pt-2 border-t space-y-1 text-[9px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              Circles = training centres
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rotate-45 bg-muted-foreground" />
              Diamonds = infrastructure projects
            </div>
          </div>
        </div>
        )}
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-background rounded-lg shadow-xl border max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">{selectedProject.project_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedProject.state}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedProject(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className="text-white border-0"
                  style={{ backgroundColor: PROJECT_STATUS_COLORS[selectedProject.status] }}
                >
                  {selectedProject.status}
                </Badge>
                {selectedProject.infra_type && (
                  <Badge variant="outline">{selectedProject.infra_type}</Badge>
                )}
              </div>

              {selectedProject.progress !== null && selectedProject.progress !== undefined && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium tabular-nums">{selectedProject.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, selectedProject.progress))}%`,
                        background: PROJECT_STATUS_COLORS[selectedProject.status],
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Parent facility</div>
                <div>{selectedProject.parent_facility_name || '—'}</div>
                <div className="text-muted-foreground">Coordinates</div>
                <div className="tabular-nums">
                  {toNumber(selectedProject.latitude)?.toFixed(4) ?? '—'},{' '}
                  {toNumber(selectedProject.longitude)?.toFixed(4) ?? '—'}
                </div>
              </div>

              {selectedProject.remarks && (
                <div>
                  <h4 className="text-sm font-semibold mb-1">Remarks</h4>
                  <p className="text-xs text-muted-foreground">{selectedProject.remarks}</p>
                </div>
              )}

              {(() => {
                const parent = selectedProject.parent_centre_id
                  ? centres.find((c) => c.centre_id === selectedProject.parent_centre_id)
                  : undefined;
                if (!parent) return null;
                return (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedProject(null);
                      selectCentre(parent);
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    View parent centre
                  </Button>
                );
              })()}
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
          {showChoropleth && sequentialMode && (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  background: bucketColor(
                    choroplethValues?.[hoveredState.dataName] ?? 0,
                    buckets
                  ),
                }}
              />
              {choroplethValues?.[hoveredState.dataName]
                ? `${choroplethValues[hoveredState.dataName]} ${choroplethLabel}`
                : `No ${choroplethLabel}`}
            </div>
          )}
          {showChoropleth && !sequentialMode && (
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
          )}
          <div className="text-[10px] text-muted-foreground">
            {centreCountByState[hoveredState.dataName] ?? 0} centres
          </div>
        </div>
      )}

      {/* State report card (Phase C) */}
      <StateReportCard
        open={reportOpen}
        stateName={selectedState && selectedState !== 'all' ? selectedState : null}
        centres={centres}
        centreSportLinks={centreSportLinks}
        regionByState={regionByState}
        regionColors={REGION_COLORS}
        centreTypeColors={CENTRE_TYPE_COLORS}
        onClose={() => setReportOpen(false)}
        onCentreClick={(c) => selectCentre(c)}
      />

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
