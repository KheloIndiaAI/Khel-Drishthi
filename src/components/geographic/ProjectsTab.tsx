import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { HardHat, Hammer, CheckCircle2, XCircle } from 'lucide-react';
import {
  useAllSaiProjects,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUSES,
  type SaiProject,
} from '@/hooks/useSaiProjects';

interface ProjectsTabProps {
  onFlyToProject: (project: SaiProject) => void;
}

const ProjectsTab: React.FC<ProjectsTabProps> = ({ onFlyToProject }) => {
  const { data: projects = [], isLoading } = useAllSaiProjects();

  const statusData = useMemo(
    () =>
      PROJECT_STATUSES.map((status) => ({
        name: status,
        value: projects.filter((p) => p.status === status).length,
      })).filter((d) => d.value > 0),
    [projects]
  );

  const byState = useMemo(() => {
    const map = new Map<string, Record<string, number> & { state: string; total: number }>();
    projects.forEach((p) => {
      const key = p.state || 'Unknown';
      const row =
        map.get(key) ??
        ({ state: key, total: 0, Completed: 0, 'In Progress': 0, Cancelled: 0 } as never);
      (row as Record<string, number>)[p.status] =
        ((row as Record<string, number>)[p.status] || 0) + 1;
      row.total += 1;
      map.set(key, row);
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [projects]);

  const byType = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      const key = p.infra_type || 'Not recorded';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const watchlist = useMemo(
    () =>
      projects
        .filter((p) => p.status === 'In Progress')
        .sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0)),
    [projects]
  );

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  const completed = statusData.find((s) => s.name === 'Completed')?.value ?? 0;
  const inProgress = statusData.find((s) => s.name === 'In Progress')?.value ?? 0;
  const cancelled = statusData.find((s) => s.name === 'Cancelled')?.value ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total projects', value: projects.length, icon: HardHat },
          { label: 'Completed', value: completed, icon: CheckCircle2 },
          { label: 'In Progress', value: inProgress, icon: Hammer },
          { label: 'Cancelled', value: cancelled, icon: XCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project status</CardTitle>
            <CardDescription>Distribution across all {projects.length} projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={PROJECT_STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by state</CardTitle>
            <CardDescription>Top 10 states, stacked by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byState} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="state" width={110} fontSize={11} />
                <Tooltip />
                <Legend />
                {PROJECT_STATUSES.map((status) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="s"
                    fill={PROJECT_STATUS_COLORS[status]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects by infrastructure type</CardTitle>
          <CardDescription>Count of projects per infra type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(280, byType.length * 26)}>
            <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="type" width={170} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In Progress watchlist ({watchlist.length})</CardTitle>
          <CardDescription>
            Least progress first. Click a row to view it on the map.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[420px] pr-4">
            <div className="space-y-1">
              {watchlist.map((p) => {
                const plottable = p.gps_in_india !== false && p.latitude !== null && p.longitude !== null;
                return (
                <button
                  key={p.project_code}
                  disabled={!plottable}
                  onClick={() => plottable && onFlyToProject(p)}
                  className="w-full rounded-lg border p-2 text-left transition-colors enabled:hover:bg-accent/50 disabled:cursor-default"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium truncate">{p.project_name}</span>
                    <Badge variant="secondary" className="shrink-0 tabular-nums text-[10px]">
                      {p.progress ?? 0}%
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {p.state} • {p.infra_type || 'Type not recorded'}
                    {!plottable && ' • not on map (invalid GPS)'}
                  </p>

                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, p.progress ?? 0))}%`,
                        background: PROJECT_STATUS_COLORS['In Progress'],
                      }}
                    />
                  </div>
                </button>
              ))}
              {watchlist.length === 0 && (
                <p className="text-sm text-muted-foreground">No in-progress projects.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsTab;
