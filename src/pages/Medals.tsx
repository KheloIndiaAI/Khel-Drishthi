import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Medal, Clock, TrendingUp, Trophy, Filter } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import PageSEO, { medalsPageSchema, medalsBreadcrumbs } from "@/components/seo/PageSEO";

const Medals = () => {
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [decadeFilter, setDecadeFilter] = useState<string>("all");

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

  // Sport options keyed by sport_id where available, falling back to sport_std
  const sportOptions = Object.values(
    (medals || []).reduce((acc: Record<string, { key: string; label: string }>, m) => {
      const label = m.sport_std || m.sport_raw || "Unknown";
      const key = m.sport_id || label;
      if (!acc[key]) acc[key] = { key, label };
      return acc;
    }, {})
  ).sort((a, b) => a.label.localeCompare(b.label));

  const decades = [...new Set(medals?.map(m => Math.floor(m.year / 10) * 10))].sort((a, b) => b - a);

  const matchesFilters = (m: { sport_id: string | null; sport_std: string | null; sport_raw: string | null; year: number }) => {
    const key = m.sport_id || m.sport_std || m.sport_raw || "Unknown";
    const matchesSport = sportFilter === "all" || key === sportFilter;
    const matchesDecade = decadeFilter === "all" || Math.floor(m.year / 10) * 10 === parseInt(decadeFilter);
    return matchesSport && matchesDecade;
  };

  // Full list (includes the 1924 Alpinism prize) for the winners list
  const filteredMedals = medals?.filter(matchesFilters);

  // Official IOC-aligned records exclude the 1924 Prix olympique d'alpinisme
  const officialMedals = medals?.filter(m => m.sport_raw !== "Alpinism");
  const filteredOfficial = officialMedals?.filter(matchesFilters);

  // Process medal data for area chart (all Games years with a medal)
  const medalChartData = medals
    ? Object.entries(
        medals.reduce((acc: Record<number, { gold: number; silver: number; bronze: number; total: number }>, medal) => {
          const year = medal.year;
          if (!acc[year]) acc[year] = { gold: 0, silver: 0, bronze: 0, total: 0 };
          if (medal.medal === "Gold") acc[year].gold++;
          else if (medal.medal === "Silver") acc[year].silver++;
          else if (medal.medal === "Bronze") acc[year].bronze++;
          acc[year].total++;
          return acc;
        }, {})
      ).map(([year, counts]) => ({
        year: parseInt(year),
        ...counts,
      })).sort((a, b) => a.year - b.year)
    : [];

  // Medal counts by type (official tallies)
  const goldCount = filteredOfficial?.filter(m => m.medal === "Gold").length || 0;
  const silverCount = filteredOfficial?.filter(m => m.medal === "Silver").length || 0;
  const bronzeCount = filteredOfficial?.filter(m => m.medal === "Bronze").length || 0;


  // Sport-wise medal distribution
  const sportMedals = medals?.reduce((acc: Record<string, number>, m) => {
    const sport = m.sport_std || "Unknown";
    acc[sport] = (acc[sport] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = sportMedals 
    ? Object.entries(sportMedals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--saffron))', 'hsl(var(--india-green))', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <DashboardLayout>
      <PageSEO
        title="Olympic Medals - India's Medal History"
        description="Complete record of India's Olympic and Asian Games medals from 1900 to present. Track Gold, Silver, and Bronze medals by sport, athlete, and year."
        canonicalPath="/medals"
        keywords={["Olympic Gold India", "Indian Medal Winners", "Neeraj Chopra", "PV Sindhu", "Hockey Gold", "Asian Games Medals"]}
        jsonLd={medalsPageSchema}
        breadcrumbs={medalsBreadcrumbs}
      />
      
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Olympic Medals</h1>
        <p className="text-muted-foreground">India's Olympic medal history and milestones</p>
      </div>

      {/* Interactive Medal Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-yellow-500">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
          <CardContent className="pt-5 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Gold</p>
                <p className="text-3xl font-display text-yellow-500">{goldCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-gray-400">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-transparent" />
          <CardContent className="pt-5 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-400/20">
                <Medal className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Silver</p>
                <p className="text-3xl font-display text-gray-400">{silverCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-700">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-700/10 to-transparent" />
          <CardContent className="pt-5 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-700/20">
                <Medal className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Bronze</p>
                <p className="text-3xl font-display text-amber-700">{bronzeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardContent className="pt-5 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-3xl font-display">{filteredOfficial?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground mb-6 -mt-3">
        India's 1924 mountaineering prize (Prix olympique d'alpinisme) is preserved in our records but excluded from official IOC tallies.
      </p>


      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Medal Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Medal Trend Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={medalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="silverGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C0C0C0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C0C0C0" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="bronzeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CD7F32" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#CD7F32" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area type="monotone" dataKey="gold" stackId="1" stroke="#FFD700" fill="url(#goldGrad)" />
                  <Area type="monotone" dataKey="silver" stackId="1" stroke="#C0C0C0" fill="url(#silverGrad)" />
                  <Area type="monotone" dataKey="bronze" stackId="1" stroke="#CD7F32" fill="url(#bronzeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sport Distribution Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              By Sport
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {sportOptions.map(sport => (
              <SelectItem key={sport.key} value={sport.key}>{sport.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={decadeFilter} onValueChange={setDecadeFilter}>
          <SelectTrigger className="w-40">
            <Clock className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Decade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decades</SelectItem>
            {decades.map(decade => (
              <SelectItem key={decade} value={String(decade)}>{decade}s</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="winners" className="space-y-4">
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
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Medal className="h-5 w-5" />
                Medal Winners ({filteredMedals?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 max-h-[500px] overflow-y-auto">
                {filteredMedals?.map((m) => (
                  <div 
                    key={m.id} 
                    className="group flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all hover:shadow-sm border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${
                        m.medal === "Gold" ? "bg-yellow-500/20" : 
                        m.medal === "Silver" ? "bg-gray-400/20" : 
                        "bg-amber-700/20"
                      }`}>
                        <Trophy className={`h-4 w-4 ${
                          m.medal === "Gold" ? "text-yellow-500" : 
                          m.medal === "Silver" ? "text-gray-400" : 
                          "text-amber-700"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{m.athlete_or_team}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {m.sport_std} {m.event_raw && `• ${m.event_raw}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <Badge className={
                        m.medal === "Gold" ? "bg-yellow-500 hover:bg-yellow-500/90 text-black" : 
                        m.medal === "Silver" ? "bg-gray-400 hover:bg-gray-400/90 text-black" : 
                        "bg-amber-700 hover:bg-amber-700/90 text-white"
                      }>
                        {m.medal}
                      </Badge>
                      <span className="text-sm font-medium tabular-nums">{m.year}</span>
                    </div>
                  </div>
                ))}
                {(!filteredMedals || filteredMedals.length === 0) && (
                  <p className="text-muted-foreground text-center py-8">No medals found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Historical Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative max-h-[500px] overflow-y-auto">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                
                <div className="space-y-4 pl-10">
                  {timeline?.map((t) => (
                    <div key={t.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[26px] top-2 w-3 h-3 rounded-full bg-primary border-2 border-background group-hover:scale-125 transition-transform" />
                      
                      <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium">{t.milestone_title}</p>
                            {t.milestone_description && (
                              <p className="text-sm text-muted-foreground mt-1">{t.milestone_description}</p>
                            )}
                            {t.sport_std && (
                              <Badge variant="outline" className="mt-2 text-xs">{t.sport_std}</Badge>
                            )}
                          </div>
                          {t.year_start && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
                              {t.year_start}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!timeline || timeline.length === 0) && (
                    <p className="text-muted-foreground text-center py-8">No milestones recorded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Medals;