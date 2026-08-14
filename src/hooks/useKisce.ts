import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KisceFund {
  facility_id: string;
  kd_centre_id: string | null;
  state: string;
  funds_released: number | null;
  sanction_date: string | null;
  release_date: string | null;
  head: string | null;
  uc_status: string | null;
  uc_pending: boolean | null;
  financial_year: string;
}

export interface KisceManpower {
  facility_id: string;
  kd_centre_id: string | null;
  state: string;
  staff_category: string;
  designation: string;
  sanctioned: number | null;
  current_strength: number | null;
  status_normalized: string | null;
}

export interface CentreContact {
  map_facility_id: string;
  kd_centre_id: string | null;
  facility_name: string | null;
  state: string | null;
  contact_info: string | null;
  contact_number: string | null;
}

/** Format plain rupees in Indian notation (Cr / L / plain). */
export const formatINR = (rupees: number): string => {
  if (!Number.isFinite(rupees) || rupees === 0) return '₹0';
  const abs = Math.abs(rupees);
  if (abs >= 1_00_00_000) return `₹${(rupees / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `₹${(rupees / 1_00_000).toFixed(2)} L`;
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
};

export const formatINRFull = (rupees: number): string =>
  `₹${Math.round(rupees || 0).toLocaleString('en-IN')}`;

export const useKisceFunds = () =>
  useQuery({
    queryKey: ['kisce-funds'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kisce_funds')
        .select(
          'facility_id, kd_centre_id, state, funds_released, sanction_date, release_date, head, uc_status, uc_pending, financial_year'
        );
      if (error) throw error;
      return (data ?? []).map((r) => ({
        ...r,
        funds_released: r.funds_released === null ? null : Number(r.funds_released),
      })) as KisceFund[];
    },
  });

export const useKisceManpower = () =>
  useQuery({
    queryKey: ['kisce-manpower'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kisce_manpower')
        .select(
          'facility_id, kd_centre_id, state, staff_category, designation, sanctioned, current_strength, status_normalized'
        );
      if (error) throw error;
      return (data ?? []) as KisceManpower[];
    },
  });

/** Authenticated-only table: anonymous users silently get zero rows. */
export const useCentreContacts = (centreId: string | null | undefined) =>
  useQuery({
    queryKey: ['centre-contacts', centreId],
    staleTime: Infinity,
    enabled: !!centreId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centre_contacts')
        .select('map_facility_id, kd_centre_id, facility_name, state, contact_info, contact_number')
        .eq('kd_centre_id', centreId!);
      if (error) return [] as CentreContact[];
      return (data ?? []) as CentreContact[];
    },
  });

export const summariseFunds = (rows: KisceFund[]) => {
  const total = rows.reduce((s, r) => s + (r.funds_released || 0), 0);
  const pending = rows.filter((r) => r.uc_pending).length;
  const sorted = [...rows].sort((a, b) =>
    (b.financial_year || '').localeCompare(a.financial_year || '')
  );
  return { total, pending, count: rows.length, sorted };
};

export const summariseManpower = (rows: KisceManpower[]) => {
  const sanctioned = rows.reduce((s, r) => s + (r.sanctioned || 0), 0);
  const inPost = rows.reduce((s, r) => s + (r.current_strength || 0), 0);
  const fillRate = sanctioned > 0 ? (inPost / sanctioned) * 100 : 0;
  const byCategory = new Map<string, { sanctioned: number; inPost: number }>();
  rows.forEach((r) => {
    const key = r.staff_category || 'Other';
    const cur = byCategory.get(key) || { sanctioned: 0, inPost: 0 };
    cur.sanctioned += r.sanctioned || 0;
    cur.inPost += r.current_strength || 0;
    byCategory.set(key, cur);
  });
  return {
    sanctioned,
    inPost,
    fillRate,
    categories: Array.from(byCategory.entries()).map(([name, v]) => ({
      name,
      ...v,
      vacancy: Math.max(0, v.sanctioned - v.inPost),
    })),
  };
};
