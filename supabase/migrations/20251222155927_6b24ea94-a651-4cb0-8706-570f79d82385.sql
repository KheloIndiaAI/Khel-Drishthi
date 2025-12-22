-- Create a secure function to promote user to admin only if no admins exist
CREATE OR REPLACE FUNCTION public.setup_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Check if any admins already exist
  SELECT COUNT(*) INTO admin_count
  FROM public.user_roles
  WHERE role = 'admin';
  
  -- If admins exist, deny the request
  IF admin_count > 0 THEN
    RETURN false;
  END IF;
  
  -- Check if the user already has a role record
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    -- Update existing role to admin
    UPDATE public.user_roles
    SET role = 'admin'
    WHERE user_id = _user_id;
  ELSE
    -- Insert new admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin');
  END IF;
  
  RETURN true;
END;
$$;