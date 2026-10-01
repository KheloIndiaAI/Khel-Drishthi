import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  isSaving: boolean;
}

class SavePermissionError extends Error {
  constructor() {
    super('You are not assigned to edit this centre, so your changes were not saved. Contact your regional office or an administrator.');
    this.name = 'SavePermissionError';
  }
}

/** Turns Supabase/RLS failures into a message a centre in-charge can act on. */
function describeSaveError(error: unknown): string {
  if (error instanceof SavePermissionError) return error.message;
  const e = error as { code?: string; message?: string } | null;
  if (e?.code === '42501' || /row-level security|permission denied/i.test(e?.message ?? '')) {
    return new SavePermissionError().message;
  }
  if (e?.message === 'No active session') return 'Your session has expired. Please sign in again; your changes were not saved.';
  return 'Failed to save. Please check your connection and try again.';
}

export function useAutoSave({ centreId, formData, respondent }: UseAutoSaveProps): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');
  const saveInProgressRef = useRef<boolean>(false);
  // Set when a save is requested while another is in flight; that save re-runs afterwards
  // so edits made during an in-flight save are never dropped behind a "Saved!" toast.
  const pendingSaveRef = useRef<boolean>(false);
  const rerunRef = useRef<() => void>(() => {});

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (saveInProgressRef.current) {
        console.log('[AutoSave] Save in progress, queueing another save');
        pendingSaveRef.current = true;
        return 'queued' as const;
      }
      
      saveInProgressRef.current = true;
      console.log('[AutoSave] Starting save for centreId:', centreId);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        console.log('[AutoSave] No session, cannot save');
        throw new Error('No active session');
      }

      const now = new Date().toISOString();

      // Build the save payload
      const savePayload = {
        centre_name: formData.core.stc_name || '',
        state: formData.core.state || '',
        region: formData.core.rc_name || '',
        centre_identity: JSON.parse(JSON.stringify({
          ...formData.core,
          stc_id: centreId, // Ensure stc_id is always set
          respondent,
        })),
        infrastructure: JSON.parse(JSON.stringify(formData.infrastructure || {})),
        hostel_facilities: JSON.parse(JSON.stringify(formData.hostel || {})),
        staff_details: JSON.parse(JSON.stringify(formData.staff || {})),
        medical_facilities: JSON.parse(JSON.stringify(formData.medical || {})),
        equipment_inventory: JSON.parse(JSON.stringify(formData.equipment || {})),
        athlete_details: JSON.parse(JSON.stringify({
          ...formData.talent,
          disciplines: formData.disciplines, // Include discipline/athlete data with notes and catchment
          // Section 2 additional fields
          had_previous_disciplines: formData.had_previous_disciplines,
          previous_disciplines: formData.previous_disciplines || [],
          new_discipline_suggestions: formData.new_discipline_suggestions || '',
        })),
        challenges: JSON.parse(JSON.stringify({
          disciplineSpecific: formData.disciplineSpecific || {},
          attachments: formData.attachments || [],
          vision: formData.vision || {},
        })),
        updated_at: now,
        respondent: JSON.parse(JSON.stringify(respondent)),
      };

      console.log('[AutoSave] Payload prepared, checking for existing record');

      // First try to get existing record
      const { data: existing, error: fetchError } = await supabase
        .from('stc_detailed_data')
        .select('id')
        .eq('centre_id', centreId)
        .maybeSingle();

      if (fetchError) {
        console.error('[AutoSave] Error fetching existing:', fetchError);
        throw fetchError;
      }

      if (existing) {
        console.log('[AutoSave] Updating existing record:', existing.id);
        // RLS turns an unauthorised UPDATE into a 0-row no-op rather than an error,
        // so confirm a row actually changed before reporting "Saved".
        const { data: updated, error } = await supabase
          .from('stc_detailed_data')
          .update(savePayload)
          .eq('centre_id', centreId)
          .select('id');

        if (error) {
          console.error('[AutoSave] Update error:', error);
          throw error;
        }
        if (!updated?.length) {
          throw new SavePermissionError();
        }
        console.log('[AutoSave] Update successful');
      } else {
        console.log('[AutoSave] Inserting new record');
        const { error } = await supabase
          .from('stc_detailed_data')
          .insert({
            centre_id: centreId,
            ...savePayload,
          })
          .select('id');

        if (error) {
          console.error('[AutoSave] Insert error:', error);
          throw error;
        }
        console.log('[AutoSave] Insert successful');
      }
      return 'saved' as const;
    },
    onMutate: () => {
      setSaveStatus('saving');
    },
    onSuccess: (result) => {
      if (result === 'queued') return; // the in-flight save owns status/toasts
      saveInProgressRef.current = false;
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        setTimeout(() => rerunRef.current(), 0);
        return; // stay in 'saving' until the queued save lands
      }
      setSaveStatus('saved');
      setLastSaved(new Date());
      // Show brief toast on successful save
      toast.success('Saved!', {
        duration: 1500,
        position: 'bottom-center',
      });
    },
    onError: (error) => {
      console.error('[AutoSave] Save failed:', error);
      setSaveStatus('error');
      saveInProgressRef.current = false;
      pendingSaveRef.current = false; // the next edit triggers a fresh save
      toast.error(describeSaveError(error), { duration: 8000 });
    },
  });

  const triggerSave = useCallback(() => {
    if (!centreId) {
      console.log('[AutoSave] No centreId, cannot save');
      return;
    }
    console.log('[AutoSave] Manual save triggered');
    saveMutation.mutate();
  }, [centreId, saveMutation]);
  rerunRef.current = triggerSave;

  // Debounced auto-save on data changes - reduced to 1 second
  useEffect(() => {
    if (!centreId) return;
    
    const currentData = JSON.stringify({ formData, respondent });
    
    // Skip if data hasn't changed
    if (currentData === lastDataRef.current) return;
    lastDataRef.current = currentData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save - reduced to 1 second for faster saves
    timeoutRef.current = setTimeout(() => {
      console.log('[AutoSave] Debounce timer fired, triggering save');
      triggerSave();
    }, 1000); // 1 second debounce for faster feedback

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, respondent, centreId, triggerSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'Changes are being saved. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  return {
    saveStatus,
    lastSaved,
    triggerSave,
    isSaving: saveMutation.isPending,
  };
}
