import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FormData, RespondentData } from "../utils/formConfig";

interface UseAutoSaveProps {
  centreId: string;
  formData: FormData;
  respondent: RespondentData;
}

interface UseAutoSaveReturn {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  triggerSave: () => void;
}

export function useAutoSave({ centreId, formData, respondent }: UseAutoSaveProps): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const now = new Date().toISOString();

      // First try to get existing record
      const { data: existing } = await supabase
        .from('stc_detailed_data')
        .select('id')
        .eq('centre_id', centreId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('stc_detailed_data')
          .update({
            centre_name: formData.core.stc_name,
            state: formData.core.state,
            region: formData.core.rc_name,
            centre_identity: JSON.parse(JSON.stringify({
              ...formData.core,
              respondent,
            })),
            infrastructure: JSON.parse(JSON.stringify(formData.infrastructure)),
            hostel_facilities: JSON.parse(JSON.stringify(formData.hostel)),
            staff_details: JSON.parse(JSON.stringify(formData.staff)),
            medical_facilities: JSON.parse(JSON.stringify(formData.medical)),
            equipment_inventory: JSON.parse(JSON.stringify(formData.equipment)),
            athlete_details: JSON.parse(JSON.stringify(formData.talent)),
            challenges: JSON.parse(JSON.stringify({
              disciplineSpecific: formData.disciplineSpecific,
              attachments: formData.attachments,
            })),
            updated_at: now,
          })
          .eq('centre_id', centreId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('stc_detailed_data')
          .insert({
            centre_id: centreId,
            centre_name: formData.core.stc_name,
            state: formData.core.state,
            region: formData.core.rc_name,
            centre_identity: JSON.parse(JSON.stringify({
              ...formData.core,
              respondent,
            })),
            infrastructure: JSON.parse(JSON.stringify(formData.infrastructure)),
            hostel_facilities: JSON.parse(JSON.stringify(formData.hostel)),
            staff_details: JSON.parse(JSON.stringify(formData.staff)),
            medical_facilities: JSON.parse(JSON.stringify(formData.medical)),
            equipment_inventory: JSON.parse(JSON.stringify(formData.equipment)),
            athlete_details: JSON.parse(JSON.stringify(formData.talent)),
            challenges: JSON.parse(JSON.stringify({
              disciplineSpecific: formData.disciplineSpecific,
              attachments: formData.attachments,
            })),
          });

        if (error) throw error;
      }
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSaved(new Date());
    },
    onError: () => {
      setSaveStatus('error');
    },
  });

  const triggerSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  // Debounced auto-save on data changes
  useEffect(() => {
    const currentData = JSON.stringify({ formData, respondent });
    
    // Skip if data hasn't changed
    if (currentData === lastDataRef.current) return;
    lastDataRef.current = currentData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      if (centreId && formData.core.stc_id) {
        triggerSave();
      }
    }, 2000); // 2 second debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, respondent, centreId, triggerSave]);

  return {
    saveStatus,
    lastSaved,
    triggerSave,
  };
}
