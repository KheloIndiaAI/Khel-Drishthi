-- 1. Create user_centre_assignments table
CREATE TABLE public.user_centre_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  centre_id TEXT NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, centre_id)
);

ALTER TABLE public.user_centre_assignments ENABLE ROW LEVEL SECURITY;

-- 2. Create user_region_assignments table
CREATE TABLE public.user_region_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  region_id UUID NOT NULL REFERENCES regional_centres(id),
  access_level TEXT DEFAULT 'view_edit_approve' CHECK (access_level IN ('view', 'view_edit', 'view_edit_approve')),
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, region_id)
);

ALTER TABLE public.user_region_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Add assignment request columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS requested_centre_id TEXT,
  ADD COLUMN IF NOT EXISTS requested_region_id UUID REFERENCES regional_centres(id),
  ADD COLUMN IF NOT EXISTS assignment_type TEXT CHECK (assignment_type IS NULL OR assignment_type IN ('centre_incharge', 'regional_officer'));

-- 4. Create function to check if user can edit a specific centre
CREATE OR REPLACE FUNCTION public.can_edit_centre(_user_id UUID, _centre_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Admins can edit all
    has_role(_user_id, 'admin'::app_role)
    OR
    -- Direct centre assignment
    EXISTS (
      SELECT 1 FROM public.user_centre_assignments
      WHERE user_id = _user_id AND centre_id = _centre_id AND is_active = true
    )
    OR
    -- Regional officer with edit access to the centre's region
    EXISTS (
      SELECT 1 FROM public.user_region_assignments ura
      JOIN public.stc_capacity sc ON sc.centre_id = _centre_id
      JOIN public.regional_centres rc ON rc.id = ura.region_id
      WHERE ura.user_id = _user_id 
        AND ura.is_active = true
        AND (sc.region = rc.display_name OR sc.region = rc.name)
        AND ura.access_level IN ('view_edit', 'view_edit_approve')
    )
$$;

-- 5. Create function to check if user can view a specific centre
CREATE OR REPLACE FUNCTION public.can_view_centre(_user_id UUID, _centre_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- Anyone with edit access can also view
    can_edit_centre(_user_id, _centre_id)
    OR
    -- Regional officer with view-only access
    EXISTS (
      SELECT 1 FROM public.user_region_assignments ura
      JOIN public.stc_capacity sc ON sc.centre_id = _centre_id
      JOIN public.regional_centres rc ON rc.id = ura.region_id
      WHERE ura.user_id = _user_id 
        AND ura.is_active = true
        AND (sc.region = rc.display_name OR sc.region = rc.name)
    )
$$;

-- 6. Create function to get user's accessible centre IDs
CREATE OR REPLACE FUNCTION public.get_user_accessible_centres(_user_id UUID)
RETURNS TABLE(centre_id TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- If admin, return all centres
  SELECT DISTINCT sc.centre_id FROM public.stc_capacity sc
  WHERE has_role(_user_id, 'admin'::app_role)
  
  UNION
  
  -- Direct centre assignments
  SELECT uca.centre_id FROM public.user_centre_assignments uca
  WHERE uca.user_id = _user_id AND uca.is_active = true
  
  UNION
  
  -- Regional assignments - all centres in assigned regions
  SELECT sc.centre_id 
  FROM public.user_region_assignments ura
  JOIN public.regional_centres rc ON rc.id = ura.region_id
  JOIN public.stc_capacity sc ON (sc.region = rc.display_name OR sc.region = rc.name)
  WHERE ura.user_id = _user_id AND ura.is_active = true
$$;

-- 7. RLS Policies for user_centre_assignments
CREATE POLICY "Admins manage centre assignments"
  ON public.user_centre_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own centre assignments"
  ON public.user_centre_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- 8. RLS Policies for user_region_assignments
CREATE POLICY "Admins manage region assignments"
  ON public.user_region_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view own region assignments"
  ON public.user_region_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- 9. Update handle_new_user trigger to store assignment preferences
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, name, 
    assignment_type, requested_centre_id, requested_region_id
  )
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'assignment_type',
    new.raw_user_meta_data ->> 'requested_centre_id',
    CASE 
      WHEN new.raw_user_meta_data ->> 'requested_region_id' IS NOT NULL 
        AND new.raw_user_meta_data ->> 'requested_region_id' != ''
      THEN (new.raw_user_meta_data ->> 'requested_region_id')::uuid 
      ELSE NULL 
    END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'viewer');
  RETURN new;
END;
$$;