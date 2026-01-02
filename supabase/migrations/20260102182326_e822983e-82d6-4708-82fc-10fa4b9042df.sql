
-- Create table to store editor-specific table permissions
CREATE TABLE public.user_table_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    table_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    UNIQUE (user_id, table_name)
);

-- Enable RLS
ALTER TABLE public.user_table_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage permissions
CREATE POLICY "Admins manage table permissions"
ON public.user_table_permissions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own permissions
CREATE POLICY "Users view own permissions"
ON public.user_table_permissions
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to check if user can edit a specific table
CREATE OR REPLACE FUNCTION public.can_edit_table(_user_id uuid, _table_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    has_role(_user_id, 'admin'::app_role) 
    OR (
      has_role(_user_id, 'editor'::app_role) 
      AND EXISTS (
        SELECT 1 FROM public.user_table_permissions
        WHERE user_id = _user_id AND table_name = _table_name
      )
    )
$$;

-- Update RLS policies for all editable tables to allow editors with permissions

-- Sports table
CREATE POLICY "Editors with permission can update sports"
ON public.sports
FOR UPDATE
USING (can_edit_table(auth.uid(), 'sports'));

-- Centres table
CREATE POLICY "Editors with permission can update centres"
ON public.centres
FOR UPDATE
USING (can_edit_table(auth.uid(), 'centres'));

-- Events table
CREATE POLICY "Editors with permission can update events"
ON public.events
FOR UPDATE
USING (can_edit_table(auth.uid(), 'events'));

-- Disciplines table
CREATE POLICY "Editors with permission can update disciplines"
ON public.disciplines
FOR UPDATE
USING (can_edit_table(auth.uid(), 'disciplines'));

-- NCOE capacity table
CREATE POLICY "Editors with permission can update ncoe_capacity"
ON public.ncoe_capacity
FOR UPDATE
USING (can_edit_table(auth.uid(), 'ncoe_capacity'));

-- STC capacity table
CREATE POLICY "Editors with permission can update stc_capacity"
ON public.stc_capacity
FOR UPDATE
USING (can_edit_table(auth.uid(), 'stc_capacity'));

-- Olympic medals table
CREATE POLICY "Editors with permission can update olympic_medals"
ON public.olympic_medals
FOR UPDATE
USING (can_edit_table(auth.uid(), 'olympic_medals'));

-- Olympic participation table
CREATE POLICY "Editors with permission can update olympic_participation"
ON public.olympic_participation
FOR UPDATE
USING (can_edit_table(auth.uid(), 'olympic_participation'));

-- Centre sport links table
CREATE POLICY "Editors with permission can update centre_sport_links"
ON public.centre_sport_links
FOR UPDATE
USING (can_edit_table(auth.uid(), 'centre_sport_links'));

-- Eco categories table
CREATE POLICY "Editors with permission can update eco_categories"
ON public.eco_categories
FOR UPDATE
USING (can_edit_table(auth.uid(), 'eco_categories'));

-- Event overlap table
CREATE POLICY "Editors with permission can update event_overlap"
ON public.event_overlap
FOR UPDATE
USING (can_edit_table(auth.uid(), 'event_overlap'));

-- Olympic timeline table
CREATE POLICY "Editors with permission can update olympic_timeline"
ON public.olympic_timeline
FOR UPDATE
USING (can_edit_table(auth.uid(), 'olympic_timeline'));
