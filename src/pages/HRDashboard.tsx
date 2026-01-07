import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserCheck,
  Shield,
  Wrench,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { StaffData, AwarenessLevel, KnowledgeLevel } from "@/components/stc/utils/formConfig";

interface STCData {
  id: string;
  centre_id: string;
  centre_name: string | null;
  state: string | null;
  region: string | null;
  staff_details: StaffData | null;
  disciplines?: { discipline_name?: string; existing_total?: number }[];
}

const AWARENESS_COLORS: Record<AwarenessLevel, string> = {
  'Fully Aware': '#22c55e',
  'Partially Aware': '#eab308',
  'Not Aware': '#ef4444',
  'Training Needed': '#f97316',
};

const KNOWLEDGE_COLORS: Record<KnowledgeLevel, string> = {
  'Expert': '#22c55e',
  'Proficient': '#3b82f6',
  'Basic': '#eab308',
  'Needs Training': '#ef4444',
};

const PIE_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6'];

export default function HRDashboard() {
  const { data: stcData, isLoading } = useQuery({
    queryKey: ['stc-hr-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stc_detailed_data')
        .select('id, centre_id, centre_name, state, region, staff_details, disciplines:stc_discipline_strength(discipline_name, existing_total)')
        .not('staff_details', 'is', null);
      
      if (error) throw error;
      return data as unknown as STCData[];
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const validData = stcData?.filter(s => s.staff_details) || [];

  // Aggregate metrics
  const totalCoaches = validData.reduce((sum, s) => sum + (s.staff_details?.coach_count_total || 0), 0);
  const totalGroundsmen = validData.reduce((sum, s) => sum + (s.staff_details?.groundsmen_count_total || 0), 0);
  const totalAdminStaff = validData.reduce((sum, s) => sum + (s.staff_details?.admin_staff_count_total || 0), 0);
  const totalSecurityStaff = validData.reduce((sum, s) => sum + (s.staff_details?.security_staff_count || 0), 0);
  const totalAthletes = validData.reduce((sum, s) => {
    return sum + (s.disciplines?.reduce((dSum, d) => dSum + (d.existing_total || 0), 0) || 0);
  }, 0);

  const overallRatio = totalCoaches > 0 ? Math.round(totalAthletes / totalCoaches) : null;

  // Coach to athlete ratio by STC
  const ratioData = validData.map(s => {
    const athletes = s.disciplines?.reduce((sum, d) => sum + (d.existing_total || 0), 0) || 0;
    const coaches = s.staff_details?.coach_count_total || 0;
    const ratio = coaches > 0 ? Math.round(athletes / coaches) : 0;
    return {
      name: s.centre_name?.substring(0, 15) || s.centre_id.substring(0, 10),
      ratio,
      athletes,
      coaches,
    };
  }).filter(d => d.coaches > 0).sort((a, b) => b.ratio - a.ratio).slice(0, 15);

  // Employment nature distribution
  const employmentDistribution: Record<string, number> = {};
  validData.forEach(s => {
    s.staff_details?.coach_roster?.forEach(c => {
      const nature = c.employment_nature || 'Unknown';
      employmentDistribution[nature] = (employmentDistribution[nature] || 0) + 1;
    });
  });
  const employmentData = Object.entries(employmentDistribution).map(([name, value]) => ({ name, value }));

  // Awareness levels aggregation
  const awarenessAMS: Record<string, number> = {};
  const awarenessPOCSO: Record<string, number> = {};
  const knowledgeProcurement: Record<string, number> = {};

  validData.forEach(s => {
    if (s.staff_details?.ams_nsrs_awareness) {
      awarenessAMS[s.staff_details.ams_nsrs_awareness] = (awarenessAMS[s.staff_details.ams_nsrs_awareness] || 0) + 1;
    }
    if (s.staff_details?.pocso_posh_awareness) {
      awarenessPOCSO[s.staff_details.pocso_posh_awareness] = (awarenessPOCSO[s.staff_details.pocso_posh_awareness] || 0) + 1;
    }
    if (s.staff_details?.procurement_accounting_knowledge) {
      knowledgeProcurement[s.staff_details.procurement_accounting_knowledge] = (knowledgeProcurement[s.staff_details.procurement_accounting_knowledge] || 0) + 1;
    }
  });

  const awarenessAMSData = Object.entries(awarenessAMS).map(([name, value]) => ({ name, value }));
  const awarenessPOCSOData = Object.entries(awarenessPOCSO).map(([name, value]) => ({ name, value }));
  const knowledgeProcurementData = Object.entries(knowledgeProcurement).map(([name, value]) => ({ name, value }));

  // Staff distribution by region
  const regionDistribution: Record<string, { coaches: number; admin: number; groundsmen: number; security: number }> = {};
  validData.forEach(s => {
    const region = s.region || 'Unknown';
    if (!regionDistribution[region]) {
      regionDistribution[region] = { coaches: 0, admin: 0, groundsmen: 0, security: 0 };
    }
    regionDistribution[region].coaches += s.staff_details?.coach_count_total || 0;
    regionDistribution[region].admin += s.staff_details?.admin_staff_count_total || 0;
    regionDistribution[region].groundsmen += s.staff_details?.groundsmen_count_total || 0;
    regionDistribution[region].security += s.staff_details?.security_staff_count || 0;
  });

  const regionData = Object.entries(regionDistribution).map(([region, data]) => ({
    region,
    ...data,
  })).sort((a, b) => (b.coaches + b.admin) - (a.coaches + a.admin));

  // STCs with concerning ratios
  const concerningSTCs = ratioData.filter(r => r.ratio > 25);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Staff distribution, awareness levels, and ratios across {validData.length} STCs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalCoaches}</p>
                  <p className="text-xs text-muted-foreground">Total Coaches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wrench className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGroundsmen}</p>
                  <p className="text-xs text-muted-foreground">Groundsmen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalAdminStaff}</p>
                  <p className="text-xs text-muted-foreground">Admin Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSecurityStaff}</p>
                  <p className="text-xs text-muted-foreground">Security Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={overallRatio && overallRatio > 25 ? 'border-destructive/50' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {overallRatio ? `1:${overallRatio}` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Coach:Athlete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coach to Athlete Ratio by STC */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Coach to Athlete Ratio by STC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratioData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'ratio' ? 'Athletes per Coach' : name]}
                    labelFormatter={(label) => `STC: ${label}`}
                  />
                  <Bar 
                    dataKey="ratio" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              {concerningSTCs.length > 0 && (
                <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">{concerningSTCs.length} STCs with high coach load (&gt;1:25)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff Distribution by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff Distribution by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="coaches" fill="#8b5cf6" name="Coaches" stackId="a" />
                  <Bar dataKey="admin" fill="#3b82f6" name="Admin" stackId="a" />
                  <Bar dataKey="groundsmen" fill="#22c55e" name="Groundsmen" stackId="a" />
                  <Bar dataKey="security" fill="#f59e0b" name="Security" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 - Awareness & Employment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AMS/NSRS Awareness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AMS & NSRS Awareness</CardTitle>
            </CardHeader>
            <CardContent>
              {awarenessAMSData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={awarenessAMSData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {awarenessAMSData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={AWARENESS_COLORS[entry.name as AwarenessLevel] || PIE_COLORS[index % PIE_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* POCSO/POSH Awareness */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">POCSO & POSH Awareness</CardTitle>
            </CardHeader>
            <CardContent>
              {awarenessPOCSOData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={awarenessPOCSOData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {awarenessPOCSOData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={AWARENESS_COLORS[entry.name as AwarenessLevel] || PIE_COLORS[index % PIE_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Employment Nature */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coach Employment Type</CardTitle>
            </CardHeader>
            <CardContent>
              {employmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={employmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {employmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Procurement Knowledge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Procurement & Accounting Knowledge Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['Expert', 'Proficient', 'Basic', 'Needs Training'].map((level) => {
                const count = knowledgeProcurement[level] || 0;
                const total = Object.values(knowledgeProcurement).reduce((a, b) => a + b, 0);
                const percent = total > 0 ? (count / total) * 100 : 0;
                const Icon = level === 'Expert' ? CheckCircle2 : 
                            level === 'Proficient' ? CheckCircle2 :
                            level === 'Basic' ? AlertTriangle : XCircle;
                
                return (
                  <div key={level} className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" style={{ color: KNOWLEDGE_COLORS[level as KnowledgeLevel] }} />
                      <span className="text-sm font-medium">{level}</span>
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                    <Progress value={percent} className="mt-2 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{percent.toFixed(0)}% of STCs</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* STC Details Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">STC-wise Staff Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">STC</th>
                    <th className="text-left py-2 px-3">Region</th>
                    <th className="text-center py-2 px-3">Coaches</th>
                    <th className="text-center py-2 px-3">Athletes</th>
                    <th className="text-center py-2 px-3">Ratio</th>
                    <th className="text-center py-2 px-3">Admin</th>
                    <th className="text-center py-2 px-3">Groundsmen</th>
                    <th className="text-center py-2 px-3">Security</th>
                    <th className="text-center py-2 px-3">AMS Awareness</th>
                  </tr>
                </thead>
                <tbody>
                  {validData.slice(0, 20).map((stc) => {
                    const athletes = stc.disciplines?.reduce((sum, d) => sum + (d.existing_total || 0), 0) || 0;
                    const coaches = stc.staff_details?.coach_count_total || 0;
                    const ratio = coaches > 0 ? Math.round(athletes / coaches) : null;
                    
                    return (
                      <tr key={stc.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-medium">{stc.centre_name || stc.centre_id}</td>
                        <td className="py-2 px-3 text-muted-foreground">{stc.region || '-'}</td>
                        <td className="py-2 px-3 text-center">{coaches}</td>
                        <td className="py-2 px-3 text-center">{athletes}</td>
                        <td className="py-2 px-3 text-center">
                          {ratio !== null ? (
                            <Badge variant={ratio <= 15 ? 'default' : ratio <= 25 ? 'secondary' : 'destructive'}>
                              1:{ratio}
                            </Badge>
                          ) : '-'}
                        </td>
                        <td className="py-2 px-3 text-center">{stc.staff_details?.admin_staff_count_total || 0}</td>
                        <td className="py-2 px-3 text-center">{stc.staff_details?.groundsmen_count_total || 0}</td>
                        <td className="py-2 px-3 text-center">{stc.staff_details?.security_staff_count || 0}</td>
                        <td className="py-2 px-3 text-center">
                          {stc.staff_details?.ams_nsrs_awareness ? (
                            <Badge 
                              style={{ 
                                backgroundColor: AWARENESS_COLORS[stc.staff_details.ams_nsrs_awareness] + '20',
                                color: AWARENESS_COLORS[stc.staff_details.ams_nsrs_awareness],
                                borderColor: AWARENESS_COLORS[stc.staff_details.ams_nsrs_awareness],
                              }}
                              variant="outline"
                            >
                              {stc.staff_details.ams_nsrs_awareness}
                            </Badge>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
