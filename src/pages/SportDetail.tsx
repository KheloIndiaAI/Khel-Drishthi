import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import GlobalContextSection from "@/components/sport/GlobalContextSection";
import SportHeroStrip from "@/components/sport/SportHeroStrip";
import SportInsights from "@/components/sport/SportInsights";
import { useSportPipeline } from "@/hooks/useSportPipeline";
import OlympicRecordTab from "@/components/sport/OlympicRecordTab";
import SportMapTab, { useSportCentres } from "@/components/sport/SportMapTab";
import WorldContextTab from "@/components/sport/WorldContextTab";
import PipelineTab from "@/components/sport/PipelineTab";


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
  Info,
  Edit2,
  Pin,
  PinOff
} from "lucide-react";

const SportDetail = () => {
  const { sportId } = useParams<{ sportId: string }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", content: "", note_type: "" });

  // Which tab is open — heavy reference queries only fire for the tab that needs them.
  const [activeTab, setActiveTab] = useState("overview");
  const needsEvents = activeTab === "events";
  const needsPipeline = activeTab === "pipeline";
  const needsMap = activeTab === "map";
  const needsWorld = activeTab === "world";

  // Fetch sport details
  const { data: sport, isLoading: sportLoading } = useQuery({
    queryKey: ["sport", sportId],
    staleTime: Infinity,
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

  // Pre-aggregated sport row (oly_v_pipeline) — powers hero strip + insights
  const { data: pipeline, isLoading: pipelineLoading } = useSportPipeline(sportId);
  const showOlympicRecord = pipeline?.archetype !== "C_non_olympic";

  // Map tab is hidden entirely when no centre in the system lists this sport.
  const { data: sportCentres, isError: sportCentresError } = useSportCentres(sportId);
  const showMap = (sportCentres?.length ?? 0) > 0;
  if (sportCentresError) console.warn("[sport] centre locations query failed");

  // Fetch events for this sport
  const { data: events } = useQuery({
    queryKey: ["sport-events", sportId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("sport_id", sportId)
        .order("event_std");
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && needsEvents,
  });

  // Fetch disciplines for this sport
  const { data: disciplines } = useQuery({
    queryKey: ["sport-disciplines", sportId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("disciplines")
        .select("*")
        .eq("sport_id", sportId)
        .order("discipline_std");
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && needsEvents,
  });

  // Fetch NCOE capacity for this sport
  const { data: ncoeCapacity } = useQuery({
    queryKey: ["sport-ncoe", sportId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ncoe_capacity")
        .select("*")
        .eq("sport_id", sportId)
        .order("ex_grand_total", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && needsPipeline,
  });

  // Fetch STC capacity for this sport
  const { data: stcCapacity } = useQuery({
    queryKey: ["sport-stc", sportId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stc_capacity")
        .select("*")
        .eq("sport_id", sportId)
        .order("ex_grand_total", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId && needsPipeline,
  });





  // Fetch notes for this sport
  const { data: notes } = useQuery({
    queryKey: ["sport-notes", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sport_notes")
        .select("*")
        .eq("sport_id", sportId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
  });

  // Group events by discipline - must be before early returns
  const eventsByDiscipline = useMemo(() => {
    if (!events || !disciplines) return {};
    
    return disciplines.reduce((acc, disc) => {
      const discEvents = events.filter(e => e.discipline_id === disc.discipline_id);
      acc[disc.discipline_id] = {
        name: disc.discipline_std,
        events: discEvents,
        la28Count: discEvents.filter(e => e.present_la28 === 1).length,
        ag26Count: discEvents.filter(e => e.present_ag2026 === 1).length,
        bothCount: discEvents.filter(e => e.present_la28 === 1 && e.present_ag2026 === 1).length
      };
      return acc;
    }, {} as Record<string, { name: string; events: typeof events; la28Count: number; ag26Count: number; bothCount: number }>);
  }, [events, disciplines]);

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

  // Event type breakdown
  const individualEvents = events?.filter((e) => e.event_type_std === "Individual") || [];
  const teamEvents = events?.filter((e) => e.event_type_std === "Team") || [];
  const duetEvents = events?.filter((e) => e.event_type_std === "Duet") || [];
  
  const ncoeAthletes = ncoeCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const ncoeSanctioned = ncoeCapacity?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const stcAthletes = stcCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const stcSanctioned = stcCapacity?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  
  const totalAthletes = ncoeAthletes + stcAthletes;
  const totalSanctioned = ncoeSanctioned + stcSanctioned;
  const utilizationPct = totalSanctioned > 0 ? Math.round((totalAthletes / totalSanctioned) * 100) : 0;




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

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setEditForm({
      title: note.title,
      content: note.content,
      note_type: note.note_type
    });
    setEditDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!editingNote) return;
    
    try {
      const { error } = await supabase
        .from("sport_notes")
        .update({
          title: editForm.title,
          content: editForm.content,
          note_type: editForm.note_type,
          updated_at: new Date().toISOString()
        })
        .eq("id", editingNote.id);

      if (error) throw error;

      toast({ title: "Note updated successfully" });
      setEditDialogOpen(false);
      setEditingNote(null);
      queryClient.invalidateQueries({ queryKey: ["sport-notes", sportId] });
    } catch (error) {
      toast({ title: "Failed to update note", variant: "destructive" });
    }
  };

  const handleTogglePin = async (note: any) => {
    try {
      const { error } = await supabase
        .from("sport_notes")
        .update({ is_pinned: !note.is_pinned })
        .eq("id", note.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["sport-notes", sportId] });
    } catch (error) {
      toast({ title: "Failed to update pin status", variant: "destructive" });
    }
  };

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
          {sport.present_la28 && <Badge className="bg-saffron text-on-saffron">LA 2028</Badge>}
          {sport.present_ag2026 && <Badge className="bg-india-green text-white">AG 2026</Badge>}
          
          {sport.is_tops && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-saffron hover:bg-saffron/90 text-on-saffron gap-1 cursor-help">
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

      {/* Hero strip — persistent, above the tabs */}
      <SportHeroStrip row={pipeline} isLoading={pipelineLoading} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto mb-4 -mx-1 px-1">
          <TabsList className="inline-flex w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {showOlympicRecord && <TabsTrigger value="record">Olympic Record</TabsTrigger>}
            {showOlympicRecord && <TabsTrigger value="world">World Context</TabsTrigger>}
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            {showMap && <TabsTrigger value="map">Map</TabsTrigger>}
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="world" className="mt-0">
          {needsWorld && showOlympicRecord && (
            <WorldContextTab sportId={sportId} sportName={sport?.sport_name ?? undefined} />
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          {needsMap && <SportMapTab sportId={sportId} sportName={sport?.sport_name ?? undefined} />}
        </TabsContent>


        <TabsContent value="events" className="mt-0">



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

          {/* Event Type Distribution */}
          {(individualEvents.length > 0 || teamEvents.length > 0 || duetEvents.length > 0) && (
            <div className="mb-6">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Event Type Distribution</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-500/10 rounded-lg p-3 text-center border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-600">{individualEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Individual Events</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 text-center border border-amber-500/20">
                  <p className="text-2xl font-bold text-amber-600">{teamEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Team Events</p>
                </div>
                <div className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20">
                  <p className="text-2xl font-bold text-cyan-600">{duetEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Duet Events</p>
                </div>
              </div>
            </div>
          )}

          {/* Events by Discipline */}
          {disciplines && disciplines.length > 1 && (
            <div className="mb-6">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Events by Discipline</h4>
              <Accordion type="single" collapsible className="w-full">
                {disciplines.map((disc) => {
                  const discData = eventsByDiscipline[disc.discipline_id];
                  if (!discData || discData.events.length === 0) return null;
                  return (
                    <AccordionItem key={disc.discipline_id} value={disc.discipline_id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium">{discData.name}</span>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-saffron">{discData.la28Count} LA28</span>
                            <span className="text-india-green">{discData.ag26Count} AG26</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {discData.events.map((event) => (
                            <div key={event.event_id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded hover:bg-muted/50">
                              <span className="truncate flex-1">{event.event_std}</span>
                              <div className="flex gap-1.5 ml-2">
                                <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                  {event.gender_std}
                                </Badge>
                                {event.event_type_std && (
                                  <Badge variant="outline" className="text-[10px] h-5">
                                    {event.event_type_std}
                                  </Badge>
                                )}
                                <div className="flex gap-0.5">
                                  {event.present_la28 === 1 && <div className="h-2 w-2 rounded-full bg-saffron" title="LA28" />}
                                  {event.present_ag2026 === 1 && <div className="h-2 w-2 rounded-full bg-india-green" title="AG26" />}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}

          {/* Event Lists by Category */}
          <div>
            <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Event Details</h4>
            <Tabs defaultValue="common" className="w-full">
              <TabsList className="w-full grid grid-cols-5 h-9 mb-3">
                <TabsTrigger value="common" className="text-xs gap-1">
                  <span className="hidden sm:inline">Common</span> ({bothGamesEvents.length})
                </TabsTrigger>
                <TabsTrigger value="la28only" className="text-xs gap-1">
                  <span className="hidden sm:inline">LA28</span> ({la28OnlyEvents.length})
                </TabsTrigger>
                <TabsTrigger value="ag26only" className="text-xs gap-1">
                  <span className="hidden sm:inline">AG26</span> ({ag26OnlyEvents.length})
                </TabsTrigger>
                <TabsTrigger value="compare" className="text-xs gap-1">
                  <span className="hidden sm:inline">Compare</span>
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

              {/* Compare Tab - Side by Side */}
              <TabsContent value="compare" className="mt-0">
                <Card>
                  <CardContent className="pt-3 pb-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      Side-by-side comparison of events across both games
                    </p>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Event</TableHead>
                            <TableHead className="text-xs">Gender</TableHead>
                            <TableHead className="text-xs text-center">LA28</TableHead>
                            <TableHead className="text-xs text-center">AG26</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {events && events.length > 0 ? (
                            events.map((event) => (
                              <TableRow key={event.event_id}>
                                <TableCell className="text-xs py-2 max-w-[200px] truncate">{event.event_std}</TableCell>
                                <TableCell className="text-xs py-2">
                                  <Badge variant="outline" className={`text-[10px] h-5 ${event.gender_std === "Men" ? "border-blue-300 text-blue-600" : event.gender_std === "Women" ? "border-pink-300 text-pink-600" : "border-purple-300 text-purple-600"}`}>
                                    {event.gender_std}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  {event.present_la28 === 1 ? (
                                    <div className="h-3 w-3 rounded-full bg-saffron mx-auto" title="In LA28" />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center py-2">
                                  {event.present_ag2026 === 1 ? (
                                    <div className="h-3 w-3 rounded-full bg-india-green mx-auto" title="In AG26" />
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                No events found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
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
        </TabsContent>

        {showOlympicRecord && (
        <TabsContent value="record" className="mt-0">
          <OlympicRecordTab
            sportId={sportId!}
            sportName={sport.sport_name}
            pipeline={pipeline}
            pipelineLoading={pipelineLoading}
          />
        </TabsContent>
        )}


        {/* Pipeline */}
        <TabsContent value="pipeline" className="mt-0">
        <PipelineTab
          sportId={sportId!}
          sportName={sport.sport_name}
          pipeline={pipeline}
          pipelineLoading={pipelineLoading}
          mapAvailable={showMap}
          onOpenMap={() => setActiveTab("map")}
        />
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <SportInsights row={pipeline} />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GlobalContextSection sportId={sportId!} />
            </div>

        {/* Notes */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes ({notes?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notes && notes.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notes.map((note) => (
                    <div 
                      key={note.id} 
                      className={`p-3 rounded-lg border text-sm group hover:shadow-sm transition-all ${
                        note.is_pinned ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {note.is_pinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                          <span className="font-medium truncate">{note.title}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            aria-label={note.is_pinned ? `Unpin note ${note.title}` : `Pin note ${note.title}`}
                            onClick={() => handleTogglePin(note)}
                          >
                            {note.is_pinned ? (
                              <PinOff className="h-3 w-3" />
                            ) : (
                              <Pin className="h-3 w-3" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            aria-label={`Edit note ${note.title}`}
                            onClick={() => handleEditNote(note)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>

                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[10px]">{note.note_type}</Badge>
                        {note.created_by_name && (
                          <span className="text-[10px] text-muted-foreground">by {note.created_by_name}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">{note.content}</p>
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
        </TabsContent>
      </Tabs>
      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input 
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Type</label>
              <Select value={editForm.note_type} onValueChange={(v) => setEditForm({ ...editForm, note_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <Textarea 
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveNote}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
    </TooltipProvider>
  );
};

export default SportDetail;
