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
  History, 
  FileText,
  Medal,
  MapPin
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
  const totalAthletes = (ncoeCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0) + 
                        (stcCapacity?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Sports
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-2">{sport.sport_name}</h1>
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
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <Target className="h-4 w-4 hidden sm:inline" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Trophy className="h-4 w-4 hidden sm:inline" />
            Events
          </TabsTrigger>
          <TabsTrigger value="infrastructure" className="gap-2">
            <Building2 className="h-4 w-4 hidden sm:inline" />
            Infrastructure
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4 hidden sm:inline" />
            History
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4 hidden sm:inline" />
            Notes
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">LA28 Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display">{la28Events.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">AG2026 Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display">{ag2026Events.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">NCOE Centres</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display">{ncoeCentreCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">STC Centres</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display">{stcCentreCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sport Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{sport.sport_category || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asmita League</p>
                  <p className="font-medium">{sport.asmita_league_status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIS Diploma</p>
                  <p className="font-medium">{sport.nis_diploma_status || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Athletes</p>
                  <p className="font-medium">{totalAthletes.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-saffron" />
                  LA 2028 Events ({la28Events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {la28Events.map((event) => (
                    <div key={event.event_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{event.event_std}</span>
                      <Badge variant="outline">{event.gender_std}</Badge>
                    </div>
                  ))}
                  {la28Events.length === 0 && (
                    <p className="text-muted-foreground text-sm">No LA 2028 events</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-india-green" />
                  Asian Games 2026 Events ({ag2026Events.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {ag2026Events.map((event) => (
                    <div key={event.event_id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <span className="text-sm">{event.event_std}</span>
                      <Badge variant="outline">{event.gender_std}</Badge>
                    </div>
                  ))}
                  {ag2026Events.length === 0 && (
                    <p className="text-muted-foreground text-sm">No AG 2026 events</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          {/* NCOE Centres */}
          {ncoeCapacity && ncoeCapacity.length > 0 && (
            <div>
              <h3 className="font-display text-xl mb-4 flex items-center gap-2">
                <Badge className="bg-saffron text-white">NCOE</Badge>
                {ncoeCapacity.length} Centres
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ncoeCapacity.map((centre) => (
                  <Card key={centre.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-saffron/10">
                          <Building2 className="h-5 w-5 text-saffron" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{centre.centre_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {centre.state}
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Athletes: {centre.ex_grand_total || 0} / {centre.san_grand_total || 0}
                          </div>
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
              <h3 className="font-display text-xl mb-4 flex items-center gap-2">
                <Badge className="bg-india-green text-white">STC</Badge>
                {stcCapacity.length} Centres
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stcCapacity.map((centre) => (
                  <Card key={centre.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-india-green/10">
                          <Building2 className="h-5 w-5 text-india-green" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{centre.centre_name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {centre.state}
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Athletes: {centre.ex_grand_total || 0} / {centre.san_grand_total || 0}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Legacy centre_sport_links */}
          {centres && centres.length > 0 && (
            <div>
              <h3 className="font-display text-xl mb-4">Other Training Centres</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {centres.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{link.centres?.centre_name || link.centre_id}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {link.centres?.state || link.state}
                          </p>
                          <Badge variant="outline" className="mt-2 text-xs">
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
            <p className="text-muted-foreground">No training centres found for this sport</p>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Olympic Medals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medals?.map((medal) => (
                  <div key={medal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{medal.athlete_or_team}</p>
                      <p className="text-sm text-muted-foreground">{medal.event_raw}</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                  <p className="text-muted-foreground">No Olympic medals recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notes?.map((note) => (
                  <div key={note.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{note.title}</h4>
                      <Badge variant="outline">{note.note_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                    <p className="text-xs text-muted-foreground">
                      By {note.created_by_name || "Unknown"} • {new Date(note.created_at!).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {(!notes || notes.length === 0) && (
                  <p className="text-muted-foreground">No notes available. Add notes to build a knowledge base for this sport.</p>
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
