-- Create stc_detailed_data table for comprehensive STC information
CREATE TABLE public.stc_detailed_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  centre_id TEXT NOT NULL,
  centre_name TEXT,
  state TEXT,
  region TEXT,
  
  -- Form progress tracking
  form_progress INTEGER DEFAULT 0,
  last_section_completed TEXT,
  current_section INTEGER DEFAULT 1,
  
  -- Section 1: Centre Identity
  centre_identity JSONB DEFAULT '{}'::jsonb,
  
  -- Section 2: Infrastructure
  infrastructure JSONB DEFAULT '{}'::jsonb,
  
  -- Section 3: Staff & Coaches
  staff_details JSONB DEFAULT '{}'::jsonb,
  
  -- Section 4: Athletes
  athlete_details JSONB DEFAULT '{}'::jsonb,
  
  -- Section 5: Equipment
  equipment_inventory JSONB DEFAULT '{}'::jsonb,
  
  -- Section 6: Hostel & Amenities
  hostel_facilities JSONB DEFAULT '{}'::jsonb,
  
  -- Section 7: Medical & Support
  medical_facilities JSONB DEFAULT '{}'::jsonb,
  
  -- Section 8: Challenges & Needs
  challenges JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_centre_id UNIQUE (centre_id)
);

-- Enable RLS
ALTER TABLE public.stc_detailed_data ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "STC data publicly readable"
ON public.stc_detailed_data
FOR SELECT
USING (true);

CREATE POLICY "Admins manage STC data"
ON public.stc_detailed_data
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors with permission can update stc_detailed_data"
ON public.stc_detailed_data
FOR UPDATE
USING (can_edit_table(auth.uid(), 'stc_detailed_data'::text));

CREATE POLICY "Editors can insert stc_detailed_data"
ON public.stc_detailed_data
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_stc_detailed_data_updated_at
BEFORE UPDATE ON public.stc_detailed_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_stc_detailed_data_centre_id ON public.stc_detailed_data(centre_id);
CREATE INDEX idx_stc_detailed_data_state ON public.stc_detailed_data(state);