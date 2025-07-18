-- Drop the existing admin_analytics view with SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_analytics;

-- Recreate the admin_analytics view without SECURITY DEFINER
-- This will now respect the RLS policies of the underlying tables
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