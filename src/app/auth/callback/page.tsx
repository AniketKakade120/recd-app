'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Logo from '@/components/Logo';

/**
 * Client-Side OAuth Callback
 *
 * This page receives the OAuth code from the server pass-through and exchanges
 * it for a session ENTIRELY IN THE BROWSER using the browser Supabase client.
 *
 * Why client-side?
 * - signInWithOAuth stored the PKCE code verifier in a browser cookie
 * - The browser client can read its own cookies directly
 * - The session is stored in browser-accessible cookies after exchange
 * - onAuthStateChange fires SIGNED_IN reliably in the same context
 *
 * This avoids the server→browser cookie propagation issue where session cookies
 * set by the server-side callback weren't being detected by the browser client.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    // Guard against StrictMode double-invocation
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const next = params.get('next');

        if (!code) {
          console.error('[Rec\'d Auth] No code found in /auth/callback URL');
          router.replace('/login?error=auth_callback_failed');
          return;
        }

        if (!supabase) {
          console.error('[Rec\'d Auth] Supabase not configured');
          router.replace('/login?error=supabase_not_configured');
          return;
        }

        console.log('[Rec\'d Auth] Exchanging OAuth code for session (browser-side)...');

        // Exchange the code for a session using the BROWSER client.
        // The PKCE code verifier (stored in a browser cookie by signInWithOAuth)
        // is automatically used by the browser client here.
        const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error || !session) {
          console.error('[Rec\'d Auth] Code exchange failed:', error?.message);
          router.replace('/login?error=auth_callback_failed');
          return;
        }

        console.log('[Rec\'d Auth] Session established. User:', session.user.email);

        // Check if the user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 = row not found (new user) — that's fine, send to onboarding
          console.warn('[Rec\'d Auth] Profile fetch error:', profileError.message);
        }

        if (profile?.onboarding_completed) {
          console.log('[Rec\'d Auth] User is onboarded. Redirecting to:', next || '/home');
          router.replace(next || '/home');
        } else {
          const dest = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding';
          console.log('[Rec\'d Auth] New user. Redirecting to:', dest);
          router.replace(dest);
        }
      } catch (err) {
        console.error('[Rec\'d Auth] Unexpected callback error:', err);
        router.replace('/login?error=auth_callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  // Show a branded loading state while the exchange is in progress
  return (
    <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-2 border-cinema-red border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,51,51,0.3)]" />
      <Logo variant="square" size="md" className="animate-pulse" />
      <p className="text-xs text-muted mt-4 uppercase tracking-widest">Verifying your taste...</p>
    </div>
  );
}
