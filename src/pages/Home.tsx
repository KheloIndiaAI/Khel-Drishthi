import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeroSection from "@/components/home/HeroSection";
import SportsGrid from "@/components/home/SportsGrid";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";

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

  return (
    <DashboardLayout>
      {/* Hero Section with Mission, Countdown, KPIs and CTAs */}
      <HeroSection />

      {/* Sports Grid */}
      <ScrollReveal animation="fade-up" delay={100}>
        <section id="sports">
          <div className="mb-4">
            <h2 className="font-display text-2xl md:text-3xl">Sports Ecosystem</h2>
            <p className="text-muted-foreground text-sm mt-1">Browse {sports?.length || 0} sports across priority schemes</p>
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
      </ScrollReveal>
    </DashboardLayout>
  );
};

export default Home;
