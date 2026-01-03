-- Add new columns to stc_detailed_data for form v4
ALTER TABLE public.stc_detailed_data 
ADD COLUMN IF NOT EXISTS assessment_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS assessment_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN IF NOT EXISTS form_version INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS respondent JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS derived_kpis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS data_quality_flags JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS scoring JSONB DEFAULT '{}'::jsonb;

-- Create unique constraint for one assessment per centre per year
CREATE UNIQUE INDEX IF NOT EXISTS idx_stc_detailed_data_centre_year 
ON public.stc_detailed_data(centre_id, assessment_year);

-- Create normalized analytics table: stc_discipline_strength
CREATE TABLE IF NOT EXISTS public.stc_discipline_strength (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL,
  centre_id TEXT NOT NULL,
  discipline_code TEXT NOT NULL,
  discipline_name TEXT,
  -- Strength fields
  sanctioned_res_boys INTEGER DEFAULT 0,
  sanctioned_res_girls INTEGER DEFAULT 0,
  sanctioned_nonres_boys INTEGER DEFAULT 0,
  sanctioned_nonres_girls INTEGER DEFAULT 0,
  existing_res_boys INTEGER DEFAULT 0,
  existing_res_girls INTEGER DEFAULT 0,
  existing_nonres_boys INTEGER DEFAULT 0,
  existing_nonres_girls INTEGER DEFAULT 0,
  -- Derived fields
  sanctioned_total INTEGER DEFAULT 0,
  existing_total INTEGER DEFAULT 0,
  utilization_rate NUMERIC(5,2),
  vacancy_total INTEGER DEFAULT 0,
  surplus_total INTEGER DEFAULT 0,
  -- Facility fields
  facility_availability_status TEXT,
  facility_partner_name TEXT,
  facility_distance_km NUMERIC(6,2),
  -- FoP fields
  fop_primary_type TEXT,
  fop_location TEXT,
  fop_surface_type TEXT,
  fop_count INTEGER DEFAULT 0,
  fop_condition_rating INTEGER,
  fop_maintenance_status TEXT,
  -- Equipment
  equipment_adequacy_status TEXT,
  -- Notes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stc_discipline_strength
ALTER TABLE public.stc_discipline_strength ENABLE ROW LEVEL SECURITY;

CREATE POLICY "STC discipline strength publicly readable"
ON public.stc_discipline_strength FOR SELECT
USING (true);

CREATE POLICY "Admins manage stc_discipline_strength"
ON public.stc_discipline_strength FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can insert stc_discipline_strength"
ON public.stc_discipline_strength FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Editors with permission can update stc_discipline_strength"
ON public.stc_discipline_strength FOR UPDATE
USING (can_edit_table(auth.uid(), 'stc_discipline_strength'::text));

-- Create normalized analytics table: stc_staff_roster
CREATE TABLE IF NOT EXISTS public.stc_staff_roster (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL,
  centre_id TEXT NOT NULL,
  staff_type TEXT NOT NULL, -- 'coach' or 'admin'
  staff_name TEXT,
  staff_designation TEXT,
  discipline_code TEXT, -- for coaches
  division_responsibility TEXT[], -- for admin staff
  posted_since_date DATE,
  employment_nature TEXT, -- Regular/Contractual/Outsourced/Deputation/Other
  dedicated_to_stc BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stc_staff_roster
ALTER TABLE public.stc_staff_roster ENABLE ROW LEVEL SECURITY;

CREATE POLICY "STC staff roster publicly readable"
ON public.stc_staff_roster FOR SELECT
USING (true);

CREATE POLICY "Admins manage stc_staff_roster"
ON public.stc_staff_roster FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can insert stc_staff_roster"
ON public.stc_staff_roster FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create normalized analytics table: stc_equipment_gaps
CREATE TABLE IF NOT EXISTS public.stc_equipment_gaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL,
  centre_id TEXT NOT NULL,
  discipline_code TEXT,
  gap_item_name TEXT NOT NULL,
  gap_qty_required INTEGER DEFAULT 1,
  gap_priority TEXT, -- High/Medium/Low
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stc_equipment_gaps
ALTER TABLE public.stc_equipment_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "STC equipment gaps publicly readable"
ON public.stc_equipment_gaps FOR SELECT
USING (true);

CREATE POLICY "Admins manage stc_equipment_gaps"
ON public.stc_equipment_gaps FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can insert stc_equipment_gaps"
ON public.stc_equipment_gaps FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create normalized analytics table: stc_competition_summary
CREATE TABLE IF NOT EXISTS public.stc_competition_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL,
  centre_id TEXT NOT NULL,
  competition_level TEXT NOT NULL, -- District/State/National/International
  participations_count INTEGER DEFAULT 0,
  medals_count INTEGER DEFAULT 0,
  top8_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on stc_competition_summary
ALTER TABLE public.stc_competition_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "STC competition summary publicly readable"
ON public.stc_competition_summary FOR SELECT
USING (true);

CREATE POLICY "Admins manage stc_competition_summary"
ON public.stc_competition_summary FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can insert stc_competition_summary"
ON public.stc_competition_summary FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create storage bucket for STC attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('stc-attachments', 'stc-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stc-attachments bucket
CREATE POLICY "STC attachments publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'stc-attachments');

CREATE POLICY "Editors can upload STC attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stc-attachments' 
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role))
);

CREATE POLICY "Admins can delete STC attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'stc-attachments' AND has_role(auth.uid(), 'admin'::app_role));