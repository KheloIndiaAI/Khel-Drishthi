import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserAccess {
  isAdmin: boolean;
  isEditor: boolean;
  isViewer: boolean;
  assignedCentres: string[];
  assignedRegions: { region_id: string; region_name: string; access_level: string }[];
  canEditCentre: (centreId: string) => boolean;
  canViewCentre: (centreId: string) => boolean;
  isLoading: boolean;
}

export function useUserAccess(userId: string | undefined): UserAccess {
  // Check admin/editor roles
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return { isAdmin: false, isEditor: false };
      
      const [adminResult, editorResult] = await Promise.all([
        supabase.rpc('has_role', { _user_id: userId, _role: 'admin' }),
        supabase.rpc('has_role', { _user_id: userId, _role: 'editor' }),
      ]);
      
      return {
        isAdmin: adminResult.data || false,
        isEditor: editorResult.data || false,
      };
    },
    enabled: !!userId,
  });

  // Get assigned centres
  const { data: centreAssignments, isLoading: centresLoading } = useQuery({
    queryKey: ['user-centre-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('user_centre_assignments')
        .select('centre_id')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      return data?.map(a => a.centre_id) || [];
    },
    enabled: !!userId,
  });

  // Get assigned regions
  const { data: regionAssignments, isLoading: regionsLoading } = useQuery({
    queryKey: ['user-region-assignments', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase
        .from('user_region_assignments')
        .select(`
          region_id,
          access_level,
          regional_centres!inner(name, display_name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      return data?.map(a => ({
        region_id: a.region_id,
        region_name: (a.regional_centres as any)?.display_name || (a.regional_centres as any)?.name,
        access_level: a.access_level,
      })) || [];
    },
    enabled: !!userId,
  });

  // Get accessible centres for non-admins (includes region-based access)
  const { data: accessibleCentres, isLoading: accessibleLoading } = useQuery({
    queryKey: ['user-accessible-centres', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data } = await supabase.rpc('get_user_accessible_centres', { 
        _user_id: userId 
      });
      
      return data?.map((d: { centre_id: string }) => d.centre_id) || [];
    },
    enabled: !!userId && !roles?.isAdmin,
  });

  const isAdmin = roles?.isAdmin || false;
  const isEditor = roles?.isEditor || false;
  const isViewer = !isAdmin && !isEditor;
  const assignedCentres = centreAssignments || [];
  const assignedRegions = regionAssignments || [];

  const canEditCentre = (centreId: string): boolean => {
    if (isAdmin) return true;
    if (!isEditor) return false;
    
    // Check direct assignment or region-based access
    return accessibleCentres?.includes(centreId) || false;
  };

  const canViewCentre = (centreId: string): boolean => {
    if (isAdmin) return true;
    return accessibleCentres?.includes(centreId) || false;
  };

  return {
    isAdmin,
    isEditor,
    isViewer,
    assignedCentres,
    assignedRegions,
    canEditCentre,
    canViewCentre,
    isLoading: rolesLoading || centresLoading || regionsLoading || accessibleLoading,
  };
}

export function useCanEditCentre(userId: string | undefined, centreId: string | undefined) {
  return useQuery({
    queryKey: ['can-edit-centre', userId, centreId],
    queryFn: async () => {
      if (!userId || !centreId) return false;
      
      const { data } = await supabase.rpc('can_edit_centre', {
        _user_id: userId,
        _centre_id: centreId,
      });
      
      return data || false;
    },
    enabled: !!userId && !!centreId,
  });
}
