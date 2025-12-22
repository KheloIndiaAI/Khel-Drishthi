import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Trophy, MapPin, Calendar, Users, FileText, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { Session } from "@supabase/supabase-js";

interface Stats {
  totalSports: number;
  totalCentres: number;
  totalEvents: number;
  la28Events: number;
  ag2026Events: number;
  totalMedals: number;
  formSubmissions: number;
  activeUsers: number;
}

interface CentresByType {
  type: string;
  count: number;
}

interface SportsByEvents {
  name: string;
  la28: number;
  ag2026: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const AdminDashboard = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalSports: 0, totalCentres: 0, totalEvents: 0, la28Events: 0, ag2026Events: 0, totalMedals: 0, formSubmissions: 0, activeUsers: 0
  });
  const [centresByType, setCentresByType] = useState<CentresByType[]>([]);
  const [topSports, setTopSports] = useState<SportsByEvents[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<{form_name: string; count: number}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        setTimeout(() => checkAdminRole(session.user.id), 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdminRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchDashboardData();
  }, [isAdmin]);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
      setIsAdmin(!error && data === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    // Fetch counts in parallel
    const [sportsRes, centresRes, eventsRes, medalsRes, submissionsRes, profilesRes] = await Promise.all([
      supabase.from('sports').select('sport_id, la28_events, ag2026_events, sport_name', { count: 'exact' }),
      supabase.from('centres').select('centre_type', { count: 'exact' }),
      supabase.from('events').select('present_la28, present_ag2026', { count: 'exact' }),
      supabase.from('olympic_medals').select('id', { count: 'exact' }),
      supabase.from('form_submissions').select('id, form_id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
    ]);

    // Calculate stats
    const la28Count = eventsRes.data?.filter(e => e.present_la28 === 1).length || 0;
    const ag2026Count = eventsRes.data?.filter(e => e.present_ag2026 === 1).length || 0;

    setStats({
      totalSports: sportsRes.count || 0,
      totalCentres: centresRes.count || 0,
      totalEvents: eventsRes.count || 0,
      la28Events: la28Count,
      ag2026Events: ag2026Count,
      totalMedals: medalsRes.count || 0,
      formSubmissions: submissionsRes.count || 0,
      activeUsers: profilesRes.count || 0,
    });

    // Centres by type
    if (centresRes.data) {
      const typeCount: Record<string, number> = {};
      centresRes.data.forEach(c => {
        typeCount[c.centre_type] = (typeCount[c.centre_type] || 0) + 1;
      });
      setCentresByType(Object.entries(typeCount).map(([type, count]) => ({ type, count })));
    }

    // Top sports by events
    if (sportsRes.data) {
      const sorted = sportsRes.data
        .filter(s => (s.la28_events || 0) + (s.ag2026_events || 0) > 0)
        .sort((a, b) => ((b.la28_events || 0) + (b.ag2026_events || 0)) - ((a.la28_events || 0) + (a.ag2026_events || 0)))
        .slice(0, 10)
        .map(s => ({ name: s.sport_name?.substring(0, 12) || 'Unknown', la28: s.la28_events || 0, ag2026: s.ag2026_events || 0 }));
      setTopSports(sorted);
    }

    // Form submissions by form
    if (submissionsRes.data && submissionsRes.data.length > 0) {
      const formCount: Record<string, number> = {};
      submissionsRes.data.forEach(s => {
        formCount[s.form_id] = (formCount[s.form_id] || 0) + 1;
      });
      
      const formIds = Object.keys(formCount);
      const { data: forms } = await supabase.from('form_definitions').select('id, name').in('id', formIds);
      
      setRecentSubmissions(
        Object.entries(formCount).map(([id, count]) => ({
          form_name: forms?.find(f => f.id === id)?.name || 'Unknown',
          count
        }))
      );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || !isAdmin) {
    return (
      <DashboardLayout>
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Admin access required.</p>
            <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="font-display text-3xl md:text-4xl mb-6">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sports</p>
                <p className="text-3xl font-bold">{stats.totalSports}</p>
              </div>
              <Trophy className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Training Centres</p>
                <p className="text-3xl font-bold">{stats.totalCentres}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Olympic Medals</p>
                <p className="text-3xl font-bold">{stats.totalMedals}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">LA28 Events</p>
            <p className="text-2xl font-bold text-blue-500">{stats.la28Events}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">AG2026 Events</p>
            <p className="text-2xl font-bold text-orange-500">{stats.ag2026Events}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Form Submissions</p>
            <p className="text-2xl font-bold text-green-500">{stats.formSubmissions}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Registered Users</p>
            <p className="text-2xl font-bold text-purple-500">{stats.activeUsers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Top Sports by Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Sports by Events</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSports} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="la28" name="LA28" fill="hsl(var(--primary))" stackId="a" />
                <Bar dataKey="ag2026" name="AG2026" fill="hsl(var(--secondary))" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Centres by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training Centres by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={centresByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ type, count }) => `${type}: ${count}`}
                >
                  {centresByType.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Form Submissions */}
      {recentSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" /> Form Submissions by Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={recentSubmissions}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="form_name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="Submissions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
