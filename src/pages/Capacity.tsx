import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Building2 } from "lucide-react";

const Capacity = () => {
  const { data: ncoeData } = useQuery({
    queryKey: ["ncoe-capacity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ncoe_capacity").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: stcData } = useQuery({
    queryKey: ["stc-capacity"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stc_capacity").select("*");
      if (error) throw error;
      return data;
    },
  });

  const ncoeSanctioned = ncoeData?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const ncoeExisting = ncoeData?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;
  const stcSanctioned = stcData?.reduce((sum, r) => sum + (r.san_grand_total || 0), 0) || 0;
  const stcExisting = stcData?.reduce((sum, r) => sum + (r.ex_grand_total || 0), 0) || 0;

  const ncoeUtilization = ncoeSanctioned > 0 ? (ncoeExisting / ncoeSanctioned) * 100 : 0;
  const stcUtilization = stcSanctioned > 0 ? (stcExisting / stcSanctioned) * 100 : 0;

  const genderData = [
    { name: "Boys", value: (ncoeData?.reduce((s, r) => s + (r.ex_res_boys || 0), 0) || 0) + (stcData?.reduce((s, r) => s + (r.ex_res_boys || 0), 0) || 0) },
    { name: "Girls", value: (ncoeData?.reduce((s, r) => s + (r.ex_res_girls || 0), 0) || 0) + (stcData?.reduce((s, r) => s + (r.ex_res_girls || 0), 0) || 0) },
  ];

  return (
    <DashboardLayout>
      <h1 className="font-display text-4xl md:text-5xl mb-6">Capacity Analytics</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-saffron" />NCOE Capacity</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-display mb-2">{ncoeExisting.toLocaleString()} / {ncoeSanctioned.toLocaleString()}</div>
            <Progress value={ncoeUtilization} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{ncoeUtilization.toFixed(1)}% utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-india-green" />STC Capacity</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-display mb-2">{stcExisting.toLocaleString()} / {stcSanctioned.toLocaleString()}</div>
            <Progress value={stcUtilization} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{stcUtilization.toFixed(1)}% utilization</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Gender Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#FF9933" />
                  <Cell fill="#138808" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Capacity;
