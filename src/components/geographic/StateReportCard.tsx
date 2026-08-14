import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Users, Target, Trophy, Wallet } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { Centre } from './IndiaMap';

interface CentreSportLink {
  centre_id: string;
  sport_name: string | null;
}

interface CapacityRow {
  centre_id: string | null;
  san_grand_total: number | null;
  ex_grand_total: number | null;
  ex_res_boys: number | null;
  ex_res_girls: number | null;
  ex_nonres_boys: number | null;
  ex_nonres_girls: number | null;
}

interface StateReportCardProps {
  open: boolean;
  stateName: string | null;
  centres: Centre[];
  centreSportLinks: CentreSportLink[];
  regionByState?: Record<string, string>;
  regionColors: Record<string, string>;
  centreTypeColors: Record<string, string>;
  onClose: () => void;
  onCentreClick: (centre: Centre) => void;
}

const CAPACITY_COLUMNS =
  'centre_id, san_grand_total, ex_grand_total, ex_res_boys, ex_res_girls, ex_nonres_boys, ex_nonres_girls';

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const hasCoords = (c: Centre) =>
  c.latitude !== null && c.latitude !== undefined && c.latitude !== '' &&
  c.longitude !== null && c.longitude !== undefined && c.longitude !== '';

const useCapacityRows = () =>
  useQuery({
    queryKey: ['geo-state-capacity'],
    staleTime: Infinity,
    queryFn: async () => {
      const [ncoe, stc] = await Promise.all([
        supabase.from('ncoe_capacity').select(CAPACITY_COLUMNS),
        supabase.from('stc_capacity').select(CAPACITY_COLUMNS),
      ]);
      if (ncoe.error) throw ncoe.error;
      if (stc.error) throw stc.error;
      return [...(ncoe.data ?? []), ...(stc.data ?? [])] as CapacityRow[];
    },
  });

const SectionTitle: React.FC<{ icon: React.ReactNode; children: React.ReactNode; hint?: string }> = ({
  icon,
  children,
  hint,
}) => (
  <div className="mb-3">
    <h3 className="text-sm font-semibold flex items-center gap-2">
      {icon}
      {children}
    </h3>
    {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
  </div>
);

const EmptyNote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs text-muted-foreground rounded-md border border-dashed p-3">{children}</p>
);

