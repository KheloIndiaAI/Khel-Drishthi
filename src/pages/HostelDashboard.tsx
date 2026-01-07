import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Building2,
  Users,
  BedDouble,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Home,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/seo/PageSEO";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface HostelFacilities {
  hostel_available?: boolean;
  hostel_bed_capacity?: number;
  current_hostel_occupancy?: number;
  gender_capacity?: {
    male_beds?: number;
    female_beds?: number;
  };
  hostel_type?: string;
  overall_hostel_quality?: string;
  new_hostel_requirement?: {
    new_hostel_needed?: boolean;
    beds_needed?: number;
  };
}

interface STCData {
  centre_id: string;
  centre_name: string | null;
  state: string | null;
  region: string | null;
  hostel_facilities: HostelFacilities | null;
}

const CHART_COLORS = {
  male: "hsl(221, 83%, 53%)",      // Blue
  female: "hsl(330, 81%, 60%)",    // Pink
  occupied: "hsl(142, 71%, 45%)",  // Green
  vacant: "hsl(47, 96%, 53%)",     // Yellow
  primary: "hsl(24, 95%, 53%)",    // Saffron/Orange
  secondary: "hsl(142, 71%, 29%)", // India Green
};

const HostelDashboard = () => {
  const { data: stcData, isLoading } = useQuery({
    queryKey: ["hostel-dashboard-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stc_detailed_data")
        .select("centre_id, centre_name, state, region, hostel_facilities");
      if (error) throw error;
      return data as STCData[];
    },
  });

  const analytics = useMemo(() => {
    if (!stcData || stcData.length === 0) return null;

    let totalCapacity = 0;
    let totalOccupancy = 0;
    let totalMaleBeds = 0;
    let totalFemaleBeds = 0;
    let centresWithHostel = 0;
    let centresWithoutHostel = 0;
    let centresNeedingNewHostel = 0;
    let bedsNeededForNewHostels = 0;

    const qualityDistribution: Record<string, number> = {};
    const typeDistribution: Record<string, number> = {};
    const stateWiseData: Record<string, { capacity: number; occupancy: number; centres: number }> = {};
    const regionWiseData: Record<string, { capacity: number; occupancy: number; centres: number }> = {};

    const lowOccupancyCentres: { name: string; rate: number; capacity: number }[] = [];
    const highOccupancyCentres: { name: string; rate: number; capacity: number }[] = [];

    stcData.forEach((stc) => {
      const hostel = stc.hostel_facilities;
      
      if (!hostel || !hostel.hostel_available) {
        centresWithoutHostel++;
        return;
      }

      centresWithHostel++;
      
      const capacity = hostel.hostel_bed_capacity || 0;
      const occupancy = hostel.current_hostel_occupancy || 0;
      
      totalCapacity += capacity;
      totalOccupancy += occupancy;
      
      totalMaleBeds += hostel.gender_capacity?.male_beds || 0;
      totalFemaleBeds += hostel.gender_capacity?.female_beds || 0;

      // Quality distribution
      if (hostel.overall_hostel_quality) {
        qualityDistribution[hostel.overall_hostel_quality] = 
          (qualityDistribution[hostel.overall_hostel_quality] || 0) + 1;
      }

      // Type distribution
      if (hostel.hostel_type) {
        typeDistribution[hostel.hostel_type] = 
          (typeDistribution[hostel.hostel_type] || 0) + 1;
      }

      // New hostel requirement
      if (hostel.new_hostel_requirement?.new_hostel_needed) {
        centresNeedingNewHostel++;
        bedsNeededForNewHostels += hostel.new_hostel_requirement.beds_needed || 0;
      }

      // State-wise aggregation
      if (stc.state) {
        if (!stateWiseData[stc.state]) {
          stateWiseData[stc.state] = { capacity: 0, occupancy: 0, centres: 0 };
        }
        stateWiseData[stc.state].capacity += capacity;
        stateWiseData[stc.state].occupancy += occupancy;
        stateWiseData[stc.state].centres++;
      }

      // Region-wise aggregation
      if (stc.region) {
        if (!regionWiseData[stc.region]) {
          regionWiseData[stc.region] = { capacity: 0, occupancy: 0, centres: 0 };
        }
        regionWiseData[stc.region].capacity += capacity;
        regionWiseData[stc.region].occupancy += occupancy;
        regionWiseData[stc.region].centres++;
      }

      // Track low/high occupancy
      if (capacity > 0) {
        const rate = (occupancy / capacity) * 100;
        const centreInfo = { 
          name: stc.centre_name || stc.centre_id, 
          rate: Math.round(rate), 
          capacity 
        };
        
        if (rate < 50) {
          lowOccupancyCentres.push(centreInfo);
        } else if (rate >= 90) {
          highOccupancyCentres.push(centreInfo);
        }
      }
    });

    const overallOccupancyRate = totalCapacity > 0 
      ? Math.round((totalOccupancy / totalCapacity) * 100) 
      : 0;

    // Prepare chart data
    const genderData = [
      { name: "Male Beds", value: totalMaleBeds, fill: CHART_COLORS.male },
      { name: "Female Beds", value: totalFemaleBeds, fill: CHART_COLORS.female },
    ];

    const occupancyData = [
      { name: "Occupied", value: totalOccupancy, fill: CHART_COLORS.occupied },
      { name: "Vacant", value: totalCapacity - totalOccupancy, fill: CHART_COLORS.vacant },
    ];

    const qualityData = Object.entries(qualityDistribution).map(([name, value]) => ({
      name,
      value,
      fill: name === "Excellent" ? CHART_COLORS.occupied 
          : name === "Good" ? CHART_COLORS.male
          : name === "Needs Minor Repair" ? CHART_COLORS.vacant
          : "hsl(0, 72%, 51%)"
    }));

    const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    const stateChartData = Object.entries(stateWiseData)
      .map(([state, data]) => ({
        state: state.length > 12 ? state.substring(0, 12) + "..." : state,
        capacity: data.capacity,
        occupancy: data.occupancy,
        rate: data.capacity > 0 ? Math.round((data.occupancy / data.capacity) * 100) : 0,
      }))
      .sort((a, b) => b.capacity - a.capacity)
      .slice(0, 10);

    const regionChartData = Object.entries(regionWiseData)
      .map(([region, data]) => ({
        region,
        capacity: data.capacity,
        occupancy: data.occupancy,
        rate: data.capacity > 0 ? Math.round((data.occupancy / data.capacity) * 100) : 0,
        centres: data.centres,
      }))
      .sort((a, b) => b.capacity - a.capacity);

    return {
      totalCentres: stcData.length,
      centresWithHostel,
      centresWithoutHostel,
      totalCapacity,
      totalOccupancy,
      overallOccupancyRate,
      totalMaleBeds,
      totalFemaleBeds,
      centresNeedingNewHostel,
      bedsNeededForNewHostels,
      genderData,
      occupancyData,
      qualityData,
      typeData,
      stateChartData,
      regionChartData,
      lowOccupancyCentres: lowOccupancyCentres.sort((a, b) => a.rate - b.rate).slice(0, 5),
      highOccupancyCentres: highOccupancyCentres.sort((a, b) => b.rate - a.rate).slice(0, 5),
    };
  }, [stcData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28" />)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Hostel Data Available</h2>
          <p className="text-muted-foreground">Complete STC forms to see hostel analytics.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageSEO
        title="Hostel Utilization Dashboard | Sports India"
        description="Analytics dashboard showing hostel occupancy rates, gender distribution, and capacity trends across all STCs."
        keywords={["hostel analytics", "STC hostel", "occupancy rates", "capacity utilization"]}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hostel Utilization Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Occupancy rates, gender distribution, and capacity trends across STCs
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/infrastructure">Back to Infrastructure</Link>
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bed Capacity</p>
                  <p className="text-3xl font-bold">{analytics.totalCapacity.toLocaleString()}</p>
                </div>
                <BedDouble className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Occupancy</p>
                  <p className="text-3xl font-bold">{analytics.totalOccupancy.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                  <p className="text-3xl font-bold">{analytics.overallOccupancyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-80" />
              </div>
              <Progress value={analytics.overallOccupancyRate} className="mt-2 h-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Centres with Hostel</p>
                  <p className="text-3xl font-bold">{analytics.centresWithHostel}</p>
                  <p className="text-xs text-muted-foreground">of {analytics.totalCentres} total</p>
                </div>
                <Home className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gender & Occupancy Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gender Distribution
              </CardTitle>
              <CardDescription>Male vs Female bed allocation across all hostels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name.split(" ")[0]}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{analytics.totalMaleBeds.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Male Beds</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{analytics.totalFemaleBeds.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Female Beds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5" />
                Occupancy Status
              </CardTitle>
              <CardDescription>Current utilization of hostel capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.occupancyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{analytics.totalOccupancy.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {(analytics.totalCapacity - analytics.totalOccupancy).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Vacant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Region-wise Capacity */}
        {analytics.regionChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Region-wise Capacity & Occupancy
              </CardTitle>
              <CardDescription>Hostel capacity distribution across regional centres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.regionChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="region" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        value.toLocaleString(), 
                        name === "capacity" ? "Total Capacity" : "Current Occupancy"
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="capacity" name="Capacity" fill={CHART_COLORS.primary} />
                    <Bar dataKey="occupancy" name="Occupancy" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* State-wise Top 10 */}
        {analytics.stateChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 States by Hostel Capacity
              </CardTitle>
              <CardDescription>States with highest hostel bed capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.stateChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        value.toLocaleString(), 
                        name === "capacity" ? "Capacity" : "Occupancy"
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="capacity" name="Capacity" fill={CHART_COLORS.primary} />
                    <Bar dataKey="occupancy" name="Occupancy" fill={CHART_COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerts Row */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Low Occupancy Centres */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Low Occupancy Centres
              </CardTitle>
              <CardDescription>Centres with less than 50% occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.lowOccupancyCentres.length === 0 ? (
                <p className="text-sm text-muted-foreground">No low occupancy centres found</p>
              ) : (
                <div className="space-y-3">
                  {analytics.lowOccupancyCentres.map((centre, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2">{centre.name}</span>
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        {centre.rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* High Occupancy Centres */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                High Occupancy Centres
              </CardTitle>
              <CardDescription>Centres with 90%+ occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.highOccupancyCentres.length === 0 ? (
                <p className="text-sm text-muted-foreground">No high occupancy centres found</p>
              ) : (
                <div className="space-y-3">
                  {analytics.highOccupancyCentres.map((centre, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2">{centre.name}</span>
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        {centre.rate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* New Hostel Requirements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <UserCheck className="h-5 w-5" />
                New Hostel Requirements
              </CardTitle>
              <CardDescription>Centres requesting new hostel construction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Centres needing new hostel</span>
                  <span className="text-2xl font-bold">{analytics.centresNeedingNewHostel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total beds requested</span>
                  <span className="text-2xl font-bold">{analytics.bedsNeededForNewHostels.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality & Type Distribution */}
        <div className="grid md:grid-cols-2 gap-6">
          {analytics.qualityData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hostel Quality Distribution</CardTitle>
                <CardDescription>Overall condition assessment of hostels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.qualityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {analytics.typeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hostel Type Distribution</CardTitle>
                <CardDescription>Rooms, Dormitory, or Mixed accommodation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.typeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Centres" fill={CHART_COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HostelDashboard;
