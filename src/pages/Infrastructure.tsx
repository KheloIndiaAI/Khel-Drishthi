import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  MapPin, 
  Grid3X3, 
  List, 
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const Infrastructure = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [centreTypeFilter, setCentreTypeFilter] = useState<string>("all");
  const [stateFilter, setStateFilter] = useState<string>("all");

  // Fetch centres
  const { data: centres, isLoading } = useQuery({
    queryKey: ["centres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centres")
        .select("*")
        .order("centre_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch sports for filter
  const { data: sports } = useQuery({
    queryKey: ["sports-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sports")
        .select("sport_id, sport_name")
        .order("sport_name");
      if (error) throw error;
      return data;
    },
  });

  // Get unique centre types and states
  const centreTypes = [...new Set(centres?.map((c) => c.centre_type) || [])];
  const states = [...new Set(centres?.map((c) => c.state) || [])].sort();

  // Filter centres
  const filteredCentres = centres?.filter((centre) => {
    const matchesSearch = centre.centre_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = centreTypeFilter === "all" || centre.centre_type === centreTypeFilter;
    const matchesState = stateFilter === "all" || centre.state === stateFilter;
    return matchesSearch && matchesType && matchesState;
  }) || [];

  const centreTypeColors: Record<string, string> = {
    NCOE: "bg-saffron text-white",
    STC: "bg-india-green text-white",
    KISCE: "bg-india-navy text-white",
    KIC: "bg-purple-600 text-white",
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-4xl md:text-5xl mb-2">Infrastructure</h1>
        <p className="text-muted-foreground">
          Browse all {centres?.length || 0} sports training centres across India
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search centres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={centreTypeFilter} onValueChange={setCentreTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Centre Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {centreTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-full md:w-48">
            <MapPin className="h-4 w-4 mr-2" />
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((state) => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredCentres.length} of {centres?.length || 0} centres
      </p>

      {/* Centres Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCentres.map((centre) => (
            <Card key={centre.centre_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1 line-clamp-2">{centre.centre_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" />
                      {centre.district ? `${centre.district}, ` : ""}{centre.state}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={cn(centreTypeColors[centre.centre_type] || "bg-muted")}>
                        {centre.centre_type}
                      </Badge>
                      {centre.operational_status && (
                        <Badge variant="outline" className="text-xs">
                          {centre.operational_status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCentres.map((centre) => (
            <Card key={centre.centre_id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{centre.centre_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {centre.district ? `${centre.district}, ` : ""}{centre.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(centreTypeColors[centre.centre_type] || "bg-muted")}>
                      {centre.centre_type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredCentres.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No centres found matching your criteria</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Infrastructure;
