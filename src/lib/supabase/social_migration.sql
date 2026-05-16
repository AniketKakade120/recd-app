-- 1. Create Crew Requests Table
CREATE TABLE IF NOT EXISTS public.crew_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);

-- 2. Create Crew Connections Table (Reciprocal handshakes)
CREATE TABLE IF NOT EXISTS public.crew_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    crew_member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'accepted' CHECK (status = 'accepted'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, crew_member_id)
);

-- 3. Create Invites Table
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_type TEXT DEFAULT 'crew' CHECK (invite_type IN ('crew', 'group')),
    invited_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE NOT NULL,
    invite_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- 4. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT,
    body TEXT,
    resource_id UUID,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE public.crew_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Crew Requests: Users can see requests they sent or received
CREATE POLICY "Users can view their own crew requests" ON public.crew_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Crew Connections: Users can see their own connections
CREATE POLICY "Users can view their own crew connections" ON public.crew_connections
    FOR SELECT USING (auth.uid() = user_id);

-- Invites: Publicly readable for acceptance flow
CREATE POLICY "Invites are publicly readable" ON public.invites
    FOR SELECT USING (true);

-- Notifications: Users can see and update their own notifications
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- 7. Functions for updated_at (Optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_crew_requests_updated_at
BEFORE UPDATE ON public.crew_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_crew_connections_updated_at
BEFORE UPDATE ON public.crew_connections
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
