import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  MapPin,
  Save,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  Plus,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageSEO from "@/components/seo/PageSEO";

interface RegionalCentre {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

interface RegionStateMapping {
  id: string;
  state_name: string;
  region_id: string;
  regional_centres: RegionalCentre | null;
}

const RegionMappingAdmin = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  
  // New regional centre form state
  const [showNewCentreDialog, setShowNewCentreDialog] = useState(false);
  const [newCentreName, setNewCentreName] = useState("");
  const [newCentreDisplayName, setNewCentreDisplayName] = useState("");
  
  // Edit regional centre state
  const [showEditCentreDialog, setShowEditCentreDialog] = useState(false);
  const [editingCentre, setEditingCentre] = useState<RegionalCentre | null>(null);
  const [editCentreName, setEditCentreName] = useState("");
  const [editCentreDisplayName, setEditCentreDisplayName] = useState("");

  // Fetch regional centres
  const { data: regionalCentres, isLoading: loadingCentres } = useQuery({
    queryKey: ["regional-centres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regional_centres")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as RegionalCentre[];
    },
  });

  // Fetch mappings with joined regional centre
  const { data: mappings, isLoading: loadingMappings } = useQuery({
    queryKey: ["region-state-mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("region_state_mappings")
        .select("id, state_name, region_id, regional_centres(id, name, display_name, sort_order)")
        .order("state_name");
      if (error) throw error;
      return data as RegionStateMapping[];
    },
  });

  // Get unique states from centres table that might not be mapped yet
  const { data: allStatesFromCentres } = useQuery({
    queryKey: ["all-states-from-centres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("centres")
        .select("state")
        .order("state");
      if (error) throw error;
      const unique = new Set<string>();
      data?.forEach((c) => {
        if (c.state) unique.add(c.state);
      });
      return Array.from(unique).sort();
    },
  });

  // Mutation for updating mapping
  const updateMutation = useMutation({
    mutationFn: async ({ id, region_id }: { id: string; region_id: string }) => {
      const { error } = await supabase
        .from("region_state_mappings")
        .update({ region_id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings"] });
    },
  });

  // Mutation for inserting new mapping
  const insertMutation = useMutation({
    mutationFn: async ({ state_name, region_id }: { state_name: string; region_id: string }) => {
      const { error } = await supabase
        .from("region_state_mappings")
        .insert({ state_name, region_id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings"] });
    },
  });

  // Mutation for creating new regional centre
  const createCentreMutation = useMutation({
    mutationFn: async ({ name, display_name, sort_order }: { name: string; display_name: string; sort_order: number }) => {
      const { error } = await supabase
        .from("regional_centres")
        .insert({ name, display_name, sort_order });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regional-centres"] });
      queryClient.invalidateQueries({ queryKey: ["regional-centres-hook"] });
      setShowNewCentreDialog(false);
      setNewCentreName("");
      setNewCentreDisplayName("");
      toast.success("Regional centre created successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create regional centre");
    },
  });

  // Mutation for updating regional centre
  const updateCentreMutation = useMutation({
    mutationFn: async ({ id, name, display_name }: { id: string; name: string; display_name: string }) => {
      const { error } = await supabase
        .from("regional_centres")
        .update({ name, display_name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regional-centres"] });
      queryClient.invalidateQueries({ queryKey: ["regional-centres-hook"] });
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings-hook"] });
      setShowEditCentreDialog(false);
      setEditingCentre(null);
      toast.success("Regional centre updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update regional centre");
    },
  });

  const isLoading = loadingCentres || loadingMappings;

  // Compute unmapped states
  const unmappedStates = useMemo(() => {
    if (!allStatesFromCentres || !mappings) return [];
    const mappedSet = new Set(mappings.map((m) => m.state_name));
    return allStatesFromCentres.filter((s) => !mappedSet.has(s));
  }, [allStatesFromCentres, mappings]);

  // Filter mappings by search
  const filteredMappings = useMemo(() => {
    if (!mappings) return [];
    if (!searchTerm) return mappings;
    const lower = searchTerm.toLowerCase();
    return mappings.filter(
      (m) =>
        m.state_name.toLowerCase().includes(lower) ||
        m.regional_centres?.display_name?.toLowerCase().includes(lower)
    );
  }, [mappings, searchTerm]);

  // Group by region for summary
  const regionSummary = useMemo(() => {
    if (!mappings || !regionalCentres) return [];
    const countMap = new Map<string, number>();
    mappings.forEach((m) => {
      countMap.set(m.region_id, (countMap.get(m.region_id) || 0) + 1);
    });
    return regionalCentres.map((rc) => ({
      ...rc,
      stateCount: countMap.get(rc.id) || 0,
    }));
  }, [mappings, regionalCentres]);

  const handleRegionChange = (mappingId: string, newRegionId: string) => {
    setPendingChanges((prev) => ({ ...prev, [mappingId]: newRegionId }));
  };

  const handleSave = async (mapping: RegionStateMapping) => {
    const newRegionId = pendingChanges[mapping.id];
    if (!newRegionId || newRegionId === mapping.region_id) return;

    try {
      await updateMutation.mutateAsync({ id: mapping.id, region_id: newRegionId });
      setPendingChanges((prev) => {
        const copy = { ...prev };
        delete copy[mapping.id];
        return copy;
      });
      toast.success(`Updated mapping for ${mapping.state_name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update mapping");
    }
  };

  const handleAddUnmappedState = async (stateName: string, regionId: string) => {
    try {
      await insertMutation.mutateAsync({ state_name: stateName, region_id: regionId });
      toast.success(`Added mapping for ${stateName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add mapping");
    }
  };

  const hasPendingChange = (mappingId: string, currentRegionId: string) => {
    return pendingChanges[mappingId] && pendingChanges[mappingId] !== currentRegionId;
  };

  const handleCreateCentre = () => {
    if (!newCentreName.trim() || !newCentreDisplayName.trim()) {
      toast.error("Please fill in both name and display name");
      return;
    }
    
    // Generate the RC name format
    const rcName = newCentreName.startsWith("RC ") ? newCentreName : `RC ${newCentreName}`;
    const nextSortOrder = (regionalCentres?.length || 0) + 1;
    
    createCentreMutation.mutate({
      name: rcName,
      display_name: newCentreDisplayName.trim(),
      sort_order: nextSortOrder,
    });
  };

  const handleEditCentre = (centre: RegionalCentre) => {
    setEditingCentre(centre);
    setEditCentreName(centre.name);
    setEditCentreDisplayName(centre.display_name);
    setShowEditCentreDialog(true);
  };

  const handleSaveEditCentre = () => {
    if (!editingCentre || !editCentreName.trim() || !editCentreDisplayName.trim()) {
      toast.error("Please fill in both name and display name");
      return;
    }
    
    updateCentreMutation.mutate({
      id: editingCentre.id,
      name: editCentreName.trim(),
      display_name: editCentreDisplayName.trim(),
    });
  };

  return (
    <DashboardLayout>
      <PageSEO
        title="Region Mapping Admin | Sports India Dashboard"
        description="Manage state to regional centre mappings"
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Region Mapping</h1>
          <p className="text-muted-foreground mt-1">
            Map states and union territories to SAI regional centres. This is the single source of truth for all infrastructure data.
          </p>
        </div>

        {/* Summary Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {regionSummary.map((rc) => (
              <Card key={rc.id} className="hover:shadow-md transition-shadow group relative">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm truncate flex-1">{rc.display_name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleEditCentre(rc)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-2xl font-bold">{rc.stateCount}</div>
                  <div className="text-xs text-muted-foreground">states/UTs</div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add New Regional Centre Card */}
            <Dialog open={showNewCentreDialog} onOpenChange={setShowNewCentreDialog}>
              <DialogTrigger asChild>
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed border-2 hover:border-primary/50">
                  <CardContent className="pt-4 pb-3 flex flex-col items-center justify-center h-full min-h-[80px]">
                    <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-sm text-muted-foreground">Add New</span>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Regional Centre</DialogTitle>
                  <DialogDescription>
                    Add a new SAI regional centre to the system. The name will be prefixed with "RC" automatically if not provided.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="centre-name">Centre Name</Label>
                    <Input
                      id="centre-name"
                      placeholder="e.g., Chennai or RC Chennai"
                      value={newCentreName}
                      onChange={(e) => setNewCentreName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be stored as: {newCentreName ? (newCentreName.startsWith("RC ") ? newCentreName : `RC ${newCentreName}`) : "RC [name]"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      placeholder="e.g., Chennai"
                      value={newCentreDisplayName}
                      onChange={(e) => setNewCentreDisplayName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is shown in the UI cards and dropdowns.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewCentreDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCentre} disabled={createCentreMutation.isPending}>
                    {createCentreMutation.isPending ? "Creating..." : "Create Centre"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Edit Regional Centre Dialog */}
        <Dialog open={showEditCentreDialog} onOpenChange={setShowEditCentreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Regional Centre</DialogTitle>
              <DialogDescription>
                Update the name and display name for this regional centre.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-centre-name">Centre Name</Label>
                <Input
                  id="edit-centre-name"
                  placeholder="e.g., RC Chennai"
                  value={editCentreName}
                  onChange={(e) => setEditCentreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-display-name">Display Name</Label>
                <Input
                  id="edit-display-name"
                  placeholder="e.g., Chennai"
                  value={editCentreDisplayName}
                  onChange={(e) => setEditCentreDisplayName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditCentreDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditCentre} disabled={updateCentreMutation.isPending}>
                {updateCentreMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unmapped States Warning */}
        {unmappedStates.length > 0 && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Unmapped States ({unmappedStates.length})
              </CardTitle>
              <CardDescription>
                These states exist in the centres table but have no regional mapping yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unmappedStates.map((state) => (
                  <div key={state} className="flex items-center gap-2 bg-background rounded-lg p-2 border">
                    <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
                      {state}
                    </Badge>
                    <Select onValueChange={(regionId) => handleAddUnmappedState(state, regionId)}>
                      <SelectTrigger className="w-36 h-8 text-xs">
                        <SelectValue placeholder="Assign region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regionalCentres?.map((rc) => (
                          <SelectItem key={rc.id} value={rc.id}>
                            {rc.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mapping Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>State/UT Mappings</CardTitle>
                <CardDescription>
                  {mappings?.length || 0} mappings configured
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search states or regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMappings.map((mapping) => {
                  const hasChange = hasPendingChange(mapping.id, mapping.region_id);
                  const currentValue = pendingChanges[mapping.id] || mapping.region_id;

                  return (
                    <div
                      key={mapping.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                        hasChange && "bg-primary/5 border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{mapping.state_name}</span>
                      </div>

                      <Select
                        value={currentValue}
                        onValueChange={(val) => handleRegionChange(mapping.id, val)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {regionalCentres?.map((rc) => (
                            <SelectItem key={rc.id} value={rc.id}>
                              {rc.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {hasChange ? (
                        <Button
                          size="sm"
                          onClick={() => handleSave(mapping)}
                          disabled={updateMutation.isPending}
                          className="gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="gap-1 opacity-50">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Saved
                        </Button>
                      )}
                    </div>
                  );
                })}

                {filteredMappings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No mappings found matching your search.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Refresh hint */}
        <div className="text-center text-sm text-muted-foreground">
          <RefreshCw className="inline h-4 w-4 mr-1" />
          Changes take effect immediately across all infrastructure pages.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegionMappingAdmin;
