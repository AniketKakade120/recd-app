'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { UserCheck, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';

export default function InviteAcceptancePage() {
  const { code } = useParams();
  const router = useRouter();
  const { currentUser, isAuthenticated, acceptInvite, loading, getUser } = useApp();
  const [inviteData, setInviteData] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invite details (publicly safe if RLS allows)
  useEffect(() => {
    async function fetchInvite() {
      if (!code) return;
      // We can fetch invite details via a safe query or context
      // For now, let's assume acceptInvite will handle validation
    }
    fetchInvite();
  }, [code]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      // Redirect to login but save this URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?redirectTo=${returnUrl}`);
      return;
    }

    setIsJoining(true);
    const success = await acceptInvite(code as string);
    if (success) {
      router.push('/profile?tab=crew');
    } else {
      setError('Failed to join crew. The link might be expired or invalid.');
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="text-cinema-red animate-spin mb-4" size={32} />
        <p className="text-muted text-sm font-medium">Verifying invitation...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6">
      {/* Background Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cinema-red/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl p-8 shadow-2xl overflow-hidden">
        
        {/* Header Decor */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cinema-red to-transparent opacity-50" />

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cinema-red/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cinema-red shadow-lg shadow-cinema-red/10">
            <UserCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-bone mb-2 font-editorial tracking-tight">You&apos;re invited.</h1>
          <p className="text-muted text-sm">A friend wants you in their crew on Rec&apos;d.</p>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 text-center">
            <p className="text-red-400 text-xs font-bold leading-relaxed">{error}</p>
            <Link href="/home" className="inline-block mt-4 text-[10px] uppercase tracking-widest text-muted hover:text-bone font-bold transition-colors">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-ink/40 border border-border rounded-2xl p-6 text-center">
              <p className="text-sm text-bone/90 mb-4 font-medium">Ready to share recommendations?</p>
              <div className="flex items-center justify-center -space-x-3 mb-1">
                 <div className="w-12 h-12 rounded-full border-2 border-surface bg-warm-grey animate-pulse" />
                 <div className="w-12 h-12 rounded-full border-2 border-surface bg-cinema-red/20 flex items-center justify-center text-cinema-red">
                    <ShieldCheck size={20} />
                 </div>
              </div>
              <p className="text-[10px] text-muted uppercase tracking-widest font-bold mt-4">Verified Invite Link</p>
            </div>

            <button 
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full h-14 bg-cinema-red text-bone font-bold rounded-2xl hover:bg-cinema-red/90 transition-all active:scale-[0.98] shadow-xl shadow-cinema-red/20 flex items-center justify-center gap-3 group"
            >
              {isJoining ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Joining Crew...</span>
                </>
              ) : (
                <>
                  <span>{isAuthenticated ? 'Accept & Join Crew' : 'Continue with Google'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-muted leading-relaxed">
              By joining, you&apos;ll be able to see each other&apos;s recommendations and taste scores.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
         <p className="text-[10px] text-muted uppercase tracking-widest font-bold mb-2">New to Rec&apos;d?</p>
         <p className="text-xs text-muted/60 max-w-[240px] mx-auto">The social platform for people who actually care about movies.</p>
      </div>
    </div>
  );
}
