import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Settings, Save, X } from "lucide-react";

interface RegionalCentre {
  id: string;
  name: string;
  display_name: string;
  sort_order: number;
}

interface AdminMappingControlsProps {
  stateName: string;
  currentRegion?: string | null;
  compact?: boolean;
}

export const AdminMappingControls = ({
  stateName,
  currentRegion,
  compact = false,
}: AdminMappingControlsProps) => {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc("has_role", {
        _role: "admin",
        _user_id: user.id,
      });
      setIsAdmin(!!data);
    };
    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch regional centres
  const { data: regionalCentres } = useQuery({
    queryKey: ["regional-centres-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regional_centres")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as RegionalCentre[];
    },
    enabled: isAdmin,
  });

  // Fetch current mapping for this state
  const { data: currentMapping } = useQuery({
    queryKey: ["state-mapping", stateName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("region_state_mappings")
        .select("id, region_id, regional_centres(id, name, display_name)")
        .eq("state_name", stateName)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isAdmin && !!stateName,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (regionId: string) => {
      if (currentMapping?.id) {
        // Update existing mapping
        const { error } = await supabase
          .from("region_state_mappings")
          .update({ region_id: regionId })
          .eq("id", currentMapping.id);
        if (error) throw error;
      } else {
        // Insert new mapping
        const { error } = await supabase
          .from("region_state_mappings")
          .insert({ state_name: stateName, region_id: regionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["state-mapping", stateName] });
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["region-state-mappings-hook"] });
      queryClient.invalidateQueries({ queryKey: ["regional-centres-hook"] });
      setShowDialog(false);
      toast.success(`Updated regional mapping for ${stateName}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update mapping");
    },
  });

  const handleOpenDialog = () => {
    setSelectedRegionId(currentMapping?.region_id || "");
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!selectedRegionId) {
      toast.error("Please select a regional centre");
      return;
    }
    updateMutation.mutate(selectedRegionId);
  };

  if (!isAdmin) return null;

  if (compact) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-60 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDialog();
          }}
          title="Edit region mapping"
        >
          <Settings className="h-3 w-3" />
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Region Mapping</DialogTitle>
              <DialogDescription>
                Change the regional centre for <strong>{stateName}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Current: <Badge variant="secondary">{currentRegion || "Not mapped"}</Badge>
              </p>
              <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select regional centre" />
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleOpenDialog}
      >
        <Settings className="h-3 w-3" />
        Edit Mapping
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Region Mapping</DialogTitle>
            <DialogDescription>
              Change the regional centre for <strong>{stateName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Current: <Badge variant="secondary">{currentRegion || "Not mapped"}</Badge>
            </p>
            <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select regional centre" />
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMappingControls;
