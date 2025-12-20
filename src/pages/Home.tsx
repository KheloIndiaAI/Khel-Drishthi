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
      <section className="mb-8 relative overflow-hidden min-h-[400px]">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-saffron/20 to-saffron/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-india-green/20 to-india-green/5 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-india-navy/10 blur-3xl animate-[pulse_5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-[10%] h-16 w-16 rotate-45 border-2 border-saffron/20 animate-[float_6s_ease-in-out_infinite]" />
          <div className="absolute top-40 right-[15%] h-12 w-12 rounded-full border-2 border-india-green/20 animate-[float_8s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-[20%] h-8 w-8 rotate-12 bg-saffron/10 animate-[float_7s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
          <div className="absolute top-32 right-[25%] h-6 w-6 rounded-full bg-india-green/10 animate-[float_5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-20 right-[10%] h-10 w-10 rotate-45 border border-india-navy/15 animate-[float_9s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-[5%] h-4 w-4 rounded-full bg-saffron/15 animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-40 right-[30%] h-14 w-14 rotate-45 border border-saffron/10 animate-[float_10s_ease-in-out_infinite]" style={{ animationDelay: '4s' }} />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="text-center mb-8 pt-4">
          <div className="animate-fade-in">
            <h1 className="font-display text-5xl md:text-7xl tracking-wider mb-3">
              <span className="text-saffron drop-shadow-sm inline-block hover:scale-105 transition-transform duration-300">Khel</span>{" "}
              <span className="text-india-green drop-shadow-sm inline-block hover:scale-105 transition-transform duration-300">Drishti</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg md:text-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Indian Sports Ecosystem Intelligence
          </p>
          <div className="mt-4 flex justify-center gap-1 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="h-1 w-12 rounded-full bg-saffron" />
            <div className="h-1 w-12 rounded-full bg-white border border-border" />
            <div className="h-1 w-12 rounded-full bg-india-green" />
          </div>
        </div>

        {/* Countdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CountdownCard
              title="LA 2028 Olympics"
              date={LA28_DATE}
              variant="saffron"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CountdownCard
              title="Asian Games 2026"
              date={AG2026_DATE}
              variant="green"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CountdownCard
              title="CWG 2026"
              date={CWG2026_DATE}
              variant="navy"
            />
          </div>
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
