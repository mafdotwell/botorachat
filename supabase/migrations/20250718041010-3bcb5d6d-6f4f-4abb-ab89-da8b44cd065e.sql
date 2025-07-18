-- Drop the existing admin_analytics view
DROP VIEW IF EXISTS public.admin_analytics;

-- Recreate the admin_analytics view without SECURITY DEFINER
CREATE VIEW public.admin_analytics AS
SELECT 
    DATE(ba.created_at) as date,
    jsonb_agg(DISTINCT ba.interaction_type) as interaction_types,
    COUNT(DISTINCT ba.bot_id) as bots_used,
    COUNT(DISTINCT ba.user_id) as unique_users,
    COUNT(*) as total_interactions
FROM public.bot_analytics ba
GROUP BY DATE(ba.created_at)
ORDER BY DATE(ba.created_at) DESC;

-- Enable RLS on the view
ALTER VIEW public.admin_analytics SET (security_barrier = true);

-- Create RLS policy to ensure only admins can access analytics
CREATE POLICY "Only admins can view analytics" 
ON public.admin_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));