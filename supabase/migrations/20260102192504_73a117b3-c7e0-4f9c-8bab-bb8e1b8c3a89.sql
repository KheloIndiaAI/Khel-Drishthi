-- Regional centres master list
CREATE TABLE IF NOT EXISTS public.regional_centres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- State/UT -> Regional centre mapping (single source of truth)
CREATE TABLE IF NOT EXISTS public.region_state_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_name TEXT NOT NULL UNIQUE,
  region_id UUID NOT NULL REFERENCES public.regional_centres(id) ON DELETE RESTRICT,
  updated_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_regional_centres_updated_at ON public.regional_centres;
CREATE TRIGGER update_regional_centres_updated_at
BEFORE UPDATE ON public.regional_centres
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_region_state_mappings_updated_at ON public.region_state_mappings;
CREATE TRIGGER update_region_state_mappings_updated_at
BEFORE UPDATE ON public.region_state_mappings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.regional_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_state_mappings ENABLE ROW LEVEL SECURITY;

-- Policies: public read, admin write
DROP POLICY IF EXISTS "Regional centres publicly readable" ON public.regional_centres;
CREATE POLICY "Regional centres publicly readable"
ON public.regional_centres
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage regional centres" ON public.regional_centres;
CREATE POLICY "Admins manage regional centres"
ON public.regional_centres
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Region-state mappings publicly readable" ON public.region_state_mappings;
CREATE POLICY "Region-state mappings publicly readable"
ON public.region_state_mappings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins manage region-state mappings" ON public.region_state_mappings;
CREATE POLICY "Admins manage region-state mappings"
ON public.region_state_mappings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed regional centres (names used by the UI)
INSERT INTO public.regional_centres (name, display_name, sort_order)
VALUES
  ('RC Bangalore', 'Bangalore', 10),
  ('RC Bhopal', 'Bhopal', 20),
  ('RC Gandhinagar', 'Gandhinagar', 30),
  ('RC Guwahati', 'Guwahati', 40),
  ('RC Imphal', 'Imphal', 50),
  ('RC Kolkata', 'Kolkata', 60),
  ('RC LNCPE', 'LNCPE', 70),
  ('RC Lucknow', 'Lucknow', 80),
  ('RC Mumbai', 'Mumbai', 90),
  ('RC NIS Patiala', 'NIS Patiala', 100),
  ('RC New Delhi', 'New Delhi', 110),
  ('RC Zirakpur', 'Zirakpur', 120)
ON CONFLICT (name) DO NOTHING;

-- Seed State/UT mappings based on current dataset and your rules:
-- DNH & DD -> RC Mumbai
-- Chandigarh -> RC Zirakpur
WITH rc AS (
  SELECT id, name FROM public.regional_centres
)
INSERT INTO public.region_state_mappings (state_name, region_id)
VALUES
  ('Andaman & Nicobar', (SELECT id FROM rc WHERE name = 'RC New Delhi')),
  ('Andhra Pradesh', (SELECT id FROM rc WHERE name = 'RC Bangalore')),
  ('Arunachal Pradesh', (SELECT id FROM rc WHERE name = 'RC Guwahati')),
  ('Assam', (SELECT id FROM rc WHERE name = 'RC Guwahati')),
  ('Bihar', (SELECT id FROM rc WHERE name = 'RC Kolkata')),
  ('Chandigarh', (SELECT id FROM rc WHERE name = 'RC Zirakpur')),
  ('Chhattisgarh', (SELECT id FROM rc WHERE name = 'RC Bhopal')),
  ('Delhi', (SELECT id FROM rc WHERE name = 'RC New Delhi')),
  ('DNH & DD', (SELECT id FROM rc WHERE name = 'RC Mumbai')),
  ('Goa', (SELECT id FROM rc WHERE name = 'RC Gandhinagar')),
  ('Gujarat', (SELECT id FROM rc WHERE name = 'RC Gandhinagar')),
  ('Haryana', (SELECT id FROM rc WHERE name = 'RC Zirakpur')),
  ('Himachal Pradesh', (SELECT id FROM rc WHERE name = 'RC Zirakpur')),
  ('Jammu & Kashmir', (SELECT id FROM rc WHERE name = 'RC NIS Patiala')),
  ('Jharkhand', (SELECT id FROM rc WHERE name = 'RC Kolkata')),
  ('Karnataka', (SELECT id FROM rc WHERE name = 'RC Bangalore')),
  ('Kerala', (SELECT id FROM rc WHERE name = 'RC LNCPE')),
  ('Ladakh', (SELECT id FROM rc WHERE name = 'RC NIS Patiala')),
  ('Lakshadweep', (SELECT id FROM rc WHERE name = 'RC LNCPE')),
  ('Madhya Pradesh', (SELECT id FROM rc WHERE name = 'RC Bhopal')),
  ('Maharashtra', (SELECT id FROM rc WHERE name = 'RC Mumbai')),
  ('Manipur', (SELECT id FROM rc WHERE name = 'RC Imphal')),
  ('Meghalaya', (SELECT id FROM rc WHERE name = 'RC Guwahati')),
  ('Mizoram', (SELECT id FROM rc WHERE name = 'RC Imphal')),
  ('Nagaland', (SELECT id FROM rc WHERE name = 'RC Guwahati')),
  ('Odisha', (SELECT id FROM rc WHERE name = 'RC Kolkata')),
  ('Puducherry', (SELECT id FROM rc WHERE name = 'RC LNCPE')),
  ('Punjab', (SELECT id FROM rc WHERE name = 'RC Zirakpur')),
  ('Rajasthan', (SELECT id FROM rc WHERE name = 'RC Gandhinagar')),
  ('Sikkim', (SELECT id FROM rc WHERE name = 'RC Guwahati')),
  ('Tamil Nadu', (SELECT id FROM rc WHERE name = 'RC LNCPE')),
  ('Telangana', (SELECT id FROM rc WHERE name = 'RC Bangalore')),
  ('Tripura', (SELECT id FROM rc WHERE name = 'RC Imphal')),
  ('Uttar Pradesh', (SELECT id FROM rc WHERE name = 'RC Lucknow')),
  ('Uttarakhand', (SELECT id FROM rc WHERE name = 'RC Lucknow')),
  ('West Bengal', (SELECT id FROM rc WHERE name = 'RC Kolkata'))
ON CONFLICT (state_name) DO NOTHING;