import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MedalData {
  year: number;
  gold: number;
  silver: number;
  bronze: number;
}

interface MedalChartProps {
  data: MedalData[];
}

const MedalChart = ({ data }: MedalChartProps) => {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display text-2xl mb-6">Olympic Medal History (1996-2024)</h3>
      <div className="h-[300px] md:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="year" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="gold" name="Gold" fill="#FFD700" radius={[4, 4, 0, 0]} />
            <Bar dataKey="silver" name="Silver" fill="#C0C0C0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bronze" name="Bronze" fill="#CD7F32" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MedalChart;
