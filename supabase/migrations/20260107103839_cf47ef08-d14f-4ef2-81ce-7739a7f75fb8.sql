-- Make the stc-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'stc-attachments';

-- Drop the public SELECT policy
DROP POLICY IF EXISTS "STC attachments publicly readable" ON storage.objects;

-- Create a restrictive SELECT policy for authorized users
CREATE POLICY "Authorized users can view STC attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'stc-attachments'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'editor'::app_role)
    OR has_role(auth.uid(), 'viewer'::app_role)
  )
);