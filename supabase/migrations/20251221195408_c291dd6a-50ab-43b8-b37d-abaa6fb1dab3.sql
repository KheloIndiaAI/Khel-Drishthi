-- Fix user_roles RLS policy to prevent public access to role information
-- Drop the overly permissive policy that allows anyone to read all roles
DROP POLICY IF EXISTS "User roles viewable" ON user_roles;

-- Create policy allowing users to view only their own roles
CREATE POLICY "Users can view own roles" 
ON user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create policy allowing admins to view all roles (using existing has_role function)
CREATE POLICY "Admins can view all roles" 
ON user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));