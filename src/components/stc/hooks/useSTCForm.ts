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
        hostel: { hostel_available: false, ...hostel } as FormData['hostel'],
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

  // Calculate section progress - 8 sections now
  const sectionProgress = useMemo(() => {
    return FORM_SECTIONS.map((section, index) => {
      switch (section.id) {
        case 'identity': {
          const hasBasicData = !!formData.core.stc_name && !!formData.core.state && !!formData.core.operational_status;
          const hasVerifications = formData.core.verify_stc_name && formData.core.verify_state && formData.core.verify_rc_name;
          const hasCICName = !!formData.core.cic_name;
          
          if (hasBasicData && hasVerifications && hasCICName) return 100;
          if (hasBasicData && hasVerifications) return 80;
          if (hasBasicData && hasCICName) return 70;
          if (hasBasicData) return 50;
          return 0;
        }
        case 'disciplines':
          return formData.disciplines.length > 0 ? 100 : 0;
        case 'infrastructure': {
          const infraFields = formData.infrastructure;
          const hasLand = infraFields.land && Object.keys(infraFields.land).some(k => (infraFields.land as Record<string, unknown>)[k] !== undefined);
          const hasFops = infraFields.discipline_fops && infraFields.discipline_fops.length > 0;
          if (hasLand && hasFops) return 100;
          if (hasLand || hasFops) return 50;
          return 0;
        }
        case 'hostel':
          return formData.hostel.hostel_type ? 100 : 0;
        case 'staff': {
          const staff = formData.staff;
          const hasCoaches = staff.coach_count_total > 0;
          const hasAdmin = staff.admin_staff_count_total > 0;
          if (hasCoaches && hasAdmin) return 100;
          if (hasCoaches || hasAdmin) return 50;
          return 0;
        }
        case 'equipment': {
          const equip = formData.equipment;
          // Check for meaningful equipment data
          const hasOverallRating = equip.overall_equipment_quality_rating !== undefined && equip.overall_equipment_quality_rating > 0;
          const hasDisciplineEquip = equip.discipline_equipment && equip.discipline_equipment.some(d => d.equipment_description || d.equipment_adequacy);
          const hasSncSetup = !!equip.snc_setup_level;
          
          if (hasOverallRating && (hasDisciplineEquip || hasSncSetup)) return 100;
          if (hasOverallRating || hasDisciplineEquip || hasSncSetup) return 50;
          return 0;
        }
        case 'talent': {
          const talent = formData.talent;
          const hasTalentId = !!talent.talent_id_process;
          const hasCompetition = !!talent.competition_participation_level;
          if (hasTalentId && hasCompetition) return 100;
          if (hasTalentId || hasCompetition) return 50;
          return 0;
        }
        case 'attachments':
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
