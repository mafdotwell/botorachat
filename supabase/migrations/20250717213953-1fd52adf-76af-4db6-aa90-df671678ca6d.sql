-- Phase 2: Database schema changes for subscriptions and wishlists

-- First, let's add subscription-related fields to the bots table
ALTER TABLE public.bots 
ADD COLUMN subscription_duration INTEGER DEFAULT 30, -- days
ADD COLUMN billing_interval TEXT DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
ADD COLUMN subscription_price NUMERIC DEFAULT 0;

-- Update the purchases table to support subscriptions
ALTER TABLE public.purchases 
ADD COLUMN subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'pending')),
ADD COLUMN current_period_start TIMESTAMPTZ,
ADD COLUMN current_period_end TIMESTAMPTZ,
ADD COLUMN billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN auto_renew BOOLEAN DEFAULT true;

-- Create wishlists table for like functionality
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, bot_id)
);

-- Enable Row Level Security on wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist items" 
ON public.wishlists 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can add items to their wishlist" 
ON public.wishlists 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove items from their wishlist" 
ON public.wishlists 
FOR DELETE 
USING (user_id = auth.uid());

-- Add function to update bot like counts
CREATE OR REPLACE FUNCTION public.update_bot_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.bots 
    SET download_count = download_count + 1 
    WHERE id = NEW.bot_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.bots 
    SET download_count = GREATEST(download_count - 1, 0) 
    WHERE id = OLD.bot_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic like count updates
CREATE TRIGGER update_bot_like_count_trigger
  AFTER INSERT OR DELETE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bot_like_count();