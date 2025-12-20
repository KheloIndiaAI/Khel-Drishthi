import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CountdownCard from "@/components/home/CountdownCard";
import StatsCard from "@/components/home/StatsCard";
import MedalChart from "@/components/home/MedalChart";
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
const CWG2026_DATE = new Date("2026-03-17");

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

  // Fetch medal history
  const { data: medals } = useQuery({
    queryKey: ["olympic-medals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("olympic_medals")
        .select("*")
        .gte("year", 1996)
        .order("year");
      if (error) throw error;
      return data;
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
      }))
    : [];

  // Total medals count
  const totalMedals = medals?.length || 0;

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

      {/* Stats Cards */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard
            title="Sports"
            value={sports?.length || 57}
            icon={Target}
            variant="saffron"
          />
          <StatsCard
            title="Centres"
            value={centresCount || 1147}
            icon={Building2}
            variant="green"
          />
          <StatsCard
            title="Athletes"
            value={totalAthletes.toLocaleString() || "8,053"}
            icon={Users}
            variant="navy"
          />
          <StatsCard
            title="Events"
            value={eventsCount || 351}
            icon={Trophy}
            variant="saffron"
          />
          <StatsCard
            title="Olympic Medals"
            value={totalMedals || 27}
            icon={Medal}
            variant="green"
          />
        </div>
      </section>

      {/* Medal History Chart */}
      <section className="mb-8">
        <MedalChart data={medalChartData} />
      </section>

      {/* Sports Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl">All Sports</h2>
          <p className="text-muted-foreground">{sports?.length || 0} sports</p>
        </div>
        
        {sportsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
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
