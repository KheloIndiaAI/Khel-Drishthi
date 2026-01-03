import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  FormData, 
  RespondentData, 
  PrefillData,
  getDefaultFormData, 
  getDefaultRespondent,
  FORM_SECTIONS 
} from "../utils/formConfig";

export type { RespondentData };

interface UseSTCFormReturn {
  formData: FormData;
  setFormData: (data: FormData) => void;
  respondent: RespondentData;
  setRespondent: (data: RespondentData) => void;
  prefillData: PrefillData;
  isLoading: boolean;
  sectionProgress: number[];
  validationErrors: Record<number, Record<string, string>>;
  disciplines: string[];
}

export function useSTCForm(centreId: string): UseSTCFormReturn {
  const [formData, setFormData] = useState<FormData>(getDefaultFormData());
  const [respondent, setRespondent] = useState<RespondentData>(getDefaultRespondent());

  // Fetch prefill data from stc_capacity
  const { data: capacityData, isLoading: capacityLoading } = useQuery({
    queryKey: ['stc-capacity-prefill', centreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stc_capacity')
        .select('*')
        .eq('centre_id', centreId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!centreId,
  });

  // Fetch existing form data
  const { data: existingData, isLoading: existingLoading } = useQuery({
    queryKey: ['stc-detailed-data', centreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stc_detailed_data')
        .select('*')
        .eq('centre_id', centreId)
        .eq('assessment_year', new Date().getFullYear())
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!centreId,
  });

  // Build prefill data from capacity records
  const prefillData: PrefillData = useMemo(() => {
    if (!capacityData || capacityData.length === 0) {
      return {
        stc_id: centreId,
        stc_name: '',
        state: '',
        region: '',
        disciplines: [],
      };
    }

    const first = capacityData[0];
    return {
      stc_id: centreId,
      stc_name: first.centre_name || '',
      state: first.state || '',
      region: first.region || '',
      disciplines: capacityData.map(row => ({
        discipline_code: row.discipline_raw || '',
        discipline_name: row.discipline_raw || '',
        san_res_boys: row.san_res_boys || 0,
        san_res_girls: row.san_res_girls || 0,
        san_nonres_boys: row.san_nonres_boys || 0,
        san_nonres_girls: row.san_nonres_girls || 0,
        ex_res_boys: row.ex_res_boys || 0,
        ex_res_girls: row.ex_res_girls || 0,
        ex_nonres_boys: row.ex_nonres_boys || 0,
        ex_nonres_girls: row.ex_nonres_girls || 0,
      })),
    };
  }, [capacityData, centreId]);

  // Initialize form data from existing or prefill
  useEffect(() => {
    if (existingData) {
      // Load from existing submission
      const core = existingData.centre_identity as Record<string, unknown> || {};
      const infrastructure = existingData.infrastructure as Record<string, unknown> || {};
      const hostel = existingData.hostel_facilities as Record<string, unknown> || {};
      const staff = existingData.staff_details as Record<string, unknown> || {};
      const medical = existingData.medical_facilities as Record<string, unknown> || {};
      const equipment = existingData.equipment_inventory as Record<string, unknown> || {};
      const talent = existingData.athlete_details as Record<string, unknown> || {};
      const challenges = existingData.challenges as Record<string, unknown> || {};
      const disciplineSpecific = (challenges.disciplineSpecific as Record<string, Record<string, unknown>>) || {};
      const attachments = (challenges.attachments as unknown as FormData['attachments']) || [];
      const resp = (core.respondent as unknown as RespondentData) || null;

      setFormData({
        core: {
          stc_id: centreId,
          stc_name: prefillData.stc_name,
          verify_stc_name: (core.verify_stc_name as boolean) || false,
          state: prefillData.state,
          verify_state: (core.verify_state as boolean) || false,
          rc_name: prefillData.region,
          verify_rc_name: (core.verify_rc_name as boolean) || false,
          operational_status: (core.operational_status as string) || 'Fully operational',
          ...core,
        },
        disciplines: prefillData.disciplines.map(d => ({
          discipline_code: d.discipline_code,
          discipline_name: d.discipline_name,
          sanctioned_res_boys: d.san_res_boys,
          sanctioned_res_girls: d.san_res_girls,
          sanctioned_nonres_boys: d.san_nonres_boys,
          sanctioned_nonres_girls: d.san_nonres_girls,
          existing_res_boys: d.ex_res_boys,
          existing_res_girls: d.ex_res_girls,
          existing_nonres_boys: d.ex_nonres_boys,
          existing_nonres_girls: d.ex_nonres_girls,
        })),
        infrastructure: infrastructure as FormData['infrastructure'],
        hostel: { hostel_type: '', ...hostel } as FormData['hostel'],
        staff: { coach_count_total: 0, admin_staff_count_total: 0, ...staff } as FormData['staff'],
        medical: medical as FormData['medical'],
        equipment: equipment as FormData['equipment'],
        talent: talent as FormData['talent'],
        disciplineSpecific,
        attachments,
      });

      if (resp?.respondent_name) {
        setRespondent(resp);
      }
    } else if (prefillData.stc_name) {
      // Initialize from prefill
      setFormData(prev => ({
        ...prev,
        core: {
          ...prev.core,
          stc_id: centreId,
          stc_name: prefillData.stc_name,
          state: prefillData.state,
          rc_name: prefillData.region,
        },
        disciplines: prefillData.disciplines.map(d => ({
          discipline_code: d.discipline_code,
          discipline_name: d.discipline_name,
          sanctioned_res_boys: d.san_res_boys,
          sanctioned_res_girls: d.san_res_girls,
          sanctioned_nonres_boys: d.san_nonres_boys,
          sanctioned_nonres_girls: d.san_nonres_girls,
          existing_res_boys: d.ex_res_boys,
          existing_res_girls: d.ex_res_girls,
          existing_nonres_boys: d.ex_nonres_boys,
          existing_nonres_girls: d.ex_nonres_girls,
        })),
      }));
    }
  }, [existingData, prefillData, centreId]);

  // Calculate section progress
  const sectionProgress = useMemo(() => {
    return FORM_SECTIONS.map((_, index) => {
      // Simple progress calculation based on filled fields
      switch (index) {
        case 0: // Identity
          return formData.core.stc_name && formData.core.operational_status ? 100 : 50;
        case 1: // Disciplines
          return formData.disciplines.length > 0 ? 100 : 0;
        case 2: // Infrastructure
          return Object.keys(formData.infrastructure).length > 0 ? 
            Math.min(100, Object.keys(formData.infrastructure).length * 10) : 0;
        case 3: // Hostel
          return formData.hostel.hostel_type ? 100 : 0;
        case 4: // Staff
          return formData.staff.coach_count_total >= 0 ? 50 : 0;
        case 5: // Medical
          return Object.keys(formData.medical).length > 0 ? 100 : 0;
        case 6: // Equipment
          return Object.keys(formData.equipment).length > 0 ? 100 : 0;
        case 7: // Talent
          return Object.keys(formData.talent).length > 0 ? 100 : 0;
        case 8: // Discipline-specific
          return Object.keys(formData.disciplineSpecific).length > 0 ? 100 : 0;
        case 9: // Attachments
          return formData.attachments.length > 0 ? 100 : 0;
        default:
          return 0;
      }
    });
  }, [formData]);

  // Validation errors (simplified)
  const validationErrors: Record<number, Record<string, string>> = useMemo(() => {
    const errors: Record<number, Record<string, string>> = {};
    
    // Section 0: Identity validation
    if (!formData.core.operational_status) {
      errors[0] = { ...(errors[0] || {}), operational_status: 'Required' };
    }

    return errors;
  }, [formData]);

  // Get list of discipline names
  const disciplines = useMemo(() => {
    return formData.disciplines.map(d => d.discipline_name).filter(Boolean);
  }, [formData.disciplines]);

  return {
    formData,
    setFormData,
    respondent,
    setRespondent,
    prefillData,
    isLoading: capacityLoading || existingLoading,
    sectionProgress,
    validationErrors,
    disciplines,
  };
}
