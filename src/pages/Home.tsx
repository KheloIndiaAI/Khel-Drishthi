import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CountdownCard from "@/components/home/CountdownCard";
import StatsCard from "@/components/home/StatsCard";
import SportsGrid from "@/components/home/SportsGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Target, 
  Building2, 
  Users, 
  Trophy, 
  Medal
} from "lucide-react";

// Target dates for events
const LA28_DATE = new Date("2028-07-14");
const AG2026_DATE = new Date("2026-09-19");
const CWG2026_DATE = new Date("2026-07-23"); // Glasgow 2026

const Home = () => {
  // Fetch sports
  const { data: sports, isLoading: sportsLoading } = useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("*")
        .order("sport_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch centres count
  const { data: centresCount } = useQuery({
    queryKey: ["centres-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("centres")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch events count
  const { data: eventsCount } = useQuery({
    queryKey: ["events-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch medals count
  const { data: totalMedals } = useQuery({
    queryKey: ["medals-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("olympic_medals")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch capacity totals
  const { data: ncoeCapacity } = useQuery({
    queryKey: ["ncoe-capacity-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ncoe_capacity")
        .select("ex_grand_total");
      if (error) throw error;
      return data?.reduce((sum, row) => sum + (row.ex_grand_total || 0), 0) || 0;
    },
  });

  const { data: stcCapacity } = useQuery({
    queryKey: ["stc-capacity-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stc_capacity")
        .select("ex_grand_total");
      if (error) throw error;
      return data?.reduce((sum, row) => sum + (row.ex_grand_total || 0), 0) || 0;
    },
  });

  // Calculate total athletes
  const totalAthletes = (ncoeCapacity || 0) + (stcCapacity || 0);

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <section className="mb-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-6xl tracking-wider mb-2">
            <span className="text-saffron">India</span>{" "}
            <span className="text-foreground">Sports</span>{" "}
            <span className="text-india-green">Ecosystem</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive dashboard for India's sports infrastructure and performance
          </p>
        </div>

        {/* Countdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CountdownCard
            title="LA 2028 Olympics"
            date={LA28_DATE}
            variant="saffron"
          />
          <CountdownCard
            title="Asian Games 2026"
            date={AG2026_DATE}
            variant="green"
          />
          <CountdownCard
            title="CWG 2026"
            date={CWG2026_DATE}
            variant="navy"
          />
        </div>
      </section>

      {/* Stats Cards - Clickable */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard
            title="Sports"
            value={sports?.length || 0}
            icon={Target}
            variant="saffron"
            href="/#sports"
          />
          <StatsCard
            title="Centres"
            value={centresCount || 0}
            icon={Building2}
            variant="green"
            href="/infrastructure"
          />
          <StatsCard
            title="Athletes"
            value={totalAthletes.toLocaleString()}
            icon={Users}
            variant="navy"
            href="/capacity"
          />
          <StatsCard
            title="Events"
            value={eventsCount || 0}
            icon={Trophy}
            variant="saffron"
          />
          <StatsCard
            title="Olympic Medals"
            value={totalMedals || 0}
            icon={Medal}
            variant="green"
            href="/medals"
          />
        </div>
      </section>

      {/* Sports Grid */}
      <section id="sports">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl md:text-3xl">All Sports</h2>
          <p className="text-muted-foreground text-sm">{sports?.length || 0} sports</p>
        </div>
        
        {sportsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
        ) : (
          <SportsGrid sports={sports || []} />
        )}
      </section>
    </DashboardLayout>
  );
};

export default Home;
