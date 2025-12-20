import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MedalChart from "@/components/home/MedalChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Medal, Clock, TrendingUp } from "lucide-react";

const Medals = () => {
  const { data: medals } = useQuery({
    queryKey: ["all-medals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("olympic_medals")
        .select("*")
        .order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("olympic_timeline")
        .select("*")
        .order("year_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Process medal data for chart
  const medalChartData = medals
    ? Object.entries(
        medals.reduce((acc: Record<number, { gold: number; silver: number; bronze: number }>, medal) => {
          const year = medal.year;
          if (!acc[year]) acc[year] = { gold: 0, silver: 0, bronze: 0 };
          if (medal.medal === "Gold") acc[year].gold++;
          else if (medal.medal === "Silver") acc[year].silver++;
          else if (medal.medal === "Bronze") acc[year].bronze++;
          return acc;
        }, {})
      ).map(([year, counts]) => ({
        year: parseInt(year),
        ...counts,
      })).sort((a, b) => a.year - b.year)
    : [];

  // Medal counts by type
  const goldCount = medals?.filter(m => m.medal === "Gold").length || 0;
  const silverCount = medals?.filter(m => m.medal === "Silver").length || 0;
  const bronzeCount = medals?.filter(m => m.medal === "Bronze").length || 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Olympic Medals</h1>
        <p className="text-muted-foreground">India's Olympic medal history and milestones</p>
      </div>

      {/* Medal Summary Cards */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gold</p>
            <p className="text-3xl font-display text-yellow-500">{goldCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Silver</p>
            <p className="text-3xl font-display text-gray-400">{silverCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-700">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Bronze</p>
            <p className="text-3xl font-display text-amber-700">{bronzeCount}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary hidden md:block">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-display">{medals?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Medal History Chart */}
      <section className="mb-8">
        <MedalChart data={medalChartData} />
      </section>

      {/* Tabs */}
      <Tabs defaultValue="winners" className="space-y-6">
        <TabsList>
          <TabsTrigger value="winners" className="gap-2">
            <Medal className="h-4 w-4" />
            Medal Winners
          </TabsTrigger>
          <TabsTrigger value="milestones" className="gap-2">
            <Clock className="h-4 w-4" />
            Milestones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                All Medal Winners ({medals?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-2">
                {medals?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{m.athlete_or_team}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {m.sport_std} {m.event_raw && `- ${m.event_raw}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <Badge className={
                        m.medal === "Gold" ? "medal-gold" : 
                        m.medal === "Silver" ? "medal-silver" : 
                        "medal-bronze"
                      }>
                        {m.medal}
                      </Badge>
                      <span className="text-sm font-medium w-12 text-right">{m.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historical Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {timeline?.map((t) => (
                  <div key={t.id} className="p-4 rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{t.milestone_title}</p>
                        {t.milestone_description && (
                          <p className="text-sm text-muted-foreground mt-1">{t.milestone_description}</p>
                        )}
                      </div>
                      {t.year_start && (
                        <Badge variant="outline" className="flex-shrink-0">{t.year_start}</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {(!timeline || timeline.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No milestones recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Medals;
