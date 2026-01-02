import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy,
  MapPin,
  Building2,
  Target,
  TrendingUp,
  Medal,
  Star,
  BarChart3,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getRegionForState, getRegionDisplayName } from "@/lib/regionMapping";
import PageSEO from "@/components/seo/PageSEO";

interface InsightCard {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  details?: { label: string; value: string | number }[];
}

const InfrastructureInsights = () => {
  // Fetch centres
  const { data: centres, isLoading: loadingCentres } = useQuery({
    queryKey: ["centres-insights"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centres")
          .select("centre_id, centre_name, centre_type, state, district")
          .range(from, from + pageSize - 1);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
  });

  // Fetch centre-sport links
  const { data: centreSportLinks, isLoading: loadingLinks } = useQuery({
    queryKey: ["centre-sport-links-insights"],
    queryFn: async () => {
      const pageSize = 1000;
      let from = 0;
      let all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("centre_sport_links")
          .select("centre_id, sport_id, sport_name, state")
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
    queryKey: ["ncoe-capacity-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ncoe_capacity")
        .select("centre_id, san_grand_total, ex_grand_total, state, region");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch STC capacity
  const { data: stcCapacity } = useQuery({
    queryKey: ["stc-capacity-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stc_capacity")
        .select("centre_id, san_grand_total, ex_grand_total, state, region");
      if (error) throw error;
      return data || [];
    },
  });

  const isLoading = loadingCentres || loadingLinks;

  // Compute insights
  const insights = useMemo(() => {
    if (!centres || !centreSportLinks) return null;

    // State-wise centre counts
    const stateStats = new Map<string, { ncoe: number; stc: number; kic: number; kisce: number; total: number; sports: Set<string> }>();
    
    centres.forEach(centre => {
      const state = centre.state;
      if (!state) return;
      
      if (!stateStats.has(state)) {
        stateStats.set(state, { ncoe: 0, stc: 0, kic: 0, kisce: 0, total: 0, sports: new Set() });
      }
      
      const stats = stateStats.get(state)!;
      stats.total++;
      
      if (centre.centre_type === "NCOE") stats.ncoe++;
      else if (centre.centre_type === "STC") stats.stc++;
      else if (centre.centre_type === "KIC") stats.kic++;
      else if (centre.centre_type === "KISCE") stats.kisce++;
    });

    // Add sports to state stats
    centreSportLinks.forEach(link => {
      const state = link.state;
      if (state && stateStats.has(state) && link.sport_name) {
        stateStats.get(state)!.sports.add(link.sport_name);
      }
    });

    // Region-wise stats
    const regionStats = new Map<string, { ncoe: number; stc: number; kic: number; kisce: number; total: number; sports: Set<string> }>();
    
    centres.forEach(centre => {
      const region = getRegionForState(centre.state);
      if (!region) return;
      
      if (!regionStats.has(region)) {
        regionStats.set(region, { ncoe: 0, stc: 0, kic: 0, kisce: 0, total: 0, sports: new Set() });
      }
      
      const stats = regionStats.get(region)!;
      stats.total++;
      
      if (centre.centre_type === "NCOE") stats.ncoe++;
      else if (centre.centre_type === "STC") stats.stc++;
      else if (centre.centre_type === "KIC") stats.kic++;
      else if (centre.centre_type === "KISCE") stats.kisce++;
    });

    centreSportLinks.forEach(link => {
      const region = getRegionForState(link.state);
      if (region && regionStats.has(region) && link.sport_name) {
        regionStats.get(region)!.sports.add(link.sport_name);
      }
    });

    // Find top states
    const stateArray = Array.from(stateStats.entries()).map(([state, stats]) => ({
      state,
      ...stats,
      sportsCount: stats.sports.size
    }));

    const topSportsState = stateArray.sort((a, b) => b.sportsCount - a.sportsCount)[0];
    const topKICState = stateArray.sort((a, b) => b.kic - a.kic)[0];
    const topNCOEState = stateArray.sort((a, b) => b.ncoe - a.ncoe)[0];
    const topSTCState = stateArray.sort((a, b) => b.stc - a.stc)[0];
    const topKISCEState = stateArray.sort((a, b) => b.kisce - a.kisce)[0];
    const topTotalState = stateArray.sort((a, b) => b.total - a.total)[0];

    // Find top regions
    const regionArray = Array.from(regionStats.entries()).map(([region, stats]) => ({
      region,
      displayName: getRegionDisplayName(region),
      ...stats,
      sportsCount: stats.sports.size
    }));

    const topSportsRegion = regionArray.sort((a, b) => b.sportsCount - a.sportsCount)[0];
    const topCentresRegion = regionArray.sort((a, b) => b.total - a.total)[0];

    // Capacity insights
    const totalSanctioned = (ncoeCapacity?.reduce((sum, c) => sum + (c.san_grand_total || 0), 0) || 0) +
                           (stcCapacity?.reduce((sum, c) => sum + (c.san_grand_total || 0), 0) || 0);
    const totalExisting = (ncoeCapacity?.reduce((sum, c) => sum + (c.ex_grand_total || 0), 0) || 0) +
                         (stcCapacity?.reduce((sum, c) => sum + (c.ex_grand_total || 0), 0) || 0);
    const utilizationRate = totalSanctioned > 0 ? Math.round((totalExisting / totalSanctioned) * 100) : 0;

    // Count unique sports
    const allSports = new Set<string>();
    centreSportLinks.forEach(link => {
      if (link.sport_name) allSports.add(link.sport_name);
    });

    // State with most diverse sports
    const diverseStates = stateArray
      .filter(s => s.sportsCount > 0)
      .sort((a, b) => b.sportsCount - a.sportsCount)
      .slice(0, 5);

    // States with no NCOE
    const statesWithNoNCOE = stateArray.filter(s => s.ncoe === 0 && s.total > 0);

    return {
      topSportsState,
      topKICState,
      topNCOEState,
      topSTCState,
      topKISCEState,
      topTotalState,
      topSportsRegion,
      topCentresRegion,
      totalCentres: centres.length,
      totalSports: allSports.size,
      totalStates: stateStats.size,
      totalRegions: regionStats.size,
      totalSanctioned,
      totalExisting,
      utilizationRate,
      diverseStates,
      statesWithNoNCOE,
      ncoeCount: centres.filter(c => c.centre_type === "NCOE").length,
      stcCount: centres.filter(c => c.centre_type === "STC").length,
      kicCount: centres.filter(c => c.centre_type === "KIC").length,
      kisceCount: centres.filter(c => c.centre_type === "KISCE").length,
    };
  }, [centres, centreSportLinks, ncoeCapacity, stcCapacity]);

  const highlightCards: InsightCard[] = insights ? [
    {
      title: "Most Sports Coverage",
      value: insights.topSportsState?.state || "-",
      subtitle: `${insights.topSportsState?.sportsCount || 0} unique sports across ${insights.topSportsState?.total || 0} centres`,
      icon: <Trophy className="h-6 w-6" />,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      details: [
        { label: "NCOE", value: insights.topSportsState?.ncoe || 0 },
        { label: "STC", value: insights.topSportsState?.stc || 0 },
        { label: "KIC", value: insights.topSportsState?.kic || 0 },
      ]
    },
    {
      title: "Highest KIC Centres",
      value: insights.topKICState?.state || "-",
      subtitle: `${insights.topKICState?.kic || 0} Khelo India Centres`,
      icon: <Target className="h-6 w-6" />,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      details: [
        { label: "Total Centres", value: insights.topKICState?.total || 0 },
        { label: "Sports", value: insights.topKICState?.sportsCount || 0 },
      ]
    },
    {
      title: "Most NCOE Centres",
      value: insights.topNCOEState?.state || "-",
      subtitle: `${insights.topNCOEState?.ncoe || 0} National Centres of Excellence`,
      icon: <Star className="h-6 w-6" />,
      color: "bg-gradient-to-br from-saffron to-orange-500",
      details: [
        { label: "STC", value: insights.topNCOEState?.stc || 0 },
        { label: "Sports", value: insights.topNCOEState?.sportsCount || 0 },
      ]
    },
    {
      title: "Most STC Centres",
      value: insights.topSTCState?.state || "-",
      subtitle: `${insights.topSTCState?.stc || 0} Special Training Centres`,
      icon: <Building2 className="h-6 w-6" />,
      color: "bg-gradient-to-br from-india-green to-emerald-600",
      details: [
        { label: "NCOE", value: insights.topSTCState?.ncoe || 0 },
        { label: "Sports", value: insights.topSTCState?.sportsCount || 0 },
      ]
    },
  ] : [];

  const regionalHighlights: InsightCard[] = insights ? [
    {
      title: "Region with Most Sports",
      value: insights.topSportsRegion?.displayName || "-",
      subtitle: `${insights.topSportsRegion?.sportsCount || 0} sports across ${insights.topSportsRegion?.total || 0} centres`,
      icon: <Medal className="h-6 w-6" />,
      color: "bg-gradient-to-br from-teal-500 to-cyan-600",
    },
    {
      title: "Region with Most Centres",
      value: insights.topCentresRegion?.displayName || "-",
      subtitle: `${insights.topCentresRegion?.total || 0} total centres`,
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-gradient-to-br from-rose-500 to-pink-600",
    },
  ] : [];

  return (
    <DashboardLayout>
      <PageSEO
        title="Infrastructure Insights | Sports India Dashboard"
        description="Key insights and statistics about India's sports infrastructure including state-wise distribution of training centres and sports coverage."
        keywords={["sports insights", "infrastructure analytics", "state sports data", "training centre statistics"]}
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Infrastructure Insights</h1>
            <p className="text-muted-foreground mt-1">
              Key statistics and interesting facts about India's sports infrastructure
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/infrastructure" className="gap-2">
              View Full Infrastructure
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Summary Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : insights && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{insights.totalCentres.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Centres</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-india-green/10 to-india-green/5 border-india-green/20">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-india-green">{insights.totalSports}</div>
                <div className="text-sm text-muted-foreground">Unique Sports</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-saffron/10 to-saffron/5 border-saffron/20">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-saffron">{insights.totalStates}</div>
                <div className="text-sm text-muted-foreground">States/UTs</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-india-navy/10 to-india-navy/5 border-india-navy/20">
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-india-navy dark:text-blue-400">{insights.totalRegions}</div>
                <div className="text-sm text-muted-foreground">Regional Centres</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* State Highlights */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            State Highlights
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlightCards.map((card, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className={`${card.color} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      {card.icon}
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        #1
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <div className="text-sm opacity-90">{card.title}</div>
                      <div className="text-xl font-bold mt-1">{card.value}</div>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                    {card.details && (
                      <div className="flex gap-3 mt-3">
                        {card.details.map((d, i) => (
                          <div key={i} className="text-center">
                            <div className="text-lg font-semibold">{d.value}</div>
                            <div className="text-xs text-muted-foreground">{d.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Regional Highlights */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Regional Highlights
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {regionalHighlights.map((card, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className={`${card.color} p-4 text-white`}>
                    <div className="flex items-center gap-3">
                      {card.icon}
                      <div>
                        <div className="text-sm opacity-90">{card.title}</div>
                        <div className="text-2xl font-bold">{card.value}</div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-3">
                    <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Centre Type Distribution */}
        {insights && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Centre Type Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-saffron/10">
                      <Star className="h-5 w-5 text-saffron" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{insights.ncoeCount}</div>
                      <div className="text-sm text-muted-foreground">NCOE</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">National Centres of Excellence</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-india-green/10">
                      <Building2 className="h-5 w-5 text-india-green" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{insights.stcCount}</div>
                      <div className="text-sm text-muted-foreground">STC</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Special Training Centres</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Target className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{insights.kicCount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">KIC</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">Khelo India Centres</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-india-navy/10">
                      <Medal className="h-5 w-5 text-india-navy dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{insights.kisceCount}</div>
                      <div className="text-sm text-muted-foreground">KISCE</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">KI State Centres of Excellence</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Capacity Insights */}
        {insights && insights.totalSanctioned > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Capacity Insights
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{insights.totalSanctioned.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">Sanctioned Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-india-green">{insights.totalExisting.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1">Existing Athletes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-saffron">{insights.utilizationRate}%</div>
                    <div className="text-sm text-muted-foreground mt-1">Capacity Utilization</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* States with Most Sports Diversity */}
        {insights && insights.diverseStates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Top 5 States by Sports Diversity
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {insights.diverseStates.map((state, idx) => (
                    <div key={state.state} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{state.state}</div>
                        <div className="text-sm text-muted-foreground">
                          {state.total} centres • {state.ncoe} NCOE • {state.stc} STC • {state.kic} KIC
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3">
                        {state.sportsCount} sports
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interesting Facts */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Interesting Facts
          </h2>
          {insights && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-saffron">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    <span className="font-semibold text-saffron">{insights.topTotalState?.state}</span> has the highest 
                    concentration of sports centres with <span className="font-semibold">{insights.topTotalState?.total}</span> facilities 
                    across all categories.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-india-green">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    India has <span className="font-semibold text-india-green">{insights.totalSports}</span> different sports 
                    being trained across <span className="font-semibold">{insights.totalCentres.toLocaleString()}</span> centres 
                    in <span className="font-semibold">{insights.totalStates}</span> states and UTs.
                  </p>
                </CardContent>
              </Card>
              {insights.statesWithNoNCOE.length > 0 && (
                <Card className="border-l-4 border-l-amber-500">
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      <span className="font-semibold text-amber-600">{insights.statesWithNoNCOE.length} states/UTs</span> have 
                      training centres but no NCOE facilities yet, presenting an opportunity for expansion.
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    The <span className="font-semibold text-purple-600">Khelo India program</span> has the widest reach 
                    with <span className="font-semibold">{insights.kicCount.toLocaleString()}</span> centres, 
                    representing {Math.round((insights.kicCount / insights.totalCentres) * 100)}% of all sports infrastructure.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InfrastructureInsights;
