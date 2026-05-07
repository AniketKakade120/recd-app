'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);

  const handleDemo = () => {
    setLoading(true);
    setTimeout(() => { login(); router.push('/onboarding'); }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-ink relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-cinema-red/7 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <Link href="/"><span className="text-4xl font-bold text-bone font-editorial tracking-tight">Rec<span className="text-cinema-red">&apos;</span>d</span></Link>
          <h1 className="text-xl font-bold text-bone mt-4 mb-1">Put your taste on the line.</h1>
          <p className="text-sm text-muted">Create an account. Build your taste profile. Get judged.</p>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-6 space-y-3">
          <button disabled={loading} onClick={handleDemo}
            className="w-full py-3 bg-bone text-ink font-semibold rounded-xl flex items-center justify-center gap-2.5 hover:bg-bone/90 transition-colors btn-press disabled:opacity-60 text-sm">
            {loading ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> :
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
            Continue with Google
          </button>

          <button disabled className="w-full py-3 bg-surface-hover border border-border text-bone/50 rounded-xl text-sm cursor-not-allowed">
            Continue with email
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-border" />
            <span className="mx-4 text-xs text-muted uppercase tracking-widest">or try</span>
            <div className="flex-grow border-t border-border" />
          </div>

          <button disabled={loading} onClick={handleDemo}
            className="w-full py-3 bg-cinema-red/10 border border-cinema-red/25 text-cinema-red font-semibold rounded-xl hover:bg-cinema-red/20 transition-colors btn-press text-sm">
            Enter demo mode
          </button>
        </div>

        <p className="text-center text-xs text-muted mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-cinema-red hover:text-cinema-red/80">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
