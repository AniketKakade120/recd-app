'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

/**
 * Client-Side OAuth Callback — DEPRECATED SAFETY REDIRECT
 *
 * This page previously exchanged the OAuth code client-side.
 * It is now a backward-compatibility redirect that forwards any
 * stale links to the canonical server-side callback route.
 *
 * If someone lands here with a code param (e.g. from a bookmark or
 * stale redirect), we send them to /api/auth/callback which handles
 * the actual exchange. If there's no code, we send them to /login.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const next = params.get('next');

    if (code) {
      // Forward to the server-side callback with the same params
      const redirectUrl = new URL('/api/auth/callback', window.location.origin);
      redirectUrl.searchParams.set('code', code);
      if (next) redirectUrl.searchParams.set('next', next);
      
      console.log('[Rec\'d Auth] /auth/callback is deprecated. Redirecting to server callback...');
      window.location.href = redirectUrl.toString();
    } else {
      // No code — nothing to exchange, go to login
      console.log('[Rec\'d Auth] /auth/callback hit without code. Redirecting to /login...');
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-2 border-cinema-red border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,51,51,0.3)]" />
      <Logo variant="square" size="md" className="animate-pulse" />
      <p className="text-xs text-muted mt-4 uppercase tracking-widest">Redirecting...</p>
    </div>
  );
}
