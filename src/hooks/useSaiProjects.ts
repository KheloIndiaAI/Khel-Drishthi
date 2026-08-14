import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SaiProject {
  project_code: string;
  project_name: string;
  state: string;
  parent_centre_id: string | null;
  parent_facility_name: string | null;
  parent_is_ncoe: boolean | null;
  infra_type: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
  gps_in_india?: boolean | null;
  progress: number | null;
  remarks: string | null;
}


export const PROJECT_STATUS_COLORS: Record<string, string> = {
  Completed: '#059669',
  'In Progress': '#d97706',
  Cancelled: '#64748b',
};

export const PROJECT_STATUSES = ['Completed', 'In Progress', 'Cancelled'] as const;

/** Projects with verified GPS inside India — the only ones that may be plotted. */
export const useSaiProjects = () =>
  useQuery({
    queryKey: ['sai-projects-plottable'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sai_projects')
        .select(
          'project_code, project_name, state, parent_centre_id, parent_facility_name, parent_is_ncoe, infra_type, status, latitude, longitude, progress, remarks'
        )
        .eq('gps_in_india', true);
      if (error) throw error;
      return (data ?? []) as SaiProject[];
    },
  });

/** Every project row (373) — for analytics/report counts, never for plotting. */
export const useAllSaiProjects = () =>
  useQuery({
    queryKey: ['sai-projects-all'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sai_projects')
        .select(
          'project_code, project_name, state, parent_centre_id, parent_facility_name, parent_is_ncoe, infra_type, status, latitude, longitude, gps_in_india, progress, remarks'
        );
      if (error) throw error;
      return (data ?? []) as SaiProject[];
    },
  });

