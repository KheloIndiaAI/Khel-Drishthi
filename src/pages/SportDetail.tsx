import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, 
  Trophy, 
  Building2, 
  Medal,
  FileText,
  MapPin,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  AlertTriangle,
  Info
} from "lucide-react";

const SportDetail = () => {
  const { sportId } = useParams<{ sportId: string }>();

  // Fetch sport details
  const { data: sport, isLoading: sportLoading } = useQuery({
    queryKey: ["sport", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .eq("sport_id", sportId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Fetch events for this sport
  const { data: events } = useQuery({
    queryKey: ["sport-events", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("sport_id", sportId)
        .order("event_std");
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
  });

  // Fetch NCOE capacity for this sport
  const { data: ncoeCapacity } = useQuery({
    queryKey: ["sport-ncoe", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ncoe_capacity")
        .select("*")
        .eq("sport_id", sportId)
        .order("ex_grand_total", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
  });

  // Fetch STC capacity for this sport
  const { data: stcCapacity } = useQuery({
    queryKey: ["sport-stc", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stc_capacity")
        .select("*")
        .eq("sport_id", sportId)
        .order("ex_grand_total", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
  });

  // Fetch medals for this sport (match by sport_id OR sport_std)
  const { data: medals } = useQuery({
    queryKey: ["sport-medals", sportId, sport?.sport_name],
    queryFn: async () => {
      // First try by sport_id
      let { data, error } = await supabase
        .from("olympic_medals")
        .select("*")
        .eq("sport_id", sportId!)
        .order("year", { ascending: false });
      
      // If no results, try matching by sport_std (sport name)
      if ((!data || data.length === 0) && sport?.sport_name) {
        const result = await supabase
          .from("olympic_medals")
          .select("*")
          .ilike("sport_std", sport.sport_name)
          .order("year", { ascending: false });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && !!sport,
  });

  // Fetch participation data for this sport
  const { data: participation } = useQuery({
    queryKey: ["sport-participation", sportId, sport?.sport_name],
    queryFn: async () => {
      // First try by sport_id
      let { data, error } = await supabase
        .from("olympic_participation")
        .select("*")
        .eq("sport_id", sportId!)
        .order("year", { ascending: false });
      
      // If no results, try matching by sport_std (sport name)
      if ((!data || data.length === 0) && sport?.sport_name) {
        const result = await supabase
          .from("olympic_participation")
          .select("*")
          .ilike("sport_std", sport.sport_name)
          .order("year", { ascending: false });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && !!sport,
  });

  // Fetch notes for this sport
  const { data: notes } = useQuery({
    queryKey: ["sport-notes", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sport_notes")
        .select("*")
        .eq("sport_id", sportId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
  });

  if (sportLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sport) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-display mb-4">Sport Not Found</h2>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate stats
  const la28Events = events?.filter((e) => e.present_la28 === 1) || [];
  const ag2026Events = events?.filter((e) => e.present_ag2026 === 1) || [];
  const bothGamesEvents = events?.filter((e) => e.present_la28 === 1 && e.present_ag2026 === 1) || [];
  const la28OnlyEvents = events?.filter((e) => e.present_la28 === 1 && e.present_ag2026 !== 1) || [];
  const ag26OnlyEvents = events?.filter((e) => e.present_ag2026 === 1 && e.present_la28 !== 1) || [];
  
  // Gender breakdown
  const menEvents = events?.filter((e) => e.gender_std === "Men") || [];
  const womenEvents = events?.filter((e) => e.gender_std === "Women") || [];
  const mixedEvents = events?.filter((e) => e.gender_std === "Mixed") || [];
  
  const ncoeAthletes = ncoeCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const ncoeSanctioned = ncoeCapacity?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const stcAthletes = stcCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const stcSanctioned = stcCapacity?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  
  const totalAthletes = ncoeAthletes + stcAthletes;
  const totalSanctioned = ncoeSanctioned + stcSanctioned;
  const utilizationPct = totalSanctioned > 0 ? Math.round((totalAthletes / totalSanctioned) * 100) : 0;

  const goldCount = medals?.filter(m => m.medal === "Gold").length || 0;
  const silverCount = medals?.filter(m => m.medal === "Silver").length || 0;
  const bronzeCount = medals?.filter(m => m.medal === "Bronze").length || 0;

  // Status helpers
  const getNisDiplomaStatus = () => {
    const status = sport.nis_diploma_status?.toLowerCase();
    if (status === "yes") return { icon: CheckCircle, color: "text-india-green", bg: "bg-india-green/10", label: "Yes" };
    if (status === "no") return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "No" };
    if (status === "proposed") return { icon: Clock, color: "text-saffron", bg: "bg-saffron/10", label: "Proposed" };
    return { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
  };

  const getAsmitaStatus = () => {
    const status = sport.asmita_league_status?.toLowerCase();
    if (status === "yes") return { icon: CheckCircle, color: "text-india-green", bg: "bg-india-green/10", label: "Yes" };
    if (status === "no") return { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "No" };
    return { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-muted", label: "Unknown" };
  };

  const getCategoryStatus = () => {
    const cat = sport.sport_category;
    if (cat === "Demand+Supply") return { icon: CheckCircle, color: "text-india-green", bg: "bg-india-green/10 border-india-green/30", label: "Has Games Presence + Infrastructure", emoji: "✅" };
    if (cat === "DemandOnly") return { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700", label: "In Games but No SAI Infrastructure", emoji: "⚠️" };
    if (cat === "SupplyOnly") return { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700", label: "Has Infrastructure but Not in Major Games", emoji: "ℹ️" };
    return { icon: HelpCircle, color: "text-muted-foreground", bg: "bg-muted border-border", label: "Unknown", emoji: "❓" };
  };

  const nisStatus = getNisDiplomaStatus();
  const asmitaStatus = getAsmitaStatus();
  const categoryStatus = getCategoryStatus();

  return (
    <TooltipProvider>
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-3 text-sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          All Sports
        </Link>
        
        <h1 className="font-display text-3xl md:text-4xl mb-3">{sport.sport_name}</h1>
        
        {/* Unified Status Row */}
        <div className="flex flex-wrap items-center gap-2">
          {sport.present_la28 && <Badge className="bg-saffron text-white">LA 2028</Badge>}
          {sport.present_ag2026 && <Badge className="bg-india-green text-white">AG 2026</Badge>}
          
          {sport.is_tops && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-saffron hover:bg-saffron/90 text-white gap-1 cursor-help">
                  <Trophy className="h-3 w-3" />
                  TOPS
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Target Olympic Podium Scheme</p>
              </TooltipContent>
            </Tooltip>
          )}
          {sport.is_tagg && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-blue-600 hover:bg-blue-600/90 text-white gap-1 cursor-help">
                  <Target className="h-3 w-3" />
                  TAGG
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Target Asian Games Group</p>
              </TooltipContent>
            </Tooltip>
          )}
          {sport.is_teams && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-purple-600 hover:bg-purple-600/90 text-white gap-1 cursor-help">
                  <Users className="h-3 w-3" />
                  TEAMS
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Training of Elite Athlete Management Support</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <div className="flex items-center gap-1 text-sm">
            <nisStatus.icon className={`h-3.5 w-3.5 ${nisStatus.color}`} />
            <span className="text-muted-foreground">NIS Diploma:</span>
            <span className={`font-medium ${nisStatus.color}`}>{nisStatus.label}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <asmitaStatus.icon className={`h-3.5 w-3.5 ${asmitaStatus.color}`} />
            <span className="text-muted-foreground">Asmita League:</span>
            <span className={`font-medium ${asmitaStatus.color}`}>{asmitaStatus.label}</span>
          </div>
        </div>
      </div>

      {/* Overview Dashboard - All key info at a glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Events Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Events</span>
            </div>
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-2xl font-display">{la28Events.length}</span>
                <span className="text-xs text-muted-foreground ml-1">LA28</span>
              </div>
              <div>
                <span className="text-2xl font-display">{ag2026Events.length}</span>
                <span className="text-xs text-muted-foreground ml-1">AG26</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medals Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Medal className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Olympic Medals</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display">{medals?.length || 0}</span>
              {(medals?.length || 0) > 0 && (
                <div className="flex gap-1.5 text-xs">
                  {goldCount > 0 && <span className="text-yellow-500">{goldCount}G</span>}
                  {silverCount > 0 && <span className="text-gray-400">{silverCount}S</span>}
                  {bronzeCount > 0 && <span className="text-amber-700">{bronzeCount}B</span>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Centres</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-3">
              <div>
                <span className="text-xl font-display">{ncoeCapacity?.length || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">NCOE</span>
              </div>
              <div>
                <span className="text-xl font-display">{stcCapacity?.length || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">STC</span>
              </div>
              <div>
                <span className="text-xl font-display">{sport.kic_centres || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">KIC</span>
              </div>
              <div>
                <span className="text-xl font-display">{sport.kisce_centres || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">KISCE</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Athletes Card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Athletes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display">{totalAthletes}</span>
              <span className="text-xs text-muted-foreground">/ {totalSanctioned}</span>
            </div>
            <Progress value={utilizationPct} className="h-1.5 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{utilizationPct}% capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Analysis Section - Reworked for clarity */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Events Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Primary Focus: Games Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* LA28 Events */}
            <Card className="bg-saffron/5 border-saffron/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-saffron" />
                  <h4 className="font-semibold text-saffron">LA 2028 Olympics</h4>
                </div>
                <p className="text-3xl font-bold mb-2">{la28Events.length}</p>
                <p className="text-xs text-muted-foreground">medal events</p>
                {la28OnlyEvents.length > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs border-saffron/50 text-saffron">
                    {la28OnlyEvents.length} exclusive to Olympics
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Asian Games 2026 Events */}
            <Card className="bg-india-green/5 border-india-green/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-3 w-3 rounded-full bg-india-green" />
                  <h4 className="font-semibold text-india-green">Asian Games 2026</h4>
                </div>
                <p className="text-3xl font-bold mb-2">{ag2026Events.length}</p>
                <p className="text-xs text-muted-foreground">medal events</p>
                {ag26OnlyEvents.length > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs border-india-green/50 text-india-green">
                    {ag26OnlyEvents.length} exclusive to Asian Games
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Common Events */}
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    <div className="h-3 w-3 rounded-full bg-saffron" />
                    <div className="h-3 w-3 rounded-full bg-india-green -ml-1" />
                  </div>
                  <h4 className="font-semibold">Common to Both</h4>
                </div>
                <p className="text-3xl font-bold mb-2">{bothGamesEvents.length}</p>
                <p className="text-xs text-muted-foreground">shared events</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Athletes can compete in both LA28 & AG26
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gender Breakdown */}
          <div className="mb-6">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Gender Distribution</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-600">{menEvents.length}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <span className="text-blue-500">♂</span> Men's Events
                </p>
              </div>
              <div className="bg-pink-500/10 rounded-lg p-3 text-center border border-pink-500/20">
                <p className="text-2xl font-bold text-pink-600">{womenEvents.length}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <span className="text-pink-500">♀</span> Women's Events
                </p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-600">{mixedEvents.length}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <span className="text-purple-500">⚥</span> Mixed Events
                </p>
              </div>
            </div>
          </div>

          {/* Event Lists by Category */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Event Details</h4>
            <Tabs defaultValue="common" className="w-full">
              <TabsList className="w-full grid grid-cols-4 h-9 mb-3">
                <TabsTrigger value="common" className="text-xs gap-1">
                  <span className="hidden sm:inline">Common</span> ({bothGamesEvents.length})
                </TabsTrigger>
                <TabsTrigger value="la28only" className="text-xs gap-1">
                  <span className="hidden sm:inline">LA28 Only</span> ({la28OnlyEvents.length})
                </TabsTrigger>
                <TabsTrigger value="ag26only" className="text-xs gap-1">
                  <span className="hidden sm:inline">AG26 Only</span> ({ag26OnlyEvents.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs gap-1">
                  <span className="hidden sm:inline">All</span> ({events?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* Common Events */}
              <TabsContent value="common" className="mt-0">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-3 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Events that athletes can compete in at both LA 2028 Olympics and Asian Games 2026
                    </p>
                    {bothGamesEvents.length > 0 ? (
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {bothGamesEvents.map((event) => (
                          <div key={event.event_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                            <span className="truncate flex-1">{event.event_std}</span>
                            <div className="flex gap-1.5 ml-2">
                              <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                {event.gender_std}
                              </Badge>
                              <div className="flex gap-0.5">
                                <div className="h-2 w-2 rounded-full bg-saffron" title="LA28" />
                                <div className="h-2 w-2 rounded-full bg-india-green" title="AG26" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No common events between LA28 and AG26</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* LA28 Only Events */}
              <TabsContent value="la28only" className="mt-0">
                <Card className="bg-saffron/5 border-saffron/20">
                  <CardContent className="pt-3 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Events exclusive to LA 2028 Olympics (not in Asian Games 2026)
                    </p>
                    {la28OnlyEvents.length > 0 ? (
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {la28OnlyEvents.map((event) => (
                          <div key={event.event_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                            <span className="truncate flex-1">{event.event_std}</span>
                            <div className="flex gap-1.5 ml-2">
                              <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                {event.gender_std}
                              </Badge>
                              <div className="h-2 w-2 rounded-full bg-saffron" title="LA28" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No events exclusive to LA28</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AG26 Only Events */}
              <TabsContent value="ag26only" className="mt-0">
                <Card className="bg-india-green/5 border-india-green/20">
                  <CardContent className="pt-3 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Events exclusive to Asian Games 2026 (not in LA 2028 Olympics)
                    </p>
                    {ag26OnlyEvents.length > 0 ? (
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {ag26OnlyEvents.map((event) => (
                          <div key={event.event_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                            <span className="truncate flex-1">{event.event_std}</span>
                            <div className="flex gap-1.5 ml-2">
                              <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                {event.gender_std}
                              </Badge>
                              <div className="h-2 w-2 rounded-full bg-india-green" title="AG26" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No events exclusive to AG26</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Events */}
              <TabsContent value="all" className="mt-0">
                <Card>
                  <CardContent className="pt-3 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">
                      Complete list of all events for this sport
                    </p>
                    {events && events.length > 0 ? (
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {events.map((event) => (
                          <div key={event.event_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                            <span className="truncate flex-1">{event.event_std}</span>
                            <div className="flex gap-1.5 ml-2">
                              <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                {event.gender_std}
                              </Badge>
                              <div className="flex gap-0.5">
                                {event.present_la28 === 1 && <div className="h-2 w-2 rounded-full bg-saffron" title="LA28" />}
                                {event.present_ag2026 === 1 && <div className="h-2 w-2 rounded-full bg-india-green" title="AG26" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No events found</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Olympic History Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Medals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-4 w-4" />
              Olympic Medals ({medals?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medals && medals.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {medals.map((medal) => (
                  <div key={medal.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{medal.athlete_or_team}</p>
                      <p className="text-xs text-muted-foreground truncate">{medal.event_raw}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <Badge className={
                        medal.medal === "Gold" ? "medal-gold" :
                        medal.medal === "Silver" ? "medal-silver" :
                        "medal-bronze"
                      }>
                        {medal.medal}
                      </Badge>
                      <span className="text-xs font-medium">{medal.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No Olympic medals yet</p>
            )}
          </CardContent>
        </Card>

        {/* Participation History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Olympic Participation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participation && participation.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {participation.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{p.games_name || 'Olympics'}</span>
                      <span className="text-xs text-muted-foreground">({p.year})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{p.athletes}</span>
                      <span className="text-xs text-muted-foreground">athletes</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No participation data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure & Notes Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Training Centres */}
        <div className="lg:col-span-2">
          {(ncoeCapacity && ncoeCapacity.length > 0) || (stcCapacity && stcCapacity.length > 0) ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Training Centres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={ncoeCapacity && ncoeCapacity.length > 0 ? "ncoe" : "stc"} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-9 mb-4">
                    <TabsTrigger value="ncoe" className="gap-2" disabled={!ncoeCapacity || ncoeCapacity.length === 0}>
                      <Badge className="bg-saffron text-white text-[10px] px-1.5">NCOE</Badge>
                      {ncoeCapacity?.length || 0} Centres
                    </TabsTrigger>
                    <TabsTrigger value="stc" className="gap-2" disabled={!stcCapacity || stcCapacity.length === 0}>
                      <Badge className="bg-india-green text-white text-[10px] px-1.5">STC</Badge>
                      {stcCapacity?.length || 0} Centres
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ncoe" className="mt-0">
                    {ncoeCapacity && ncoeCapacity.length > 0 && (
                      <>
                        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                          <span>Total: {ncoeCapacity.length} centres</span>
                          <span className="font-medium">{ncoeAthletes} / {ncoeSanctioned} athletes</span>
                        </div>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {ncoeCapacity.map((centre) => {
                            const pct = centre.san_grand_total ? Math.round((centre.ex_grand_total || 0) / centre.san_grand_total * 100) : 0;
                            return (
                              <div key={centre.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm">{centre.centre_name}</span>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    <span>{centre.state}</span>
                                    {centre.is_para && <Badge variant="outline" className="text-[10px] h-4 ml-1">Para</Badge>}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="font-bold text-lg">{centre.ex_grand_total || 0}</span>
                                    <span className="text-muted-foreground text-sm">/ {centre.san_grand_total || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Progress value={pct} className="h-1.5 w-20" />
                                    <span className="text-xs text-muted-foreground w-9">{pct}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="stc" className="mt-0">
                    {stcCapacity && stcCapacity.length > 0 && (
                      <>
                        <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                          <span>Total: {stcCapacity.length} centres</span>
                          <span className="font-medium">{stcAthletes} / {stcSanctioned} athletes</span>
                        </div>
                        <div className="space-y-1 max-h-80 overflow-y-auto">
                          {stcCapacity.map((centre) => {
                            const pct = centre.san_grand_total ? Math.round((centre.ex_grand_total || 0) / centre.san_grand_total * 100) : 0;
                            return (
                              <div key={centre.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border-b last:border-0">
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium text-sm">{centre.centre_name}</span>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3" />
                                    <span>{centre.state}</span>
                                    {centre.is_para && <Badge variant="outline" className="text-[10px] h-4 ml-1">Para</Badge>}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="font-bold text-lg">{centre.ex_grand_total || 0}</span>
                                    <span className="text-muted-foreground text-sm">/ {centre.san_grand_total || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <Progress value={pct} className="h-1.5 w-20" />
                                    <span className="text-xs text-muted-foreground w-9">{pct}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No training centres found for this sport
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Notes */}
        <div className="space-y-4">
          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes ({notes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notes && notes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="p-2 rounded border text-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium truncate">{note.title}</span>
                        <Badge variant="outline" className="text-xs">{note.note_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No notes available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
    </TooltipProvider>
  );
};

export default SportDetail;
