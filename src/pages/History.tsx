import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal, Clock } from "lucide-react";

const History = () => {
  const { data: medals } = useQuery({
    queryKey: ["all-medals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("olympic_medals").select("*").order("year", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data, error } = await supabase.from("olympic_timeline").select("*").order("year_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <h1 className="font-display text-4xl md:text-5xl mb-6">Olympic History</h1>
      
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Medal className="h-5 w-5" />Medal Winners ({medals?.length || 0})</CardTitle></CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
            {medals?.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{m.athlete_or_team}</p>
                  <p className="text-sm text-muted-foreground">{m.sport_std} - {m.event_raw}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={m.medal === "Gold" ? "medal-gold" : m.medal === "Silver" ? "medal-silver" : "medal-bronze"}>{m.medal}</Badge>
                  <span className="text-sm">{m.year}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Milestones</CardTitle></CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
            {timeline?.map((t) => (
              <div key={t.id} className="p-3 rounded-lg border">
                <p className="font-medium">{t.milestone_title}</p>
                <p className="text-sm text-muted-foreground">{t.milestone_description}</p>
                {t.year_start && <Badge variant="outline" className="mt-2">{t.year_start}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default History;
