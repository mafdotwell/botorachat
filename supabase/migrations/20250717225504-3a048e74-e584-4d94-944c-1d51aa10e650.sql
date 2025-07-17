-- Update profiles table to include avatar_url if not already present
-- and create username auto-generation function

-- Create function to generate unique username
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_email text)
RETURNS text
LANGUAGE plpgsql
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

-- Update the handle_new_user function to auto-generate username
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