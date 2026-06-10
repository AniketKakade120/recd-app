-- Function to securely get a user's email for notifications
-- Runs as security definer so it can access auth.users

CREATE OR REPLACE FUNCTION get_user_email(uid uuid)
RETURNS text AS $$
DECLARE
  user_email text;
BEGIN
  -- Only allow authenticated users to call this function to prevent abuse
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email INTO user_email FROM auth.users WHERE id = uid;
  
  RETURN user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
