import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Building2, 
  Target, 
  TrendingUp,
  AlertTriangle,
  Users,
  Trophy,
  BarChart3,
  PieChart,
  Layers,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap
} from "recharts";
import PageSEO from "@/components/seo/PageSEO";
import IndiaMap from "@/components/geographic/IndiaMap";

const COLORS = {
  NCOE: "#FF9933",
  STC: "#138808", 
  KIC: "#9333ea",
  KISCE: "#000080",
  primary: "#FF9933",
  accent: "#138808",
  navy: "#000080"
};

const CHART_COLORS = ["#FF9933", "#138808", "#000080", "#9333ea", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

const GeographicAnalytics = () => {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedCentreType, setSelectedCentreType] = useState<string>("all");
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [showAllStates, setShowAllStates] = useState(false);
  const [activeTab, setActiveTab] = useState("map");

  // Fetch centres
  const { data: centres, isLoading: centresLoading } = useQuery({
    queryKey: ["centres-geo"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centres")
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

  // Fetch sports
  const { data: sports } = useQuery({
    queryKey: ["sports-geo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("sport_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch centre-sport links
  const { data: centreSportLinks } = useQuery({
    queryKey: ["centre-sport-links-geo"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centre_sport_links")
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

  // Fetch events for event type distribution
  const { data: events } = useQuery({
    queryKey: ["events-geo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch event overlap
  const { data: eventOverlap } = useQuery({
    queryKey: ["event-overlap-geo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_overlap")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Get unique states
  const states = useMemo(() => {
    if (!centres) return [];
    return [...new Set(centres.map(c => c.state))].sort();
  }, [centres]);

  // State-wise analytics
  const stateAnalytics = useMemo(() => {
    if (!centres || !centreSportLinks) return [];

    const stateData: Record<string, {
      state: string;
      total: number;
      NCOE: number;
      STC: number;
      KIC: number;
      KISCE: number;
      sports: Set<string>;
      districts: Set<string>;
    }> = {};

    centres.forEach(centre => {
      if (!stateData[centre.state]) {
        stateData[centre.state] = {
          state: centre.state,
          total: 0,
          NCOE: 0,
          STC: 0,
          KIC: 0,
          KISCE: 0,
          sports: new Set(),
          districts: new Set()
        };
      }
      stateData[centre.state].total++;
      stateData[centre.state][centre.centre_type as keyof typeof stateData[string]]++;
      if (centre.district) stateData[centre.state].districts.add(centre.district);
    });

    centreSportLinks.forEach(link => {
      const centre = centres.find(c => c.centre_id === link.centre_id);
      if (centre && link.sport_name) {
        stateData[centre.state]?.sports.add(link.sport_name);
      }
    });

    return Object.values(stateData)
      .map(s => ({
        ...s,
        sportsCount: s.sports.size,
        districtsCount: s.districts.size,
        sportsList: Array.from(s.sports)
      }))
      .sort((a, b) => b.total - a.total);
  }, [centres, centreSportLinks]);

  // Centre type distribution
  const centreTypeDistribution = useMemo(() => {
    if (!centres) return [];
    const types: Record<string, number> = { NCOE: 0, STC: 0, KIC: 0, KISCE: 0 };
    centres.forEach(c => {
      if (types[c.centre_type] !== undefined) types[c.centre_type]++;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value, fill: COLORS[name as keyof typeof COLORS] }));
  }, [centres]);

  // Sports coverage by state
  const sportsCoverageByState = useMemo(() => {
    if (!centres || !centreSportLinks || !sports) return [];

    const coverage: Record<string, Record<string, boolean>> = {};
    
    centreSportLinks.forEach(link => {
      const centre = centres.find(c => c.centre_id === link.centre_id);
      if (centre && link.sport_id) {
        if (!coverage[centre.state]) coverage[centre.state] = {};
        coverage[centre.state][link.sport_id] = true;
      }
    });

    return Object.entries(coverage).map(([state, sportsCovered]) => ({
      state,
      covered: Object.keys(sportsCovered).length,
      total: sports.length,
      percentage: Math.round((Object.keys(sportsCovered).length / sports.length) * 100)
    })).sort((a, b) => b.covered - a.covered);
  }, [centres, centreSportLinks, sports]);

  // Infrastructure gaps
  const infrastructureGaps = useMemo(() => {
    if (!sports || !centreSportLinks || !centres) return [];

    const sportCentresCount: Record<string, { count: number; states: Set<string> }> = {};
    
    sports.forEach(sport => {
      sportCentresCount[sport.sport_id] = { count: 0, states: new Set() };
    });

    centreSportLinks.forEach(link => {
      const centre = centres.find(c => c.centre_id === link.centre_id);
      if (sportCentresCount[link.sport_id] && centre) {
        sportCentresCount[link.sport_id].count++;
        sportCentresCount[link.sport_id].states.add(centre.state);
      }
    });

    return sports
      .map(sport => ({
        sport_id: sport.sport_id,
        sport_name: sport.sport_name,
        centres: sportCentresCount[sport.sport_id]?.count || 0,
        statesWithCentres: sportCentresCount[sport.sport_id]?.states.size || 0,
        la28_events: sport.la28_events || 0,
        ag2026_events: sport.ag2026_events || 0,
        hasGap: (sportCentresCount[sport.sport_id]?.count || 0) < 5 && ((sport.la28_events || 0) > 0 || (sport.ag2026_events || 0) > 0)
      }))
      .filter(s => s.la28_events > 0 || s.ag2026_events > 0)
      .sort((a, b) => a.centres - b.centres);
  }, [sports, centreSportLinks, centres]);

  // Event type distribution
  const eventTypeDistribution = useMemo(() => {
    if (!events) return [];
    const types: Record<string, { la28: number; ag2026: number }> = {};
    
    events.forEach(event => {
      const type = event.event_type_std || 'Unknown';
      if (!types[type]) types[type] = { la28: 0, ag2026: 0 };
      if (event.present_la28) types[type].la28++;
      if (event.present_ag2026) types[type].ag2026++;
    });

    return Object.entries(types).map(([name, data]) => ({
      name,
      LA28: data.la28,
      AG2026: data.ag2026,
      total: data.la28 + data.ag2026
    })).sort((a, b) => b.total - a.total);
  }, [events]);

  // Gender distribution in events
  const genderDistribution = useMemo(() => {
    if (!events) return [];
    const genders: Record<string, number> = {};
    
    events.forEach(event => {
      const gender = event.gender_std || 'Unknown';
      genders[gender] = (genders[gender] || 0) + 1;
    });

    return Object.entries(genders).map(([name, value]) => ({
      name,
      value,
      fill: name === 'Men' ? COLORS.navy : name === 'Women' ? COLORS.primary : COLORS.accent
    }));
  }, [events]);

  // Filtered data
  const filteredStateData = useMemo(() => {
    let data = stateAnalytics;
    
    if (selectedState !== "all") {
      data = data.filter(s => s.state === selectedState);
    }
    
    return showAllStates ? data : data.slice(0, 15);
  }, [stateAnalytics, selectedState, showAllStates]);

  // Summary stats
  const summaryStats = useMemo(() => {
    if (!centres || !sports || !centreSportLinks) return null;
    
    const uniqueSportsWithCentres = new Set(centreSportLinks.map(l => l.sport_id)).size;
    const totalEvents = events?.length || 0;
    
    return {
      totalCentres: centres.length,
      totalStates: states.length,
      totalSports: sports.length,
      sportsWithCentres: uniqueSportsWithCentres,
      totalEvents
    };
  }, [centres, sports, centreSportLinks, events, states]);

  const clearFilters = () => {
    setSelectedState("all");
    setSelectedCentreType("all");
    setSelectedSport("all");
  };

  const hasActiveFilters = selectedState !== "all" || selectedCentreType !== "all" || selectedSport !== "all";

  if (centresLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageSEO
        title="Geographic Analytics - Sports Infrastructure Distribution"
        description="Analyze sports infrastructure distribution across Indian states. View center type concentration, sports diversity, and infrastructure gaps."
        canonicalPath="/geographic"
        keywords={["Geographic Analysis", "State-wise Sports", "Infrastructure Distribution", "Sports Mapping"]}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Geographic Analytics</h1>
        <p className="text-muted-foreground">
          Infrastructure distribution across {summaryStats?.totalStates} states & territories
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium">Total Centres</span>
            </div>
            <p className="text-3xl font-display">{summaryStats?.totalCentres.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium">States/UTs</span>
            </div>
            <p className="text-3xl font-display">{summaryStats?.totalStates}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs font-medium">Sports</span>
            </div>
            <p className="text-3xl font-display">{summaryStats?.totalSports}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Sports w/ Centres</span>
            </div>
            <p className="text-3xl font-display">{summaryStats?.sportsWithCentres}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium">Total Events</span>
            </div>
            <p className="text-3xl font-display">{summaryStats?.totalEvents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCentreType} onValueChange={setSelectedCentreType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="NCOE">NCOE</SelectItem>
                <SelectItem value="STC">STC</SelectItem>
                <SelectItem value="KIC">KIC</SelectItem>
                <SelectItem value="KISCE">KISCE</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {sports?.map(sport => (
                  <SelectItem key={sport.sport_id} value={sport.sport_id}>{sport.sport_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="map" className="gap-2">
            <Globe className="h-4 w-4" />
            Map
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="diversity" className="gap-2">
            <Layers className="h-4 w-4" />
            Diversity
          </TabsTrigger>
          <TabsTrigger value="gaps" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Gaps
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <PieChart className="h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Interactive Infrastructure Map
              </CardTitle>
              <CardDescription>
                Training centre locations across India. Click on markers for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndiaMap
                centres={centres || []}
                centreSportLinks={centreSportLinks || []}
                selectedState={selectedState}
                selectedCentreType={selectedCentreType}
                selectedSport={selectedSport === "all" ? undefined : sports?.find(s => s.sport_id === selectedSport)?.sport_name}
              />
            </CardContent>
          </Card>
          
          {/* Quick stats below map */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stateAnalytics.slice(0, 4).map((state) => (
              <Card key={state.state} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelectedState(state.state)}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{state.state}</span>
                    <Badge variant="secondary">{state.total}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {state.NCOE > 0 && <Badge className="text-[10px] px-1" style={{ backgroundColor: COLORS.NCOE }}>NCOE: {state.NCOE}</Badge>}
                    {state.STC > 0 && <Badge className="text-[10px] px-1" style={{ backgroundColor: COLORS.STC }}>STC: {state.STC}</Badge>}
                    {state.KIC > 0 && <Badge className="text-[10px] px-1" style={{ backgroundColor: COLORS.KIC }}>KIC: {state.KIC}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* State-wise Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  State-wise Centre Distribution
                </CardTitle>
                <CardDescription>Training centres by state and type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredStateData} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" />
                      <YAxis dataKey="state" type="category" width={75} tick={{ fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="NCOE" stackId="a" fill={COLORS.NCOE} name="NCOE" />
                      <Bar dataKey="STC" stackId="a" fill={COLORS.STC} name="STC" />
                      <Bar dataKey="KIC" stackId="a" fill={COLORS.KIC} name="KIC" />
                      <Bar dataKey="KISCE" stackId="a" fill={COLORS.KISCE} name="KISCE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {stateAnalytics.length > 15 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAllStates(!showAllStates)}
                    className="mt-2 w-full"
                  >
                    {showAllStates ? (
                      <>Show Less <ChevronUp className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Show All {stateAnalytics.length} States <ChevronDown className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Centre Type Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Centre Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={centreTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {centreTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {centreTypeDistribution.map(type => (
                    <div key={type.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.fill }} />
                      <span className="text-sm">{type.name}: {type.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* State Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>State-wise Detailed Statistics</CardTitle>
              <CardDescription>Comprehensive view of infrastructure per state</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">State</th>
                      <th className="text-center p-3 font-medium">Total</th>
                      <th className="text-center p-3 font-medium">NCOE</th>
                      <th className="text-center p-3 font-medium">STC</th>
                      <th className="text-center p-3 font-medium">KIC</th>
                      <th className="text-center p-3 font-medium">KISCE</th>
                      <th className="text-center p-3 font-medium">Sports</th>
                      <th className="text-center p-3 font-medium">Districts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateAnalytics.map((state, idx) => (
                      <tr key={state.state} className={cn("border-b", idx % 2 === 0 ? "bg-muted/30" : "")}>
                        <td className="p-3 font-medium">{state.state}</td>
                        <td className="text-center p-3">{state.total}</td>
                        <td className="text-center p-3">
                          <Badge variant="outline" style={{ borderColor: COLORS.NCOE, color: COLORS.NCOE }}>
                            {state.NCOE}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline" style={{ borderColor: COLORS.STC, color: COLORS.STC }}>
                            {state.STC}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline" style={{ borderColor: COLORS.KIC, color: COLORS.KIC }}>
                            {state.KIC}
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline" style={{ borderColor: COLORS.KISCE, color: COLORS.KISCE }}>
                            {state.KISCE}
                          </Badge>
                        </td>
                        <td className="text-center p-3">{state.sportsCount}</td>
                        <td className="text-center p-3">{state.districtsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diversity Tab */}
        <TabsContent value="diversity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sports Coverage by State */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Sports Coverage by State
                </CardTitle>
                <CardDescription>Number of sports with training facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {sportsCoverageByState.slice(0, 20).map((state, idx) => (
                      <div key={state.state} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{idx + 1}. {state.state}</span>
                          <span className="text-muted-foreground">{state.covered} sports ({state.percentage}%)</span>
                        </div>
                        <Progress value={state.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Diverse States Radar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Top 6 States - Diversity Profile
                </CardTitle>
                <CardDescription>Comparing centre types across top states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={stateAnalytics.slice(0, 6).map(s => ({
                      state: s.state.substring(0, 10),
                      NCOE: s.NCOE,
                      STC: s.STC,
                      KIC: Math.min(s.KIC, 100), // Cap for visibility
                      Sports: s.sportsCount
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="state" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis />
                      <Radar name="NCOE" dataKey="NCOE" stroke={COLORS.NCOE} fill={COLORS.NCOE} fillOpacity={0.3} />
                      <Radar name="STC" dataKey="STC" stroke={COLORS.STC} fill={COLORS.STC} fillOpacity={0.3} />
                      <Radar name="Sports" dataKey="Sports" stroke={COLORS.navy} fill={COLORS.navy} fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sports Diversity Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Sports Available by State</CardTitle>
              <CardDescription>Click on a state to see available sports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateAnalytics.slice(0, 9).map(state => (
                  <div key={state.state} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{state.state}</h4>
                      <Badge variant="secondary">{state.sportsCount} sports</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {state.sportsList.slice(0, 8).map(sport => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                      {state.sportsList.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{state.sportsList.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gaps Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sports with Infrastructure Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Sports with Infrastructure Gaps
                </CardTitle>
                <CardDescription>Olympic/Asian Games sports with limited training centres</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {infrastructureGaps.filter(s => s.hasGap).map(sport => (
                      <div key={sport.sport_id} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{sport.sport_name}</span>
                          <Badge variant="destructive">{sport.centres} centres</Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>LA28: {sport.la28_events} events</span>
                          <span>•</span>
                          <span>AG2026: {sport.ag2026_events} events</span>
                          <span>•</span>
                          <span>{sport.statesWithCentres} states</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Sports with Good Coverage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <TrendingUp className="h-5 w-5" />
                  Well-Covered Sports
                </CardTitle>
                <CardDescription>Sports with adequate training infrastructure</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {infrastructureGaps.filter(s => !s.hasGap && s.centres > 0).slice().reverse().slice(0, 15).map(sport => (
                      <div key={sport.sport_id} className="p-3 rounded-lg border border-accent/30 bg-accent/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{sport.sport_name}</span>
                          <Badge className="bg-accent text-white">{sport.centres} centres</Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>LA28: {sport.la28_events} events</span>
                          <span>•</span>
                          <span>AG2026: {sport.ag2026_events} events</span>
                          <span>•</span>
                          <span>{sport.statesWithCentres} states</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure Gap Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Centres per Sport (All Olympic/AG Sports)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={infrastructureGaps.slice(0, 25)} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="sport_name" type="category" width={95} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar 
                      dataKey="centres" 
                      fill={COLORS.primary}
                      radius={[0, 4, 4, 0]}
                    >
                      {infrastructureGaps.slice(0, 25).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.hasGap ? '#ef4444' : COLORS.accent} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Event Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Event Type Distribution
                </CardTitle>
                <CardDescription>Individual, Team, Duet events by games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventTypeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="LA28" fill={COLORS.primary} name="LA 2028" />
                      <Bar dataKey="AG2026" fill={COLORS.accent} name="AG 2026" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gender Distribution in Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={genderDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Overlap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                LA28 vs AG2026 Event Overlap
              </CardTitle>
              <CardDescription>Sports participating in both games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={eventOverlap?.slice(0, 20).map(e => ({
                      sport: e.sport_std,
                      "Only LA28": e.only_la28 || 0,
                      "Both Games": e.both_events || 0,
                      "Only AG2026": e.only_ag || 0
                    }))}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="sport" type="category" width={95} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Only LA28" stackId="a" fill={COLORS.primary} />
                    <Bar dataKey="Both Games" stackId="a" fill={COLORS.navy} />
                    <Bar dataKey="Only AG2026" stackId="a" fill={COLORS.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {eventTypeDistribution.map((type, idx) => (
              <Card key={type.name}>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground mb-1">{type.name} Events</div>
                  <p className="text-2xl font-display">{type.total}</p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <Badge style={{ backgroundColor: COLORS.primary }} className="text-white">
                      LA28: {type.LA28}
                    </Badge>
                    <Badge style={{ backgroundColor: COLORS.accent }} className="text-white">
                      AG: {type.AG2026}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default GeographicAnalytics;
