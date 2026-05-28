-- Rec'd Club: Master Social & Security Fix Migration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/jhophllmyiucnsecgeky/sql/new)

-- =========================================================================
-- 1. HARDEN SECURITY & Row Level Security (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all social tables (just in case they aren't already)
ALTER TABLE public.crew_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean up any existing loose/duplicate policies to prevent collision
DROP POLICY IF EXISTS "Users can insert their own crew requests" ON public.crew_requests;
DROP POLICY IF EXISTS "Users can update their own crew requests" ON public.crew_requests;
DROP POLICY IF EXISTS "Users can delete their own crew requests" ON public.crew_requests;
DROP POLICY IF EXISTS "Users can create their own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can update their own invites" ON public.invites;
DROP POLICY IF EXISTS "Users can delete their own crew connections" ON public.crew_connections;

-- A. Crew Requests Policies
-- Allows users to send requests under their own ID
CREATE POLICY "Users can insert their own crew requests" ON public.crew_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Allows both sender and receiver to update request status (accept, reject, cancel)
CREATE POLICY "Users can update their own crew requests" ON public.crew_requests
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Allows sender to delete/cancel their pending requests
CREATE POLICY "Users can delete their own crew requests" ON public.crew_requests
    FOR DELETE USING (auth.uid() = sender_id);

-- B. Crew Connections Policies
-- Allows reciprocal deletions when a crew member is removed by either user
CREATE POLICY "Users can delete their own crew connections" ON public.crew_connections
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = crew_member_id);

-- C. Invites Policies
-- Allows authenticated users to generate invites under their own ID
CREATE POLICY "Users can create their own invites" ON public.invites
    FOR INSERT WITH CHECK (auth.uid() = invited_by);

-- Allows users to expire or delete their own invites
CREATE POLICY "Users can update their own invites" ON public.invites
    FOR UPDATE USING (auth.uid() = invited_by);


-- =========================================================================
-- 2. TRANSACTIONAL PL/pgSQL SECURE RPC FUNCTIONS
-- =========================================================================

-- A. REDEFINE: accept_crew_invite
CREATE OR REPLACE FUNCTION public.accept_crew_invite(invite_code_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inviter_id UUID;
    v_invite_id UUID;
    v_caller_id UUID;
    v_caller_name TEXT;
BEGIN
    -- Get authenticated caller ID
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch active invite
    SELECT id, invited_by INTO v_invite_id, v_inviter_id
    FROM public.invites
    WHERE invite_code = invite_code_input AND status = 'active';

    -- Validate invite existence
    IF v_invite_id IS NULL THEN
        RAISE EXCEPTION 'Invite not found';
    END IF;

    -- Check if accepting own invite
    IF v_inviter_id = v_caller_id THEN
        RAISE EXCEPTION 'Cannot accept own invite';
    END IF;

    -- Check if already connected in crew_connections
    IF EXISTS (
        SELECT 1 FROM public.crew_connections
        WHERE user_id = v_caller_id AND crew_member_id = v_inviter_id
    ) THEN
        RETURN jsonb_build_object('success', true, 'already_connected', true, 'message', 'You are already in each other''s crew.');
    END IF;

    -- Insert/Update crew request (atomic state transition)
    INSERT INTO public.crew_requests (sender_id, receiver_id, status, message)
    VALUES (v_inviter_id, v_caller_id, 'accepted', 'Connected via invite link')
    ON CONFLICT (sender_id, receiver_id)
    DO UPDATE SET status = 'accepted', updated_at = now();

    -- Insert the two reciprocal rows in crew_connections
    INSERT INTO public.crew_connections (user_id, crew_member_id, status)
    VALUES 
        (v_caller_id, v_inviter_id, 'accepted'),
        (v_inviter_id, v_caller_id, 'accepted')
    ON CONFLICT (user_id, crew_member_id) DO NOTHING;

    -- Fetch display names for notifications
    SELECT COALESCE(display_name, username, 'A friend') INTO v_caller_name
    FROM public.profiles WHERE id = v_caller_id;

    -- Insert Notification for the Inviter
    INSERT INTO public.notifications (user_id, actor_id, type, title, body)
    VALUES (
        v_inviter_id, 
        v_caller_id, 
        'crew_accept', 
        'Joined your Crew', 
        v_caller_name || ' joined your crew!'
    );

    RETURN jsonb_build_object('success', true, 'already_connected', false, 'message', 'You are now in each other''s crew.');
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_crew_invite(TEXT) TO authenticated;


-- B. REDEFINE: accept_crew_request
CREATE OR REPLACE FUNCTION public.accept_crew_request(request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sender_id UUID;
    v_receiver_id UUID;
    v_caller_id UUID;
    v_caller_name TEXT;
BEGIN
    -- Get authenticated caller ID
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Fetch the request details
    SELECT sender_id, receiver_id INTO v_sender_id, v_receiver_id
    FROM public.crew_requests
    WHERE id = request_id;

    -- Check if request exists
    IF v_sender_id IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    -- Verify that caller is the receiver of the request
    IF v_receiver_id <> v_caller_id THEN
        RAISE EXCEPTION 'Not authorized to accept this request';
    END IF;

    -- Check if already connected
    IF EXISTS (
        SELECT 1 FROM public.crew_connections
        WHERE user_id = v_caller_id AND crew_member_id = v_sender_id
    ) THEN
        -- If already connected, make sure request status is accepted
        UPDATE public.crew_requests
        SET status = 'accepted', updated_at = now()
        WHERE id = request_id;
        
        RETURN jsonb_build_object('success', true, 'already_connected', true, 'message', 'You are already in each other''s crew.');
    END IF;

    -- Update request status to accepted
    UPDATE public.crew_requests
    SET status = 'accepted', updated_at = now()
    WHERE id = request_id;

    -- Insert the two reciprocal rows in crew_connections
    INSERT INTO public.crew_connections (user_id, crew_member_id, status)
    VALUES 
        (v_caller_id, v_sender_id, 'accepted'),
        (v_sender_id, v_caller_id, 'accepted')
    ON CONFLICT (user_id, crew_member_id) DO NOTHING;

    -- Fetch display name of caller for notifications
    SELECT COALESCE(display_name, username, 'A friend') INTO v_caller_name
    FROM public.profiles WHERE id = v_caller_id;

    -- Insert Notification for the Sender
    INSERT INTO public.notifications (user_id, actor_id, type, title, body)
    VALUES (
        v_sender_id, 
        v_caller_id, 
        'crew_accept', 
        'Request Accepted', 
        v_caller_name || ' accepted your crew request!'
    );

    RETURN jsonb_build_object('success', true, 'already_connected', false, 'message', 'You are now in each other''s crew.');
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.accept_crew_request(UUID) TO authenticated;
