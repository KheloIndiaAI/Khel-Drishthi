-- Replace the has_role function with a more secure version
-- that only allows users to check their own role (unless they're admin)
-- Using CREATE OR REPLACE to avoid dependency issues

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_caller_admin boolean;
BEGIN
  -- Allow checking own role
  IF _user_id = auth.uid() THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = _role
    );
  END IF;
  
  -- Check if caller is admin (for checking other users' roles)
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) INTO is_caller_admin;
  
  -- Only admins can check other users' roles
  IF is_caller_admin THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = _role
    );
  END IF;
  
  -- Non-admins cannot check other users' roles - return false instead of error
  -- This prevents enumeration while maintaining RLS policy compatibility
  RETURN false;
END;
$$;