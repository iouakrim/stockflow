-- Add username support to profiles table and a lookup function for login

-- 1. Add username column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Create function to lookup email by username
-- SECURITY DEFINER allows this to run as the owner (postgres), 
-- bypassing RLS for login purposes
CREATE OR REPLACE FUNCTION get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email FROM profiles WHERE username = p_username;
  RETURN v_email;
END;
$$;
