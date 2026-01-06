-- Create access_requests table for pending approval workflow
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role app_role NOT NULL DEFAULT 'editor',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  UNIQUE (user_id, status) -- Prevent duplicate pending requests
);

-- Enable RLS
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own requests (only one pending at a time enforced by unique constraint)
CREATE POLICY "Users can create their own access requests"
ON public.access_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Admins can view all access requests
CREATE POLICY "Admins can view all access requests"
ON public.access_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update access requests (approve/reject)
CREATE POLICY "Admins can update access requests"
ON public.access_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create index for faster queries
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_requests_user_id ON public.access_requests(user_id);