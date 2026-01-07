-- Fix overly permissive RLS policy on form_submissions
-- The current policy allows any user to submit forms with WITH CHECK (true)
-- This should require authentication at minimum

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can submit forms" ON public.form_submissions;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can submit forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);