const ReportBody: React.FC<Omit<StateReportCardProps, 'open' | 'onClose'>> = ({
  stateName,
  centres,
  centreSportLinks,
  regionByState,
  regionColors,
  centreTypeColors,
  onCentreClick,
}) => {
  const { data: capacityRows } = useCapacityRows();

  const stateCentres = useMemo(
    () => (stateName ? centres.filter((c) => c.state === stateName) : []),
    [centres, stateName]
  );

  const centreById = useMemo(() => {
    const m = new Map<string, Centre>();
    stateCentres.forEach((c) => m.set(c.centre_id, c));
    return m;
  }, [stateCentres]);

  const mappedCount = useMemo(() => stateCentres.filter(hasCoords).length, [stateCentres]);

  const typeMix = useMemo(() => {
    const counts: Record<string, number> = {};
    stateCentres.forEach((c) => {
      counts[c.centre_type] = (counts[c.centre_type] || 0) + 1;
    });
    return ['NCOE', 'STC', 'KIC', 'KISCE']
      .map((t) => ({ type: t, count: counts[t] || 0 }))
      .filter((t) => t.count > 0);
  }, [stateCentres]);

  const statusMix = useMemo(() => {
    const counts: Record<string, number> = {};
    stateCentres.forEach((c) => {
      const key = c.operational_status?.trim() || 'Not recorded';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stateCentres]);

  // Capacity rows joined by centre_id ONLY (their own state columns are unreliable)
  const stateCapacityRows = useMemo(
    () => (capacityRows ?? []).filter((r) => r.centre_id && centreById.has(r.centre_id)),
    [capacityRows, centreById]
  );

  const capacity = useMemo(() => {
    let sanctioned = 0;
    let existing = 0;
    let boys = 0;
    let girls = 0;
    stateCapacityRows.forEach((r) => {
      sanctioned += num(r.san_grand_total);
      existing += num(r.ex_grand_total);
      boys += num(r.ex_res_boys) + num(r.ex_nonres_boys);
      girls += num(r.ex_res_girls) + num(r.ex_nonres_girls);
    });
    const utilization = sanctioned > 0 ? (existing / sanctioned) * 100 : 0;
    return { sanctioned, existing, boys, girls, utilization };
  }, [stateCapacityRows]);

  const topDisciplines = useMemo(() => {
    const bySport = new Map<string, Set<string>>();
    centreSportLinks.forEach((l) => {
      if (!l.sport_name || !centreById.has(l.centre_id)) return;
      if (!bySport.has(l.sport_name)) bySport.set(l.sport_name, new Set());
      bySport.get(l.sport_name)!.add(l.centre_id);
    });
    return Array.from(bySport.entries())
      .map(([sport, ids]) => ({ sport, count: ids.size }))
      .sort((a, b) => b.count - a.count || a.sport.localeCompare(b.sport))
      .slice(0, 8);
  }, [centreSportLinks, centreById]);

  const topFacilities = useMemo(() => {
    const totals = new Map<string, { sanctioned: number; existing: number }>();
    stateCapacityRows.forEach((r) => {
      const id = r.centre_id as string;
      const cur = totals.get(id) ?? { sanctioned: 0, existing: 0 };
      cur.sanctioned += num(r.san_grand_total);
      cur.existing += num(r.ex_grand_total);
      totals.set(id, cur);
    });
    return Array.from(totals.entries())
      .map(([id, t]) => ({ centre: centreById.get(id)!, ...t }))
      .filter((f) => f.centre)
      .sort((a, b) => b.sanctioned - a.sanctioned)
      .slice(0, 5);
  }, [stateCapacityRows, centreById]);

  const region = stateName ? regionByState?.[stateName] : undefined;
  const maxDiscipline = topDisciplines[0]?.count ?? 1;
  const totalGender = capacity.boys + capacity.girls;

  return (
    <div className="space-y-6 pb-8">
      {/* 1. HEADER */}
      <div className="flex flex-wrap items-center gap-2">
        {region && (
          <Badge
            className="text-white border-0"
            style={{ backgroundColor: regionColors[region] ?? 'hsl(var(--muted-foreground))' }}
          >
            RC {region}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {mappedCount} of {stateCentres.length} centres mapped
        </span>
      </div>

      <Separator />

      {/* 2. FACILITY MIX */}
      <section>
        <SectionTitle icon={<Building2 className="h-4 w-4" />}>Facility mix</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {typeMix.map(({ type, count }) => (
            <div key={type} className="rounded-lg border p-2 text-center">
              <p className="text-lg font-bold tabular-nums">{count}</p>
              <p className="text-[10px] font-medium" style={{ color: centreTypeColors[type] }}>
                {type}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Operational status</p>
          {statusMix.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-xs">
              <span className={cn(status === 'Not recorded' && 'text-muted-foreground italic')}>
                {status}
              </span>
              <span className="tabular-nums font-medium">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* 3. TRAINING CAPACITY */}
      <section>
        <SectionTitle icon={<Users className="h-4 w-4" />} hint="NCOE + STC programmes">
          Training capacity
        </SectionTitle>
        {stateCapacityRows.length === 0 ? (
          <EmptyNote>No NCOE/STC capacity data for this state.</EmptyNote>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border p-2">
                <p className="text-[10px] text-muted-foreground">Sanctioned</p>
                <p className="text-lg font-bold tabular-nums">{capacity.sanctioned}</p>
              </div>
              <div className="rounded-lg border p-2">
                <p className="text-[10px] text-muted-foreground">Existing</p>
                <p className="text-lg font-bold tabular-nums">{capacity.existing}</p>
              </div>
              <div className="rounded-lg border p-2">
                <p className="text-[10px] text-muted-foreground">Utilization</p>
                <p className="text-lg font-bold tabular-nums">{capacity.utilization.toFixed(1)}%</p>
              </div>
            </div>
            <Progress value={Math.min(100, capacity.utilization)} className="h-2" />
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Boys {capacity.boys}</span>
                <span>Girls {capacity.girls}</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="bg-primary"
                  style={{ width: totalGender ? `${(capacity.boys / totalGender) * 100}%` : '0%' }}
                />
                <div
                  className="bg-accent"
                  style={{ width: totalGender ? `${(capacity.girls / totalGender) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* 4. TOP DISCIPLINES */}
      <section>
        <SectionTitle icon={<Target className="h-4 w-4" />} hint="Distinct centres offering each sport">
          Top disciplines
        </SectionTitle>
        {topDisciplines.length === 0 ? (
          <EmptyNote>No sport links recorded for this state.</EmptyNote>
        ) : (
          <div className="space-y-1.5">
            {topDisciplines.map((d) => (
              <div key={d.sport} className="flex items-center gap-2">
                <span className="w-28 shrink-0 truncate text-xs">{d.sport}</span>
                <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(d.count / maxDiscipline) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right text-xs tabular-nums">{d.count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* 5. TOP FACILITIES */}
      <section>
        <SectionTitle icon={<Trophy className="h-4 w-4" />} hint="By sanctioned capacity">
          Top facilities
        </SectionTitle>
        {topFacilities.length === 0 ? (
          <EmptyNote>No NCOE/STC capacity data for this state.</EmptyNote>
        ) : (
          <div className="space-y-2">
            {topFacilities.map((f) => (
              <button
                key={f.centre.centre_id}
                type="button"
                onClick={() => onCentreClick(f.centre)}
                className="w-full rounded-lg border p-2 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">{f.centre.centre_name}</span>
                  <Badge
                    className="text-white border-0 text-[10px] shrink-0"
                    style={{ backgroundColor: centreTypeColors[f.centre.centre_type] }}
                  >
                    {f.centre.centre_type}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                  {f.existing} existing / {f.sanctioned} sanctioned
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      <Separator />

      {/* 6. KISCE FUNDS BY FY */}
      <section>
        <SectionTitle icon={<Wallet className="h-4 w-4" />}>KISCE funds by FY</SectionTitle>
        <div className="rounded-lg border border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">Funds data coming soon</p>
        </div>
      </section>
    </div>
  );
};

export const StateReportCard: React.FC<StateReportCardProps> = (props) => {
  const { open, stateName, onClose } = props;
  const isMobile = useIsMobile();
  console.log('RC_RENDER', open, stateName, isMobile);

  if (!stateName) return null;

  const title = (
    <div className="flex flex-col items-start">
      <span className="text-lg font-semibold">{stateName}</span>
      <span className="text-xs font-normal text-muted-foreground">State report card</span>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle asChild>{title}</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="px-4 overflow-y-auto">
            <ReportBody {...props} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={false}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle asChild>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ReportBody {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StateReportCard;
