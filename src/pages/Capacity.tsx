import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { Users, Building2, MapPin, TrendingUp } from "lucide-react";

const COLORS = ["#FF9933", "#138808", "#000080", "#9333ea"];

const Capacity = () => {
  const [stateFilter, setStateFilter] = useState<string>("all");

  const { data: ncoeData } = useQuery({
    queryKey: ["ncoe-capacity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ncoe_capacity").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: stcData } = useQuery({
    queryKey: ["stc-capacity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stc_capacity").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: sports } = useQuery({
    queryKey: ["sports-capacity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sports").select("sport_id, sport_name");
      if (error) throw error;
      return data;
    },
  });

  // Get unique states
  const allStates = [...new Set([
    ...(ncoeData?.map(r => r.state).filter(Boolean) || []),
    ...(stcData?.map(r => r.state).filter(Boolean) || [])
  ])].sort() as string[];

  // Filter by state
  const filteredNcoe = stateFilter === "all" ? ncoeData : ncoeData?.filter(r => r.state === stateFilter);
  const filteredStc = stateFilter === "all" ? stcData : stcData?.filter(r => r.state === stateFilter);

  // Count unique centres (not rows - each centre can have multiple sports)
  const ncoeUniqueCentres = new Set(filteredNcoe?.map(r => r.centre_id).filter(Boolean) || []).size;
  const stcUniqueCentres = new Set(filteredStc?.map(r => r.centre_id).filter(Boolean) || []).size;

  // Summary calculations
  const ncoeSanctioned = filteredNcoe?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const ncoeExisting = filteredNcoe?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const stcSanctioned = filteredStc?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const stcExisting = filteredStc?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;

  const ncoeUtilization = ncoeSanctioned > 0 ? (ncoeExisting / ncoeSanctioned) * 100 : 0;
  const stcUtilization = stcSanctioned > 0 ? (stcExisting / stcSanctioned) * 100 : 0;

  // Gender distribution
  const genderData = [
    { 
      name: "Boys", 
      value: (filteredNcoe?.reduce((s, r) => s + (r.ex_res_boys || 0) + (r.ex_nonres_boys || 0), 0) || 0) + 
             (filteredStc?.reduce((s, r) => s + (r.ex_res_boys || 0) + (r.ex_nonres_boys || 0), 0) || 0) 
    },
    { 
      name: "Girls", 
      value: (filteredNcoe?.reduce((s, r) => s + (r.ex_res_girls || 0) + (r.ex_nonres_girls || 0), 0) || 0) + 
             (filteredStc?.reduce((s, r) => s + (r.ex_res_girls || 0) + (r.ex_nonres_girls || 0), 0) || 0) 
    },
  ];

  // State-wise distribution
  const stateWiseData = allStates.map(state => {
    const ncoeCount = ncoeData?.filter(r => r.state === state).reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
    const stcCount = stcData?.filter(r => r.state === state).reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
    return { state, ncoe: ncoeCount, stc: stcCount, total: ncoeCount + stcCount };
  }).filter(d => d.total > 0).sort((a, b) => b.total - a.total).slice(0, 15);

  // Residential vs Non-residential
  const residentialData = [
    {
      name: "Residential",
      ncoe: filteredNcoe?.reduce((s, r) => s + (r.ex_res_total || 0), 0) || 0,
      stc: filteredStc?.reduce((s, r) => s + (r.ex_res_total || 0), 0) || 0,
    },
    {
      name: "Non-Residential",
      ncoe: filteredNcoe?.reduce((s, r) => s + (r.ex_nonres_total || 0), 0) || 0,
      stc: filteredStc?.reduce((s, r) => s + (r.ex_nonres_total || 0), 0) || 0,
    },
  ];

  const getSportName = (sportId: string | null) => {
    if (!sportId || !sports) return "Unknown";
    return sports.find(s => s.sport_id === sportId)?.sport_name || sportId;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Capacity Analytics</h1>
          <p className="text-muted-foreground">Training centre capacity utilization and distribution</p>
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-48">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {allStates.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-saffron" />
              NCOE Athletes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display">{ncoeExisting.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {ncoeSanctioned.toLocaleString()} sanctioned</p>
            <Progress value={ncoeUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-india-green" />
              STC Athletes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display">{stcExisting.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of {stcSanctioned.toLocaleString()} sanctioned</p>
            <Progress value={stcUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-india-navy" />
              NCOE Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display">{ncoeUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{ncoeUniqueCentres} centres</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              STC Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display">{stcUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{stcUniqueCentres} centres</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="states">State-wise</TabsTrigger>
          <TabsTrigger value="centres">Centre Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gender Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={genderData} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#FF9933" />
                        <Cell fill="#138808" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-display text-saffron">{genderData[0].value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Boys</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-display text-india-green">{genderData[1].value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Girls</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Residential vs Non-Residential */}
            <Card>
              <CardHeader>
                <CardTitle>Residential vs Non-Residential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={residentialData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ncoe" name="NCOE" fill="#FF9933" />
                      <Bar dataKey="stc" name="STC" fill="#138808" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top States by Athlete Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateWiseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="state" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ncoe" name="NCOE" fill="#FF9933" stackId="a" />
                    <Bar dataKey="stc" name="STC" fill="#138808" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="centres" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* NCOE Centres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-saffron text-white">NCOE</Badge>
                  {ncoeUniqueCentres} Centres ({filteredNcoe?.length || 0} sport entries)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredNcoe?.map((centre) => (
                    <div key={centre.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{centre.centre_name}</p>
                          <p className="text-xs text-muted-foreground">{centre.state}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getSportName(centre.sport_id)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display">{centre.ex_grand_total || 0}</p>
                          <p className="text-xs text-muted-foreground">/ {centre.san_grand_total || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* STC Centres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-india-green text-white">STC</Badge>
                  {stcUniqueCentres} Centres ({filteredStc?.length || 0} sport entries)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStc?.map((centre) => (
                    <div key={centre.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">{centre.centre_name}</p>
                          <p className="text-xs text-muted-foreground">{centre.state}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getSportName(centre.sport_id)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-display">{centre.ex_grand_total || 0}</p>
                          <p className="text-xs text-muted-foreground">/ {centre.san_grand_total || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Capacity;
