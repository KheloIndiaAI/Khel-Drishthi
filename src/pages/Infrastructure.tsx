import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  MapPin, 
  Grid3X3, 
  List, 
  Search,
  Target,
  Users,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CentreDetailDialog } from "@/components/infrastructure/CentreDetailDialog";
import { InfrastructureNavTabs, ViewMode } from "@/components/infrastructure/InfrastructureNavTabs";
import { RegionalCentreCard, RegionStats } from "@/components/infrastructure/RegionalCentreCard";
import { StateCard, StateStats } from "@/components/infrastructure/StateCard";
import { RegionalCentreDetail } from "@/components/infrastructure/RegionalCentreDetail";
import { StateDetail } from "@/components/infrastructure/StateDetail";
import { useRegionMappings } from "@/hooks/useRegionMappings";
import { REGION_COLORS, getRegionDisplayName } from "@/lib/regionMapping";
import PageSEO, { infrastructurePageSchema, infrastructureBreadcrumbs } from "@/components/seo/PageSEO";
import { GlobalSearchTrigger } from "@/components/search/GlobalSearchTrigger";

const Infrastructure = () => {
  const [mainView, setMainView] = useState<ViewMode>("region");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCentre, setSelectedCentre] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<RegionStats | null>(null);
  const [selectedState, setSelectedState] = useState<StateStats | null>(null);

  // Use DB-based region mappings (single source of truth)
  const {
    allRegions,
    getRegionForState,
    getRegionForRegionUnit,
    isLoading: loadingMappings,
  } = useRegionMappings();

  // Fetch centres
  const { data: centres, isLoading } = useQuery({
    queryKey: ["centres"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centres")
          .select("*")
          .order("centre_name")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // Fetch sports
  const { data: sports } = useQuery({
    queryKey: ["sports-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("sport_id, sport_name")
        .order("sport_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch centre-sport links
  const { data: centreSportLinks } = useQuery({
    queryKey: ["centre-sport-links"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centre_sport_links")
          .select("centre_id, sport_id, sport_name")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // Fetch NCOE capacity
  const { data: ncoeCapacity } = useQuery({
    queryKey: ["ncoe-capacity-all-detailed"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("ncoe_capacity")
          .select("*")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // Fetch STC capacity
  const { data: stcCapacity } = useQuery({
    queryKey: ["stc-capacity-all-detailed"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("stc_capacity")
          .select("*")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // Create capacity lookup maps
  const capacityMap = useMemo(() => {
    const map = new Map<string, { existing: number; sanctioned: number }>();
    ncoeCapacity?.forEach(cap => {
      if (cap.centre_id) {
        const current = map.get(cap.centre_id) || { existing: 0, sanctioned: 0 };
        map.set(cap.centre_id, {
          existing: current.existing + (cap.ex_grand_total || 0),
          sanctioned: current.sanctioned + (cap.san_grand_total || 0)
        });
      }
    });
    stcCapacity?.forEach(cap => {
      if (cap.centre_id) {
        const current = map.get(cap.centre_id) || { existing: 0, sanctioned: 0 };
        map.set(cap.centre_id, {
          existing: current.existing + (cap.ex_grand_total || 0),
          sanctioned: current.sanctioned + (cap.san_grand_total || 0)
        });
      }
    });
    return map;
  }, [ncoeCapacity, stcCapacity]);

  // Create full capacity data lookup by centre
  const centreCapacityDataMap = useMemo(() => {
    const map = new Map<string, any[]>();
    ncoeCapacity?.forEach(cap => {
      if (cap.centre_id) {
        const current = map.get(cap.centre_id) || [];
        current.push(cap);
        map.set(cap.centre_id, current);
      }
    });
    stcCapacity?.forEach(cap => {
      if (cap.centre_id) {
        const current = map.get(cap.centre_id) || [];
        current.push(cap);
        map.set(cap.centre_id, current);
      }
    });
    return map;
  }, [ncoeCapacity, stcCapacity]);

  // Create sports lookup map
  const centreSportsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    centreSportLinks?.forEach(link => {
      if (link.centre_id && link.sport_name) {
        const current = map.get(link.centre_id) || [];
        if (!current.includes(link.sport_name)) {
          current.push(link.sport_name);
        }
        map.set(link.centre_id, current);
      }
    });
    return map;
  }, [centreSportLinks]);

  // Derive region for each centre (including KIC/KISCE via state mapping)
  const centresWithRegion = useMemo(() => {
    return (
      centres?.map((centre) => ({
        ...centre,
        derived_region:
          getRegionForRegionUnit(centre.region_unit) || getRegionForState(centre.state),
      })) || []
    );
  }, [centres]);

  // Summary statistics
  const stats = useMemo(() => {
    if (!centres) return { ncoe: 0, stc: 0, kic: 0, kisce: 0, total: 0, states: 0, regions: 0 };
    const uniqueStates = new Set(centres.map(c => c.state));
    const uniqueRegions = new Set(centresWithRegion.map(c => c.derived_region).filter(Boolean));
    return {
      ncoe: centres.filter(c => c.centre_type === "NCOE").length,
      stc: centres.filter(c => c.centre_type === "STC").length,
      kic: centres.filter(c => c.centre_type === "KIC").length,
      kisce: centres.filter(c => c.centre_type === "KISCE").length,
      total: centres.length,
      states: uniqueStates.size,
      regions: uniqueRegions.size
    };
  }, [centres, centresWithRegion]);

  // Compute region stats
  const regionStats = useMemo((): RegionStats[] => {
    if (!centresWithRegion.length || !allRegions.length) return [];

    const regionMap = new Map<string, RegionStats>();

    // Initialize all regions from DB
    allRegions.forEach((rc) => {
      regionMap.set(rc.name, {
        regionName: rc.name,
        states: [],
        ncoe: 0,
        stc: 0,
        kic: 0,
        kisce: 0,
        totalCentres: 0,
        sportsCount: 0,
        sanctionedCapacity: 0,
        existingCapacity: 0,
      });
    });

    // Count centres, sports, states by region
    const sportsByRegion = new Map<string, Set<string>>();
    const statesByRegion = new Map<string, Set<string>>();

    centresWithRegion.forEach((centre) => {
      const region = centre.derived_region;
      if (!region || !regionMap.has(region)) return;

      const stats = regionMap.get(region)!;
      stats.totalCentres++;

      if (centre.centre_type === "NCOE") stats.ncoe++;
      else if (centre.centre_type === "STC") stats.stc++;
      else if (centre.centre_type === "KIC") stats.kic++;
      else if (centre.centre_type === "KISCE") stats.kisce++;

      // Track states (for accurate "states covered" count)
      if (centre.state) {
        if (!statesByRegion.has(region)) statesByRegion.set(region, new Set());
        statesByRegion.get(region)!.add(centre.state);
      }

      // Add capacity
      const capacity = capacityMap.get(centre.centre_id);
      if (capacity) {
        stats.sanctionedCapacity += capacity.sanctioned;
        stats.existingCapacity += capacity.existing;
      }

      // Track sports
      const sports = centreSportsMap.get(centre.centre_id) || [];
      if (!sportsByRegion.has(region)) {
        sportsByRegion.set(region, new Set());
      }
      sports.forEach((s) => sportsByRegion.get(region)!.add(s));
    });

    // Add derived counts
    regionMap.forEach((stats, region) => {
      stats.sportsCount = sportsByRegion.get(region)?.size || 0;
      stats.states = Array.from(statesByRegion.get(region) || []).sort();
    });

    return Array.from(regionMap.values())
      .filter((r) => r.totalCentres > 0)
      .sort((a, b) => b.totalCentres - a.totalCentres);
  }, [centresWithRegion, capacityMap, centreSportsMap, allRegions]);

  // Compute state stats
  const stateStats = useMemo((): StateStats[] => {
    if (!centresWithRegion.length) return [];
    
    const stateMap = new Map<string, StateStats>();
    const sportsByState = new Map<string, Set<string>>();
    
    centresWithRegion.forEach(centre => {
      const state = centre.state;
      if (!state) return;
      
      if (!stateMap.has(state)) {
        stateMap.set(state, {
          stateName: state,
          regionName: centre.derived_region,
          ncoe: 0,
          stc: 0,
          kic: 0,
          kisce: 0,
          totalCentres: 0,
          sportsCount: 0,
          sanctionedCapacity: 0,
          existingCapacity: 0
        });
      }
      
      const stats = stateMap.get(state)!;
      stats.totalCentres++;
      
      if (centre.centre_type === "NCOE") stats.ncoe++;
      else if (centre.centre_type === "STC") stats.stc++;
      else if (centre.centre_type === "KIC") stats.kic++;
      else if (centre.centre_type === "KISCE") stats.kisce++;
      
      const capacity = capacityMap.get(centre.centre_id);
      if (capacity) {
        stats.sanctionedCapacity += capacity.sanctioned;
        stats.existingCapacity += capacity.existing;
      }
      
      const sports = centreSportsMap.get(centre.centre_id) || [];
      if (!sportsByState.has(state)) {
        sportsByState.set(state, new Set());
      }
      sports.forEach(s => sportsByState.get(state)!.add(s));
    });
    
    stateMap.forEach((stats, state) => {
      stats.sportsCount = sportsByState.get(state)?.size || 0;
    });
    
    return Array.from(stateMap.values())
      .sort((a, b) => b.totalCentres - a.totalCentres);
  }, [centresWithRegion, capacityMap, centreSportsMap]);

  // Get states for selected region
  const statesForSelectedRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return stateStats.filter(s => s.regionName === selectedRegion.regionName);
  }, [selectedRegion, stateStats]);

  // Get centres for selected region
  const centresForSelectedRegion = useMemo(() => {
    if (!selectedRegion) return [];
    return centresWithRegion.filter(c => c.derived_region === selectedRegion.regionName);
  }, [selectedRegion, centresWithRegion]);

  // Get centres for selected state
  const centresForSelectedState = useMemo(() => {
    if (!selectedState) return [];
    return centresWithRegion.filter(c => c.state === selectedState.stateName);
  }, [selectedState, centresWithRegion]);

  // Get sports list for selected region
  const sportsForSelectedRegion = useMemo(() => {
    if (!selectedRegion) return [];
    const sportCounts = new Map<string, number>();
    centresForSelectedRegion.forEach(centre => {
      const sports = centreSportsMap.get(centre.centre_id) || [];
      sports.forEach(s => {
        sportCounts.set(s, (sportCounts.get(s) || 0) + 1);
      });
    });
    return Array.from(sportCounts.entries())
      .map(([sportName, centreCount]) => ({ sportName, centreCount }))
      .sort((a, b) => b.centreCount - a.centreCount);
  }, [selectedRegion, centresForSelectedRegion, centreSportsMap]);

  // Get sports list for selected state
  const sportsForSelectedState = useMemo(() => {
    if (!selectedState) return [];
    const sportCounts = new Map<string, number>();
    centresForSelectedState.forEach(centre => {
      const sports = centreSportsMap.get(centre.centre_id) || [];
      sports.forEach(s => {
        sportCounts.set(s, (sportCounts.get(s) || 0) + 1);
      });
    });
    return Array.from(sportCounts.entries())
      .map(([sportName, centreCount]) => ({ sportName, centreCount }))
      .sort((a, b) => b.centreCount - a.centreCount);
  }, [selectedState, centresForSelectedState, centreSportsMap]);

  // Filter centres for "By Type" view
  const sportCentreIds = sportFilter !== "all" && centreSportLinks
    ? new Set(centreSportLinks.filter(l => l.sport_id === sportFilter).map(l => l.centre_id))
    : null;

  const filteredCentres = useMemo(() => {
    return centresWithRegion.filter((centre) => {
      const matchesSearch = centre.centre_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.district?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeTab === "all" || centre.centre_type === activeTab;
      const matchesState = stateFilter === "all" || centre.state === stateFilter;
      const matchesSport = !sportCentreIds || sportCentreIds.has(centre.centre_id);
      return matchesSearch && matchesType && matchesState && matchesSport;
    });
  }, [centresWithRegion, searchTerm, activeTab, stateFilter, sportCentreIds]);

  const centreTypeColors: Record<string, string> = {
    NCOE: "bg-saffron text-white",
    STC: "bg-india-green text-white",
    KISCE: "bg-india-navy text-white",
    KIC: "bg-purple-600 text-white",
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStateFilter("all");
    setSportFilter("all");
  };

  const hasActiveFilters = searchTerm || stateFilter !== "all" || sportFilter !== "all";

  const handleCentreClick = (centre: any) => {
    if (centre.centre_type === "NCOE" || centre.centre_type === "STC") {
      setSelectedCentre(centre);
      setDialogOpen(true);
    }
  };

  const handleRegionClick = (region: RegionStats) => {
    setSelectedRegion(region);
    setSelectedState(null);
  };

  const handleStateClick = (state: StateStats) => {
    setSelectedState(state);
  };

  const handleBackFromRegion = () => {
    setSelectedRegion(null);
    setSelectedState(null);
  };

  const handleBackFromState = () => {
    setSelectedState(null);
  };

  const CentreCard = ({ centre }: { centre: typeof centresWithRegion[0] }) => {
    const capacity = capacityMap.get(centre.centre_id);
    const centresSports = centreSportsMap.get(centre.centre_id) || [];
    const utilizationPct = capacity?.sanctioned ? Math.round((capacity.existing / capacity.sanctioned) * 100) : 0;
    const isClickable = centre.centre_type === "NCOE" || centre.centre_type === "STC";
    
    return (
      <Card 
        className={cn(
          "hover:shadow-lg transition-shadow h-full",
          isClickable && "cursor-pointer"
        )}
        onClick={() => handleCentreClick(centre)}
      >
        <CardContent className="pt-5 pb-4 h-full flex flex-col">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium mb-1 line-clamp-2 text-sm">{centre.centre_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3" />
                {centre.district ? `${centre.district}, ` : ""}{centre.state}
              </p>
              
              {centresSports.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {centresSports.slice(0, 3).map(sport => (
                      <Badge key={sport} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {sport}
                      </Badge>
                    ))}
                    {centresSports.length > 3 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        +{centresSports.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {capacity && capacity.sanctioned > 0 && (
                <div className="mt-auto pt-2 border-t">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Athletes
                    </span>
                    <span className="font-medium">{capacity.existing} / {capacity.sanctioned}</span>
                  </div>
                  <Progress value={utilizationPct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground text-right mt-0.5">{utilizationPct}% capacity</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
            <Badge className={cn("text-xs", centreTypeColors[centre.centre_type] || "bg-muted")}>
              {centre.centre_type}
            </Badge>
            {centre.operational_status && (
              <Badge variant="outline" className="text-[10px]">
                {centre.operational_status}
              </Badge>
            )}
            {isClickable && (
              <Badge variant="outline" className="text-[10px] ml-auto">
                Click for details
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render region detail view
  if (selectedRegion && mainView === "region") {
    if (selectedState) {
      return (
        <DashboardLayout>
          <PageSEO
            title={`${selectedState.stateName} Infrastructure`}
            description={`Sports training centres in ${selectedState.stateName}`}
            canonicalPath="/infrastructure"
            keywords={["Sports Infrastructure", selectedState.stateName]}
          />
          <StateDetail
            state={selectedState}
            centres={centresForSelectedState}
            sportsList={sportsForSelectedState}
            onClose={handleBackFromState}
            onCentreClick={handleCentreClick}
            capacityMap={capacityMap}
            centreSportsMap={centreSportsMap}
          />
          <CentreDetailDialog
            centre={selectedCentre}
            capacityData={selectedCentre ? centreCapacityDataMap.get(selectedCentre.centre_id) || [] : []}
            sports={selectedCentre ? centreSportsMap.get(selectedCentre.centre_id) || [] : []}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        <PageSEO
          title={`${selectedRegion.regionName} Infrastructure`}
          description={`Sports training centres in ${selectedRegion.regionName}`}
          canonicalPath="/infrastructure"
          keywords={["Sports Infrastructure", selectedRegion.regionName]}
        />
        <RegionalCentreDetail
          region={selectedRegion}
          centres={centresForSelectedRegion}
          stateStats={statesForSelectedRegion}
          sportsList={sportsForSelectedRegion}
          onClose={handleBackFromRegion}
          onCentreClick={handleCentreClick}
          onStateClick={handleStateClick}
          capacityMap={capacityMap}
          centreSportsMap={centreSportsMap}
        />
        <CentreDetailDialog
          centre={selectedCentre}
          capacityData={selectedCentre ? centreCapacityDataMap.get(selectedCentre.centre_id) || [] : []}
          sports={selectedCentre ? centreSportsMap.get(selectedCentre.centre_id) || [] : []}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </DashboardLayout>
    );
  }

  // Render state detail view
  if (selectedState && mainView === "state") {
    return (
      <DashboardLayout>
        <PageSEO
          title={`${selectedState.stateName} Infrastructure`}
          description={`Sports training centres in ${selectedState.stateName}`}
          canonicalPath="/infrastructure"
          keywords={["Sports Infrastructure", selectedState.stateName]}
        />
        <StateDetail
          state={selectedState}
          centres={centresForSelectedState}
          sportsList={sportsForSelectedState}
          onClose={() => setSelectedState(null)}
          onCentreClick={handleCentreClick}
          capacityMap={capacityMap}
          centreSportsMap={centreSportsMap}
        />
        <CentreDetailDialog
          centre={selectedCentre}
          capacityData={selectedCentre ? centreCapacityDataMap.get(selectedCentre.centre_id) || [] : []}
          sports={selectedCentre ? centreSportsMap.get(selectedCentre.centre_id) || [] : []}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageSEO
        title="Infrastructure - Sports Training Centers"
        description="Explore 1,100+ sports training centers across India including NCOE, STC, KIC, and KISCE facilities. Filter by region, state, and center type."
        canonicalPath="/infrastructure"
        keywords={["NCOE Centers", "STC Training", "KIC Centers", "KISCE", "Sports Authority of India", "Training Facilities"]}
        jsonLd={infrastructurePageSchema}
        breadcrumbs={infrastructureBreadcrumbs}
      />
      
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl mb-2">Infrastructure</h1>
          <p className="text-muted-foreground">
            Explore India's sports training ecosystem across {stats.regions} regional centres and {stats.states} states
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 shrink-0">
          <Link to="/infrastructure/insights">
            <TrendingUp className="h-4 w-4" />
            View Insights
          </Link>
        </Button>
      </div>

      {/* Global Search */}
      <div className="mb-6 max-w-2xl">
        <GlobalSearchTrigger placeholder="Search sports, states, districts, centres, events…" />
      </div>


      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <Card className="col-span-2">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Total Centres</span>
            </div>
            <p className="text-3xl font-display">{stats.total}</p>
            <p className="text-xs text-muted-foreground">{stats.regions} regions • {stats.states} states</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setMainView("type"); setActiveTab("NCOE"); }}>
          <CardContent className="pt-4">
            <Badge className="bg-saffron text-white mb-1">NCOE</Badge>
            <p className="text-2xl font-display">{stats.ncoe}</p>
            <p className="text-[10px] text-muted-foreground">National Centres</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setMainView("type"); setActiveTab("STC"); }}>
          <CardContent className="pt-4">
            <Badge className="bg-india-green text-white mb-1">STC</Badge>
            <p className="text-2xl font-display">{stats.stc}</p>
            <p className="text-[10px] text-muted-foreground">State Centres</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setMainView("type"); setActiveTab("KIC"); }}>
          <CardContent className="pt-4">
            <Badge className="bg-purple-600 text-white mb-1">KIC</Badge>
            <p className="text-2xl font-display">{stats.kic}</p>
            <p className="text-[10px] text-muted-foreground">Khelo India</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setMainView("type"); setActiveTab("KISCE"); }}>
          <CardContent className="pt-4">
            <Badge className="bg-india-navy text-white mb-1">KISCE</Badge>
            <p className="text-2xl font-display">{stats.kisce}</p>
            <p className="text-[10px] text-muted-foreground">Excellence Ctrs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation Tabs */}
      <div className="mb-6">
        <InfrastructureNavTabs activeView={mainView} onViewChange={setMainView} />
      </div>

      {/* By Region View */}
      {mainView === "region" && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {regionStats.length} SAI Regional Centres
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regionStats.map(region => (
                <RegionalCentreCard
                  key={region.regionName}
                  region={region}
                  onClick={() => handleRegionClick(region)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* By State View */}
      {mainView === "state" && (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Showing {stateStats.length} States & Union Territories
          </p>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stateStats.map(state => (
                <StateCard
                  key={state.stateName}
                  state={state}
                  onClick={() => handleStateClick(state)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* By Centre Type View */}
      {mainView === "type" && (
        <>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search centres by name, state, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={sportFilter} onValueChange={setSportFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Target className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports?.map((sport) => (
                    <SelectItem key={sport.sport_id} value={sport.sport_id}>{sport.sport_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {stateStats.map((s) => (
                    <SelectItem key={s.stateName} value={s.stateName}>{s.stateName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {stateFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    State: {stateFilter}
                    <button onClick={() => setStateFilter("all")} className="ml-1 hover:text-destructive">&times;</button>
                  </Badge>
                )}
                {sportFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Sport: {sports?.find(s => s.sport_id === sportFilter)?.sport_name}
                    <button onClick={() => setSportFilter("all")} className="ml-1 hover:text-destructive">&times;</button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{searchTerm}"
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-destructive">&times;</button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
              </div>
            )}
          </div>

          {/* Centre Type Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-10 mb-4">
              <TabsTrigger value="all" className="text-xs">
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="NCOE" className="text-xs gap-1">
                <span className="hidden sm:inline">NCOE</span> ({stats.ncoe})
              </TabsTrigger>
              <TabsTrigger value="STC" className="text-xs gap-1">
                <span className="hidden sm:inline">STC</span> ({stats.stc})
              </TabsTrigger>
              <TabsTrigger value="KIC" className="text-xs gap-1">
                <span className="hidden sm:inline">KIC</span> ({stats.kic})
              </TabsTrigger>
              <TabsTrigger value="KISCE" className="text-xs gap-1">
                <span className="hidden sm:inline">KISCE</span> ({stats.kisce})
              </TabsTrigger>
            </TabsList>

            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredCentres.length} centres
              {activeTab !== "all" && ` (${activeTab})`}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCentres.map((centre) => (
                  <CentreCard key={centre.centre_id} centre={centre} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCentres.map((centre) => {
                  const capacity = capacityMap.get(centre.centre_id);
                  const centresSports = centreSportsMap.get(centre.centre_id) || [];
                  const isClickable = centre.centre_type === "NCOE" || centre.centre_type === "STC";
                  
                  return (
                    <Card 
                      key={centre.centre_id} 
                      className={cn(
                        "hover:shadow-md transition-shadow",
                        isClickable && "cursor-pointer"
                      )}
                      onClick={() => handleCentreClick(centre)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{centre.centre_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {centre.district ? `${centre.district}, ` : ""}{centre.state}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            {centresSports.length > 0 && (
                              <div className="hidden md:flex gap-1">
                                {centresSports.slice(0, 2).map(sport => (
                                  <Badge key={sport} variant="secondary" className="text-[10px]">{sport}</Badge>
                                ))}
                                {centresSports.length > 2 && (
                                  <Badge variant="outline" className="text-[10px]">+{centresSports.length - 2}</Badge>
                                )}
                              </div>
                            )}
                            
                            {capacity && capacity.sanctioned > 0 && (
                              <div className="text-right hidden sm:block">
                                <span className="text-sm font-medium">{capacity.existing}</span>
                                <span className="text-xs text-muted-foreground"> / {capacity.sanctioned}</span>
                              </div>
                            )}
                            
                            <Badge className={cn("text-xs", centreTypeColors[centre.centre_type] || "bg-muted")}>
                              {centre.centre_type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredCentres.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No centres found matching your criteria</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
              </div>
            )}
          </Tabs>
        </>
      )}

      {/* Centre Detail Dialog */}
      <CentreDetailDialog
        centre={selectedCentre}
        capacityData={selectedCentre ? centreCapacityDataMap.get(selectedCentre.centre_id) || [] : []}
        sports={selectedCentre ? centreSportsMap.get(selectedCentre.centre_id) || [] : []}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </DashboardLayout>
  );
};

export default Infrastructure;
