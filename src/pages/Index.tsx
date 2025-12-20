import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Users, Target, Medal, Building2, CheckCircle2 } from "lucide-react";

const Index = () => {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTables = async () => {
      // Check each table exists by querying it
      const tableNames = [
        'sports', 'centres', 'disciplines', 'centre_sport_links',
        'olympic_medals', 'olympic_participation', 'olympic_timeline',
        'events', 'ncoe_capacity', 'stc_capacity', 'profiles',
        'user_roles', 'sport_notes', 'event_overlap'
      ];
      
      const confirmedTables: string[] = [];
      
      for (const table of tableNames) {
        try {
          const { error } = await supabase.from(table as any).select('*').limit(1);
          if (!error) confirmedTables.push(table);
        } catch (e) {
          // Table doesn't exist or error
        }
      }
      
      setTables(confirmedTables);
      setLoading(false);
    };
    
    checkTables();
  }, []);

  const stats = [
    { icon: Trophy, label: "Sports Tracking", value: "40+", color: "text-primary" },
    { icon: MapPin, label: "Training Centres", value: "KIC/STC/NCOE", color: "text-accent" },
    { icon: Medal, label: "Olympic History", value: "Medals & Timeline", color: "text-gold" },
    { icon: Users, label: "Athlete Capacity", value: "Complete Data", color: "text-info" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="hero-gradient text-primary-foreground py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl backdrop-blur-sm">
              <Trophy className="h-8 w-8" />
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground border-0">
              Lovable Cloud Powered
            </Badge>
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide mb-4">
            India Sports Ecosystem
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl">
            Comprehensive dashboard tracking Olympic sports, training centres, athlete capacity, and India's journey to LA 2028 & Asian Games 2026.
          </p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6">
                <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
                <p className="text-3xl font-display">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Database Status */}
      <section className="container mx-auto px-6 py-12">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="font-display text-3xl flex items-center gap-3">
              <Building2 className="h-7 w-7 text-accent" />
              Database Tables Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Checking database tables...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {tables.map((table) => (
                  <div key={table} className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <span className="font-medium">{table}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-6 text-muted-foreground">
              <strong>{tables.length} of 14 tables</strong> confirmed. The database schema is ready for CSV data import.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Table Categories */}
      <section className="container mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-primary">Master Tables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>sports</strong> - All Olympic & Asian Games sports</p>
              <p>• <strong>centres</strong> - KIC, KISCE, STC, NCOE locations</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-accent">Olympic Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>olympic_medals</strong> - Historical medal records</p>
              <p>• <strong>olympic_participation</strong> - Athletes per games</p>
              <p>• <strong>olympic_timeline</strong> - Key milestones</p>
            </CardContent>
          </Card>
          
          <Card className="stat-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-info">Capacity & Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• <strong>ncoe_capacity</strong> - NCOE athlete capacity</p>
              <p>• <strong>stc_capacity</strong> - STC athlete capacity</p>
              <p>• <strong>events</strong> - LA28/AG2026 medal events</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
