import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Target, 
  Trophy, 
  Building2, 
  Medal,
  FileText,
  MapPin,
  Users,
  CheckCircle,
  XCircle
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

  // Fetch centres for this sport from centre_sport_links
  const { data: centres } = useQuery({
    queryKey: ["sport-centres", sportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centre_sport_links")
        .select("*, centres(centre_name, state, district, centre_type)")
        .eq("sport_id", sportId);
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
        .eq("sport_id", sportId);
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
        .eq("sport_id", sportId);
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
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
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

  // Calculate actual counts from data
  const la28Events = events?.filter((e) => e.present_la28 === 1) || [];
  const ag2026Events = events?.filter((e) => e.present_ag2026 === 1) || [];
  const ncoeCentreCount = ncoeCapacity?.length || 0;
  const stcCentreCount = stcCapacity?.length || 0;
  const ncoeAthletes = ncoeCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const stcAthletes = stcCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const totalAthletes = ncoeAthletes + stcAthletes;

  const StatusIndicator = ({ status, label }: { status: string | null; label: string }) => {
    const isActive = status && status.toLowerCase() !== 'no' && status.toLowerCase() !== 'n/a';
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {isActive ? (
            <CheckCircle className="h-4 w-4 text-india-green" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">{status || 'N/A'}</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4 text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Sports
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl mb-2">{sport.sport_name}</h1>
            <div className="flex flex-wrap gap-2">
              {sport.present_la28 && (
                <Badge className="bg-saffron text-white">LA 2028</Badge>
              )}
              {sport.present_ag2026 && (
                <Badge className="bg-india-green text-white">Asian Games 2026</Badge>
              )}
              {sport.is_tops && (
                <Badge variant="outline">TOPS</Badge>
              )}
              {sport.is_tagg && (
                <Badge variant="outline">TAGG</Badge>
              )}
              {sport.sport_category && (
                <Badge variant="secondary">{sport.sport_category}</Badge>
              )}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-display">{medals?.length || 0}</p>
              <p className="text-muted-foreground">Medals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display">{totalAthletes}</p>
              <p className="text-muted-foreground">Athletes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-display">{ncoeCentreCount + stcCentreCount}</p>
              <p className="text-muted-foreground">Centres</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Events</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{events?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Infrastructure</span>
          </TabsTrigger>
          <TabsTrigger value="medals" className="gap-2">
            <Medal className="h-4 w-4" />
            <span className="hidden sm:inline">Medals</span>
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">{medals?.length || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-saffron">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">LA28 Events</p>
                <p className="text-2xl font-display">{la28Events.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-india-green">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">AG2026 Events</p>
                <p className="text-2xl font-display">{ag2026Events.length}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-india-navy">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">NCOE Centres</p>
                <p className="text-2xl font-display">{ncoeCentreCount}</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">STC Centres</p>
                <p className="text-2xl font-display">{stcCentreCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Programme Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <StatusIndicator status={sport.asmita_league_status} label="Asmita League" />
                <StatusIndicator status={sport.nis_diploma_status} label="NIS Diploma" />
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">TOPS Programme</span>
                  <div className="flex items-center gap-2">
                    {sport.is_tops ? (
                      <CheckCircle className="h-4 w-4 text-india-green" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{sport.is_tops ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">TAGG Programme</span>
                  <div className="flex items-center gap-2">
                    {sport.is_tagg ? (
                      <CheckCircle className="h-4 w-4 text-india-green" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{sport.is_tagg ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Athlete Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NCOE Athletes</span>
                  <span className="font-medium">{ncoeAthletes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">STC Athletes</span>
                  <span className="font-medium">{stcAthletes.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium">Total Athletes</span>
                  <span className="text-lg font-display">{totalAthletes.toLocaleString()}</span>
                </div>
                {sport.sanctioned_capacity && sport.sanctioned_capacity > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sanctioned Capacity</span>
                    <span>{sport.sanctioned_capacity.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-saffron" />
                  LA 2028 Events ({la28Events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {la28Events.map((event) => (
                    <div key={event.event_id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                      <span className="truncate flex-1">{event.event_std}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{event.gender_std}</Badge>
                    </div>
                  ))}
                  {la28Events.length === 0 && (
                    <p className="text-muted-foreground text-sm py-4 text-center">No LA 2028 events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-india-green" />
                  Asian Games 2026 Events ({ag2026Events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                  {ag2026Events.map((event) => (
                    <div key={event.event_id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                      <span className="truncate flex-1">{event.event_std}</span>
                      <Badge variant="outline" className="ml-2 text-xs">{event.gender_std}</Badge>
                    </div>
                  ))}
                  {ag2026Events.length === 0 && (
                    <p className="text-muted-foreground text-sm py-4 text-center">No AG 2026 events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          {/* NCOE Centres */}
          {ncoeCapacity && ncoeCapacity.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                <Badge className="bg-saffron text-white">NCOE</Badge>
                {ncoeCapacity.length} Centres
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ncoeCapacity.map((centre) => (
                  <Card key={centre.id} className="border-l-4 border-l-saffron">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-saffron/10 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-saffron" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{centre.centre_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {centre.state}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Athletes: {centre.ex_grand_total || 0} / {centre.san_grand_total || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STC Centres */}
          {stcCapacity && stcCapacity.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                <Badge className="bg-india-green text-white">STC</Badge>
                {stcCapacity.length} Centres
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stcCapacity.map((centre) => (
                  <Card key={centre.id} className="border-l-4 border-l-india-green">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-india-green/10 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-india-green" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{centre.centre_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {centre.state}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Athletes: {centre.ex_grand_total || 0} / {centre.san_grand_total || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other Centres */}
          {centres && centres.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-3">Other Training Centres ({centres.length})</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {centres.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{link.centres?.centre_name || link.centre_id}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {link.centres?.state || link.state}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {link.centre_type || link.centres?.centre_type}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {(!ncoeCapacity || ncoeCapacity.length === 0) && 
           (!stcCapacity || stcCapacity.length === 0) && 
           (!centres || centres.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No training centres found for this sport
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Medals Tab */}
        <TabsContent value="medals" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Medal className="h-4 w-4" />
                Olympic Medals ({medals?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {medals?.map((medal) => (
                  <div key={medal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{medal.athlete_or_team}</p>
                      <p className="text-xs text-muted-foreground truncate">{medal.event_raw}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                      <Badge className={
                        medal.medal === "Gold" ? "medal-gold" :
                        medal.medal === "Silver" ? "medal-silver" :
                        "medal-bronze"
                      }>
                        {medal.medal}
                      </Badge>
                      <span className="text-sm font-medium">{medal.year}</span>
                    </div>
                  </div>
                ))}
                {(!medals || medals.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No Olympic medals recorded for this sport</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notes?.map((note) => (
                  <div key={note.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <Badge variant="outline" className="text-xs">{note.note_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      By {note.created_by_name || "Unknown"} • {new Date(note.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {(!notes || notes.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">
                    No notes available. Add notes to build a knowledge base for this sport.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SportDetail;
