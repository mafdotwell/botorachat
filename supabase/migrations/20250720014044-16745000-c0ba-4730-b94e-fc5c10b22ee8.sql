
-- Create waitlist table for creators who want to showcase in the future marketplace
CREATE TABLE public.creator_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  creator_type TEXT NOT NULL,
  showcase_items TEXT[] NOT NULL DEFAULT '{}',
  message TEXT,
  contact_preferences JSONB DEFAULT '{"email_updates": true, "launch_notifications": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Add Row Level Security
ALTER TABLE public.creator_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist
CREATE POLICY "Anyone can join waitlist"
  ON public.creator_waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view waitlist entries
CREATE POLICY "Admins can view waitlist"
  ON public.creator_waitlist
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update waitlist status
CREATE POLICY "Admins can update waitlist"
  ON public.creator_waitlist
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));
