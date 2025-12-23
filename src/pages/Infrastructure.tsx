import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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

const Infrastructure = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedCentre, setSelectedCentre] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch centres (backend returns max 1000 rows per request, so page through)
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

  // Fetch sports for filter
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

  // Fetch centre-sport links for sport filter (page through for full coverage)
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

  // Fetch NCOE capacity with full details
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

  // Fetch STC capacity with full details
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

  // Summary statistics
  const stats = useMemo(() => {
    if (!centres) return { ncoe: 0, stc: 0, kic: 0, kisce: 0, total: 0, states: 0 };
    return {
      ncoe: centres.filter(c => c.centre_type === "NCOE").length,
      stc: centres.filter(c => c.centre_type === "STC").length,
      kic: centres.filter(c => c.centre_type === "KIC").length,
      kisce: centres.filter(c => c.centre_type === "KISCE").length,
      total: centres.length,
      states: new Set(centres.map(c => c.state)).size
    };
  }, [centres]);

  // State-wise distribution
  const stateDistribution = useMemo(() => {
    if (!centres) return [];
    const stateCounts: Record<string, number> = {};
    centres.forEach(c => {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
    });
    return Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [centres]);

  // Get unique regions
  const regions = useMemo(() => {
    if (!centres) return [];
    const regionSet = new Set(centres.map(c => c.region_unit).filter(Boolean));
    return Array.from(regionSet).sort();
  }, [centres]);

  // Get centre IDs for selected sport
  const sportCentreIds = sportFilter !== "all" && centreSportLinks
    ? new Set(centreSportLinks.filter(l => l.sport_id === sportFilter).map(l => l.centre_id))
    : null;

  // Filter centres
  const filteredCentres = useMemo(() => {
    return centres?.filter((centre) => {
      const matchesSearch = centre.centre_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        centre.district?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeTab === "all" || centre.centre_type === activeTab;
      const matchesState = stateFilter === "all" || centre.state === stateFilter;
      const matchesSport = !sportCentreIds || sportCentreIds.has(centre.centre_id);
      const matchesRegion = regionFilter === "all" || centre.region_unit === regionFilter;
      return matchesSearch && matchesType && matchesState && matchesSport && matchesRegion;
    }) || [];
  }, [centres, searchTerm, activeTab, stateFilter, sportCentreIds, regionFilter]);

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
    setRegionFilter("all");
  };

  const hasActiveFilters = searchTerm || stateFilter !== "all" || sportFilter !== "all" || regionFilter !== "all";

  const handleCentreClick = (centre: any) => {
    // Only show dialog for NCOE and STC centres (which have capacity data)
    if (centre.centre_type === "NCOE" || centre.centre_type === "STC") {
      setSelectedCentre(centre);
      setDialogOpen(true);
    }
  };

  const CentreCard = ({ centre }: { centre: typeof centres[0] }) => {
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
              
              {/* Sports offered */}
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
              
              {/* Capacity info */}
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Infrastructure</h1>
        <p className="text-muted-foreground">
          Explore India's sports training ecosystem across {stats.states} states
        </p>
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
            <p className="text-xs text-muted-foreground">across {stats.states} states</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("NCOE")}>
          <CardContent className="pt-4">
            <Badge className="bg-saffron text-white mb-1">NCOE</Badge>
            <p className="text-2xl font-display">{stats.ncoe}</p>
            <p className="text-[10px] text-muted-foreground">National Centres</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("STC")}>
          <CardContent className="pt-4">
            <Badge className="bg-india-green text-white mb-1">STC</Badge>
            <p className="text-2xl font-display">{stats.stc}</p>
            <p className="text-[10px] text-muted-foreground">State Centres</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("KIC")}>
          <CardContent className="pt-4">
            <Badge className="bg-purple-600 text-white mb-1">KIC</Badge>
            <p className="text-2xl font-display">{stats.kic}</p>
            <p className="text-[10px] text-muted-foreground">Khelo India</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab("KISCE")}>
          <CardContent className="pt-4">
            <Badge className="bg-india-navy text-white mb-1">KISCE</Badge>
            <p className="text-2xl font-display">{stats.kisce}</p>
            <p className="text-[10px] text-muted-foreground">Excellence Ctrs</p>
          </CardContent>
        </Card>
      </div>

      {/* State Distribution */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Top States by Training Centres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stateDistribution.map(([state, count]) => (
              <Button
                key={state}
                variant={stateFilter === state ? "default" : "outline"}
                className="justify-between h-auto py-2 px-3"
                onClick={() => setStateFilter(stateFilter === state ? "all" : state)}
              >
                <span className="text-sm truncate">{state}</span>
                <Badge variant="secondary" className="ml-2">{count}</Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters & Tabs */}
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
          
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
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
          <div className="flex items-center gap-2">
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
            {regionFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Region: {regionFilter}
                <button onClick={() => setRegionFilter("all")} className="ml-1 hover:text-destructive">&times;</button>
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

      {/* Tabbed Content */}
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredCentres.length} centres
          {activeTab !== "all" && ` (${activeTab})`}
        </p>

        {/* Centres Grid/List */}
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
