import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { STCCard } from '@/components/stc/STCCard';
import { PageSEO } from '@/components/seo/PageSEO';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, Building2, MapPin, Users, CheckCircle2, 
  Clock, Circle, Filter, ArrowUpDown, Lock, Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STCDataCollection: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'in-progress' | 'not-started'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'state'>('name');

  // Get current session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Get user access info
  const userAccess = useUserAccess(session?.user?.id);

  // Fetch STC data with capacity and form progress
  const { data: stcList, isLoading } = useQuery({
    queryKey: ['stc-list-with-progress', userAccess.isAdmin, userAccess.assignedCentres, userAccess.assignedRegions],
    queryFn: async () => {
      // Get all STCs from stc_capacity
      const { data: stcCapacity } = await supabase
        .from('stc_capacity')
        .select('centre_id, centre_name, state, region');

      // Get unique centres
      const uniqueCentres = new Map<string, any>();
      stcCapacity?.forEach(c => {
        if (!uniqueCentres.has(c.centre_id)) {
          uniqueCentres.set(c.centre_id, {
            centre_id: c.centre_id,
            centre_name: c.centre_name,
            state: c.state,
            region: c.region,
          });
        }
      });

      // Get disciplines for each centre
      const { data: links } = await supabase
        .from('centre_sport_links')
        .select('centre_id, discipline_name, sport_name')
        .eq('centre_type', 'STC');

      // Get capacity totals
      const { data: capacityData } = await supabase
        .from('stc_capacity')
        .select('centre_id, ex_grand_total, san_grand_total');

      // Get form progress
      const { data: detailedData } = await supabase
        .from('stc_detailed_data')
        .select('centre_id, form_progress');

      // Build final list
      let centres = Array.from(uniqueCentres.values()).map(centre => {
        const centreLinks = links?.filter(l => l.centre_id === centre.centre_id) || [];
        const disciplines = [...new Set(centreLinks.map(l => l.discipline_name || l.sport_name).filter(Boolean))];
        
        const centreCapacity = capacityData?.filter(c => c.centre_id === centre.centre_id) || [];
        const athleteCount = centreCapacity.reduce((sum, c) => sum + (c.ex_grand_total || 0), 0);
        
        const formProgress = detailedData?.find(d => d.centre_id === centre.centre_id)?.form_progress || 0;

        // Check if user can edit this centre
        const canEdit = userAccess.canEditCentre(centre.centre_id);

        return {
          ...centre,
          disciplines,
          athleteCount,
          formProgress,
          canEdit,
        };
      });

      // For non-admins, filter to only show accessible centres (but still show all for reference)
      // We'll show all but mark which ones are editable

      return centres;
    },
    enabled: !userAccess.isLoading,
  });

  // Filter and sort
  const filteredSTCs = React.useMemo(() => {
    let result = stcList || [];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(stc => 
        stc.centre_name?.toLowerCase().includes(term) ||
        stc.state?.toLowerCase().includes(term) ||
        stc.disciplines.some((d: string) => d.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(stc => {
        if (statusFilter === 'complete') return stc.formProgress === 100;
        if (statusFilter === 'in-progress') return stc.formProgress > 0 && stc.formProgress < 100;
        if (statusFilter === 'not-started') return stc.formProgress === 0;
        return true;
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return (a.centre_name || '').localeCompare(b.centre_name || '');
      if (sortBy === 'progress') return b.formProgress - a.formProgress;
      if (sortBy === 'state') return (a.state || '').localeCompare(b.state || '');
      return 0;
    });

    return result;
  }, [stcList, searchTerm, statusFilter, sortBy]);

  // Stats (only for accessible centres for non-admins)
  const stats = React.useMemo(() => {
    const accessibleCentres = userAccess.isAdmin 
      ? stcList 
      : stcList?.filter(s => s.canEdit);
    
    const total = accessibleCentres?.length || 0;
    const complete = accessibleCentres?.filter(s => s.formProgress === 100).length || 0;
    const inProgress = accessibleCentres?.filter(s => s.formProgress > 0 && s.formProgress < 100).length || 0;
    const notStarted = accessibleCentres?.filter(s => s.formProgress === 0).length || 0;
    const avgProgress = total > 0 
      ? Math.round(accessibleCentres!.reduce((sum, s) => sum + s.formProgress, 0) / total) 
      : 0;

    return { total, complete, inProgress, notStarted, avgProgress };
  }, [stcList, userAccess.isAdmin]);

  // Show access info for non-admin users
  const accessInfo = React.useMemo(() => {
    if (userAccess.isAdmin) return null;
    
    if (userAccess.assignedCentres.length > 0) {
      return {
        type: 'centre',
        message: `You have access to ${userAccess.assignedCentres.length} centre(s)`,
      };
    }
    
    if (userAccess.assignedRegions.length > 0) {
      const regionNames = userAccess.assignedRegions.map(r => r.region_name).join(', ');
      return {
        type: 'region',
        message: `You have regional access: ${regionNames}`,
      };
    }

    return {
      type: 'none',
      message: 'You have view-only access. Request editor access to fill forms.',
    };
  }, [userAccess]);

  return (
    <DashboardLayout>
      <PageSEO
        title="STC Data Collection | SAI Sports Training Centres"
        description="Comprehensive data collection for SAI Sports Training Centres across India"
      />

      <div className="container mx-auto py-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            STC Data Collection
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete the data collection forms for each SAI Sports Training Centre
          </p>
        </div>

        {/* Access Info Alert */}
        {accessInfo && !userAccess.isAdmin && (
          <Alert className={cn(
            accessInfo.type === 'none' ? 'border-amber-500/30 bg-amber-500/5' : 'border-primary/30 bg-primary/5'
          )}>
            <Info className={cn(
              "h-4 w-4",
              accessInfo.type === 'none' ? 'text-amber-500' : 'text-primary'
            )} />
            <AlertDescription className="flex items-center justify-between">
              <span>{accessInfo.message}</span>
              {accessInfo.type === 'none' && session?.user?.id && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="ml-4"
                >
                  Request Access
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">
                  {userAccess.isAdmin ? 'Total STCs' : 'Your STCs'}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-display font-bold">{stats.complete}</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-display font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <Circle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-display font-bold">{stats.notStarted}</p>
                <p className="text-sm text-muted-foreground">Not Started</p>
              </div>
            </div>
          </div>
          <div className="stat-card col-span-2 md:col-span-1">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-lg font-display font-bold text-primary">{stats.avgProgress}%</p>
              </div>
              <Progress value={stats.avgProgress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, state, or discipline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              {(['all', 'complete', 'in-progress', 'not-started'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All' : status.replace('-', ' ')}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortBy(prev => 
                prev === 'name' ? 'progress' : prev === 'progress' ? 'state' : 'name'
              )}
              title={`Sort by ${sortBy}`}
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* STC Grid */}
        {isLoading || userAccess.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSTCs.map((stc) => (
              <div key={stc.centre_id} className="relative">
                {/* Lock overlay for non-accessible centres */}
                {!stc.canEdit && !userAccess.isAdmin && (
                  <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                    <div className="text-center p-4">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No edit access</p>
                    </div>
                  </div>
                )}
                <STCCard
                  centreId={stc.centre_id}
                  centreName={stc.centre_name || 'Unknown STC'}
                  state={stc.state || 'Unknown'}
                  disciplines={stc.disciplines}
                  athleteCount={stc.athleteCount}
                  formProgress={stc.formProgress}
                  onClick={() => navigate(`/infrastructure/stc/${stc.centre_id}/form`)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !userAccess.isLoading && filteredSTCs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-foreground mb-2">
              No STCs Found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default STCDataCollection;
