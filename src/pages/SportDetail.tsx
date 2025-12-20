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
import { 
  ArrowLeft, 
  Trophy, 
  Building2, 
  Medal,
  FileText,
  MapPin,
  Users,
  CheckCircle2,
  Target,
  TrendingUp
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

  // Fetch medals for this sport
  const { data: medals } = useQuery({
    queryKey: ["sport-medals", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("olympic_medals")
        .select("*")
        .eq("sport_id", sportId)
        .order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!sportId,
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

  // Programme badges
  const programmes = [];
  if (sport.is_tops) programmes.push({ name: "TOPS", color: "bg-saffron text-white" });
  if (sport.is_tagg) programmes.push({ name: "TAGG", color: "bg-india-green text-white" });
  if (sport.is_teams) programmes.push({ name: "TEAMS", color: "bg-india-navy text-white" });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-3 text-sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          All Sports
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl md:text-4xl">{sport.sport_name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {sport.present_la28 && <Badge className="bg-saffron text-white">LA 2028</Badge>}
              {sport.present_ag2026 && <Badge className="bg-india-green text-white">AG 2026</Badge>}
              {programmes.map(p => (
                <Badge key={p.name} className={p.color}>{p.name}</Badge>
              ))}
              {programmes.length === 0 && (
                <Badge variant="outline" className="text-muted-foreground">No Special Programme</Badge>
              )}
            </div>
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
            <div className="flex items-baseline gap-4">
              <div>
                <span className="text-2xl font-display">{ncoeCapacity?.length || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">NCOE</span>
              </div>
              <div>
                <span className="text-2xl font-display">{stcCapacity?.length || 0}</span>
                <span className="text-xs text-muted-foreground ml-1">STC</span>
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

      {/* Main Content - Two Columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Infrastructure Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* NCOE Centres with Strength Breakup */}
          {ncoeCapacity && ncoeCapacity.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-saffron text-white">NCOE</Badge>
                    <span>{ncoeCapacity.length} Centres</span>
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {ncoeAthletes} / {ncoeSanctioned} athletes
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ncoeCapacity.map((centre) => {
                    const pct = centre.san_grand_total ? Math.round((centre.ex_grand_total || 0) / centre.san_grand_total * 100) : 0;
                    return (
                      <div key={centre.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{centre.centre_name}</span>
                            {centre.is_para && <Badge variant="outline" className="text-xs h-5">Para</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{centre.state}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 w-32">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium">{centre.ex_grand_total || 0}</span>
                            <span className="text-muted-foreground text-xs">/ {centre.san_grand_total || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Progress value={pct} className="h-1 w-16" />
                            <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* STC Centres with Strength Breakup */}
          {stcCapacity && stcCapacity.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-india-green text-white">STC</Badge>
                    <span>{stcCapacity.length} Centres</span>
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {stcAthletes} / {stcSanctioned} athletes
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stcCapacity.map((centre) => {
                    const pct = centre.san_grand_total ? Math.round((centre.ex_grand_total || 0) / centre.san_grand_total * 100) : 0;
                    return (
                      <div key={centre.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{centre.centre_name}</span>
                            {centre.is_para && <Badge variant="outline" className="text-xs h-5">Para</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{centre.state}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 w-32">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium">{centre.ex_grand_total || 0}</span>
                            <span className="text-muted-foreground text-xs">/ {centre.san_grand_total || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Progress value={pct} className="h-1 w-16" />
                            <span className="text-xs text-muted-foreground w-8">{pct}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {(!ncoeCapacity || ncoeCapacity.length === 0) && (!stcCapacity || stcCapacity.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No training centres found for this sport
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Events, Medals, Notes */}
        <div className="space-y-4">
          {/* Events Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="la28" className="w-full">
                <TabsList className="w-full grid grid-cols-2 h-8">
                  <TabsTrigger value="la28" className="text-xs">LA 2028 ({la28Events.length})</TabsTrigger>
                  <TabsTrigger value="ag26" className="text-xs">AG 2026 ({ag2026Events.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="la28" className="mt-2">
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {la28Events.slice(0, 10).map((event) => (
                      <div key={event.event_id} className="flex items-center justify-between text-sm py-1">
                        <span className="truncate flex-1">{event.event_std}</span>
                        <Badge variant="outline" className="text-xs ml-2">{event.gender_std}</Badge>
                      </div>
                    ))}
                    {la28Events.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">+{la28Events.length - 10} more</p>
                    )}
                    {la28Events.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No events</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="ag26" className="mt-2">
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {ag2026Events.slice(0, 10).map((event) => (
                      <div key={event.event_id} className="flex items-center justify-between text-sm py-1">
                        <span className="truncate flex-1">{event.event_std}</span>
                        <Badge variant="outline" className="text-xs ml-2">{event.gender_std}</Badge>
                      </div>
                    ))}
                    {ag2026Events.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">+{ag2026Events.length - 10} more</p>
                    )}
                    {ag2026Events.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">No events</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Medals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Medal className="h-4 w-4" />
                Olympic Medals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medals && medals.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {medals.map((medal) => (
                    <div key={medal.id} className="flex items-center justify-between py-1">
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
                        <span className="text-xs">{medal.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No Olympic medals</p>
              )}
            </CardContent>
          </Card>

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
  );
};

export default SportDetail;
