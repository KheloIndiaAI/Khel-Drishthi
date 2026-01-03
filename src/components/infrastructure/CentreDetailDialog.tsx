import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Users, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminMappingControls } from "./AdminMappingControls";

interface CapacityData {
  id: string;
  centre_id: string | null;
  centre_name: string | null;
  discipline_raw: string | null;
  sport_id: string | null;
  state: string | null;
  region: string | null;
  is_para: boolean | null;
  san_res_boys: number | null;
  san_res_girls: number | null;
  san_res_total: number | null;
  san_nonres_boys: number | null;
  san_nonres_girls: number | null;
  san_nonres_total: number | null;
  san_grand_total: number | null;
  ex_res_boys: number | null;
  ex_res_girls: number | null;
  ex_res_total: number | null;
  ex_nonres_boys: number | null;
  ex_nonres_girls: number | null;
  ex_nonres_total: number | null;
  ex_grand_total: number | null;
}

interface Centre {
  centre_id: string;
  centre_name: string;
  centre_type: string;
  state: string;
  district: string | null;
  operational_status: string | null;
}

interface CentreDetailDialogProps {
  centre: Centre | null;
  capacityData: CapacityData[];
  sports: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const centreTypeColors: Record<string, string> = {
  NCOE: "bg-saffron text-white",
  STC: "bg-india-green text-white",
  KISCE: "bg-india-navy text-white",
  KIC: "bg-purple-600 text-white",
};

export function CentreDetailDialog({ 
  centre, 
  capacityData, 
  sports, 
  open, 
  onOpenChange 
}: CentreDetailDialogProps) {
  if (!centre) return null;

  // Group capacity data by discipline
  const disciplineGroups = capacityData.reduce((acc, cap) => {
    const discipline = cap.discipline_raw || "General";
    if (!acc[discipline]) {
      acc[discipline] = [];
    }
    acc[discipline].push(cap);
    return acc;
  }, {} as Record<string, CapacityData[]>);

  // Calculate totals
  const totals = capacityData.reduce((acc, cap) => ({
    san_res_boys: acc.san_res_boys + (cap.san_res_boys || 0),
    san_res_girls: acc.san_res_girls + (cap.san_res_girls || 0),
    san_res_total: acc.san_res_total + (cap.san_res_total || 0),
    san_nonres_boys: acc.san_nonres_boys + (cap.san_nonres_boys || 0),
    san_nonres_girls: acc.san_nonres_girls + (cap.san_nonres_girls || 0),
    san_nonres_total: acc.san_nonres_total + (cap.san_nonres_total || 0),
    san_grand_total: acc.san_grand_total + (cap.san_grand_total || 0),
    ex_res_boys: acc.ex_res_boys + (cap.ex_res_boys || 0),
    ex_res_girls: acc.ex_res_girls + (cap.ex_res_girls || 0),
    ex_res_total: acc.ex_res_total + (cap.ex_res_total || 0),
    ex_nonres_boys: acc.ex_nonres_boys + (cap.ex_nonres_boys || 0),
    ex_nonres_girls: acc.ex_nonres_girls + (cap.ex_nonres_girls || 0),
    ex_nonres_total: acc.ex_nonres_total + (cap.ex_nonres_total || 0),
    ex_grand_total: acc.ex_grand_total + (cap.ex_grand_total || 0),
  }), {
    san_res_boys: 0, san_res_girls: 0, san_res_total: 0,
    san_nonres_boys: 0, san_nonres_girls: 0, san_nonres_total: 0,
    san_grand_total: 0,
    ex_res_boys: 0, ex_res_girls: 0, ex_res_total: 0,
    ex_nonres_boys: 0, ex_nonres_girls: 0, ex_nonres_total: 0,
    ex_grand_total: 0,
  });

  const utilizationPct = totals.san_grand_total > 0 
    ? Math.round((totals.ex_grand_total / totals.san_grand_total) * 100) 
    : 0;

  const disciplines = Object.keys(disciplineGroups);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{centre.centre_name}</h2>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{centre.district ? `${centre.district}, ` : ""}{centre.state}</span>
                <AdminMappingControls 
                  stateName={centre.state} 
                  currentRegion={null} 
                  compact 
                />
              </div>
            </div>
            <Badge className={cn("shrink-0", centreTypeColors[centre.centre_type] || "bg-muted")}>
              {centre.centre_type}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Sports/Disciplines Offered */}
        {sports.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Target className="h-4 w-4" /> Disciplines Offered
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {sports.map(sport => (
                <Badge key={sport} variant="secondary">{sport}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Overall Capacity Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Overall Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{totals.ex_grand_total}</span>
              <span className="text-muted-foreground">/ {totals.san_grand_total} sanctioned</span>
            </div>
            <Progress value={utilizationPct} className="h-2 mb-1" />
            <p className="text-xs text-muted-foreground text-right">{utilizationPct}% utilization</p>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        {capacityData.length > 0 && (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-9 mb-4">
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="residential" className="text-xs">Residential</TabsTrigger>
              <TabsTrigger value="non-residential" className="text-xs">Non-Residential</TabsTrigger>
            </TabsList>

            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-0">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Gender Breakdown */}
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="text-xs text-muted-foreground uppercase mb-3">By Gender (Existing)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-1">
                          <span className="text-blue-500">♂</span> Boys
                        </span>
                        <span className="font-bold">{totals.ex_res_boys + totals.ex_nonres_boys}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-1">
                          <span className="text-pink-500">♀</span> Girls
                        </span>
                        <span className="font-bold">{totals.ex_res_girls + totals.ex_nonres_girls}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Residential Breakdown */}
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="text-xs text-muted-foreground uppercase mb-3">By Type (Existing)</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🏠 Residential</span>
                        <span className="font-bold">{totals.ex_res_total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">🚶 Non-Residential</span>
                        <span className="font-bold">{totals.ex_nonres_total}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Discipline-wise breakdown */}
              {disciplines.length > 0 && (
                <div>
                  <h4 className="text-xs text-muted-foreground uppercase mb-2">By Discipline</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {disciplines.map(discipline => {
                      const discData = disciplineGroups[discipline];
                      const discTotal = discData.reduce((sum, d) => sum + (d.ex_grand_total || 0), 0);
                      const discSanctioned = discData.reduce((sum, d) => sum + (d.san_grand_total || 0), 0);
                      const discPct = discSanctioned > 0 ? Math.round((discTotal / discSanctioned) * 100) : 0;
                      
                      return (
                        <div key={discipline} className="flex items-center gap-3 p-2 rounded border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{discipline}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={discPct} className="h-1.5 flex-1" />
                              <span className="text-xs text-muted-foreground w-12 text-right">{discPct}%</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold">{discTotal}</span>
                            <span className="text-xs text-muted-foreground"> / {discSanctioned}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Residential Tab */}
            <TabsContent value="residential" className="mt-0">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase mb-3">Sanctioned</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-blue-500">♂</span> Boys</span>
                          <span className="font-medium">{totals.san_res_boys}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-pink-500">♀</span> Girls</span>
                          <span className="font-medium">{totals.san_res_girls}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total</span>
                          <span>{totals.san_res_total}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase mb-3">Existing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-blue-500">♂</span> Boys</span>
                          <span className="font-medium">{totals.ex_res_boys}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-pink-500">♀</span> Girls</span>
                          <span className="font-medium">{totals.ex_res_girls}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total</span>
                          <span>{totals.ex_res_total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Non-Residential Tab */}
            <TabsContent value="non-residential" className="mt-0">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase mb-3">Sanctioned</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-blue-500">♂</span> Boys</span>
                          <span className="font-medium">{totals.san_nonres_boys}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-pink-500">♀</span> Girls</span>
                          <span className="font-medium">{totals.san_nonres_girls}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total</span>
                          <span>{totals.san_nonres_total}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase mb-3">Existing</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-blue-500">♂</span> Boys</span>
                          <span className="font-medium">{totals.ex_nonres_boys}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1"><span className="text-pink-500">♀</span> Girls</span>
                          <span className="font-medium">{totals.ex_nonres_girls}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t pt-2">
                          <span>Total</span>
                          <span>{totals.ex_nonres_total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {capacityData.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No detailed capacity data available for this centre</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
