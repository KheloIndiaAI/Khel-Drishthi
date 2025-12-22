-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for form definitions
CREATE TABLE public.form_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table for form submissions
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.form_definitions(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS for form_definitions
CREATE POLICY "Admins manage form definitions"
ON public.form_definitions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Form definitions publicly readable"
ON public.form_definitions
FOR SELECT
USING (is_active = true);

-- RLS for form_submissions
CREATE POLICY "Admins view all submissions"
ON public.form_submissions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own submissions"
ON public.form_submissions
FOR SELECT
USING (submitted_by = auth.uid());

-- Update trigger for form_definitions
CREATE TRIGGER update_form_definitions_updated_at
BEFORE UPDATE ON public.form_definitions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();