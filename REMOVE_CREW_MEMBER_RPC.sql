-- Run this in your Supabase SQL Editor
-- Creates a secure RPC function to handle reciprocal crew member removal

CREATE OR REPLACE FUNCTION public.remove_crew_member(target_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to ensure reciprocal deletion
SET search_path = public
AS $$
DECLARE
    v_caller_id UUID;
BEGIN
    -- Get the authenticated user ID
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Delete reciprocal connections
    DELETE FROM public.crew_connections 
    WHERE (user_id = v_caller_id AND crew_member_id = target_user_id)
       OR (user_id = target_user_id AND crew_member_id = v_caller_id);

    -- 2. Delete any existing crew requests between the two users
    -- We delete instead of cancel so they can start fresh if they want
    DELETE FROM public.crew_requests
    WHERE (sender_id = v_caller_id AND receiver_id = target_user_id)
       OR (sender_id = target_user_id AND receiver_id = v_caller_id);

    RETURN jsonb_build_object('success', true, 'message', 'Successfully removed crew member');
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.remove_crew_member(UUID) TO authenticated;
