import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RegionalCentre {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

interface RegionStateMapping {
  id: string;
  state_name: string;
  region_id: string;
  regional_centres: RegionalCentre;
}

export interface RegionMappingData {
  /** Map of state name (lowercase) -> region name (e.g. "RC Kolkata") */
  stateToRegion: Record<string, string>;
  /** Map of region name -> array of state names */
  regionToStates: Record<string, string[]>;
  /** All regional centres sorted by sort_order */
  allRegions: RegionalCentre[];
  /** Map of region name -> display name */
  regionDisplayNames: Record<string, string>;
  /** Lookup region for a given state (case insensitive) */
  getRegionForState: (state: string | null | undefined) => string | null;
  /** Lookup region for a centre's region_unit field */
  getRegionForRegionUnit: (regionUnit: string | null | undefined) => string | null;
  isLoading: boolean;
}

// Aliases for database region_unit values that don't directly match region names
const REGION_UNIT_ALIASES: Record<string, string> = {
  "head office": "RC New Delhi",
  "sonepat": "RC Zirakpur",
  "nsnis": "RC NIS Patiala",
};

/**
 * Hook to fetch region mappings from the database.
 * This is the single source of truth for all state -> regional centre mappings.
 */
export const useRegionMappings = (): RegionMappingData => {
  // Fetch regional centres
  const { data: regionalCentres, isLoading: loadingCentres } = useQuery({
    queryKey: ["regional-centres-hook"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regional_centres")
        .select("id, name, display_name, sort_order")
        .order("sort_order");
      if (error) throw error;
      return data as RegionalCentre[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch state mappings with joined regional centre
  const { data: mappings, isLoading: loadingMappings } = useQuery({
    queryKey: ["region-state-mappings-hook"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("region_state_mappings")
        .select("id, state_name, region_id, regional_centres(id, name, display_name, sort_order)");
      if (error) throw error;
      return data as RegionStateMapping[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = loadingCentres || loadingMappings;

  // Build lookup maps
  const stateToRegion: Record<string, string> = {};
  const regionToStates: Record<string, string[]> = {};
  const regionDisplayNames: Record<string, string> = {};

  // Initialize region arrays from regional centres
  regionalCentres?.forEach((rc) => {
    regionToStates[rc.name] = [];
    regionDisplayNames[rc.name] = rc.display_name;
  });

  // Populate from mappings
  mappings?.forEach((m) => {
    if (m.regional_centres) {
      const regionName = m.regional_centres.name;
      stateToRegion[m.state_name.toLowerCase()] = regionName;
      if (!regionToStates[regionName]) {
        regionToStates[regionName] = [];
      }
      regionToStates[regionName].push(m.state_name);
    }
  });

  const getRegionForState = (state: string | null | undefined): string | null => {
    if (!state) return null;
    return stateToRegion[state.toLowerCase().trim()] || null;
  };

  const getRegionForRegionUnit = (regionUnit: string | null | undefined): string | null => {
    if (!regionUnit) return null;
    const trimmed = regionUnit.trim();
    const normalized = trimmed.toLowerCase();

    // Check aliases first
    if (REGION_UNIT_ALIASES[normalized]) {
      return REGION_UNIT_ALIASES[normalized];
    }

    // Already in RC format
    if (/^RC\s+/i.test(trimmed)) {
      const rc = trimmed.replace(/^rc\s+/i, "RC ");
      return regionToStates[rc] ? rc : null;
    }

    // Convert "Kolkata" -> "RC Kolkata"
    const rc = `RC ${trimmed}`;
    return regionToStates[rc] ? rc : null;
  };

  return {
    stateToRegion,
    regionToStates,
    allRegions: regionalCentres || [],
    regionDisplayNames,
    getRegionForState,
    getRegionForRegionUnit,
    isLoading,
  };
};
