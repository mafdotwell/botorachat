-- Fix security issues and assign admin role

-- 1. Fix Security Definer View - recreate admin_analytics as regular view
DROP VIEW IF EXISTS public.admin_analytics;
CREATE VIEW public.admin_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT bot_id) as bots_used,
  jsonb_agg(DISTINCT interaction_type) as interaction_types
FROM public.bot_analytics
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 2. Fix function search paths for security
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_username(base_email text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    base_username text;
    final_username text;
    counter int := 0;
    username_exists boolean;
BEGIN
    -- Extract username from email (part before @)
    base_username := split_part(base_email, '@', 1);
    
    -- Clean username: remove special characters, convert to lowercase
    base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
    
    -- Ensure minimum length
    IF length(base_username) < 3 THEN
        base_username := 'user' || base_username;
    END IF;
    
    -- Start with base username
    final_username := base_username;
    
    -- Check if username exists and increment if needed
    LOOP
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = final_username) INTO username_exists;
        
        IF NOT username_exists THEN
            EXIT;
        END IF;
        
        counter := counter + 1;
        final_username := base_username || counter::text;
    END LOOP;
    
    RETURN final_username;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    generated_username text;
BEGIN
    -- Generate unique username
    generated_username := public.generate_unique_username(NEW.email);
    
    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'full_name',
        generated_username
    );
    RETURN NEW;
END;
$$;

-- 3. Assign admin role to existing user (michael@mail.com)
-- First get the user ID, then assign admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get user ID for michael@mail.com from profiles table
    SELECT id INTO admin_user_id FROM public.profiles WHERE email = 'michael@mail.com' LIMIT 1;
    
    -- If user exists, assign admin role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;