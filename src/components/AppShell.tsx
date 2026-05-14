'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { useState, useEffect } from 'react';
import InviteModal from './InviteModal';
import RecommendModal from './RecommendModal';
import GiveVerdictModal from './GiveVerdictModal';
import ToastOverlay from './ToastOverlay';

const navItems = [
  { name: 'Home', path: '/home', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { name: 'Explore', path: '/explore', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
  { name: 'Groups', path: '/groups', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { name: 'Watchlist', path: '/watchlist', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, currentUser, loading, openRecommendModal, isOnboarded, logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isPublicRoute = ['/', '/login', '/signup', '/onboarding'].includes(pathname) || pathname.startsWith('/list/');
    
    if (!loading) {
      console.log(`[Rec'd Shell] Path: ${pathname}, Auth: ${isAuthenticated}, Onboarded: ${isOnboarded}`);
      
      // 1. If not authenticated and not on a public route, send to landing
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/');
        return;
      }
      
      // 2. If authenticated but NOT onboarded, and not already on onboarding, send to onboarding
      //    BUT only if we are NOT currently on /home (to avoid fighting with completeOnboarding's router.push)
      if (isAuthenticated && !isOnboarded && pathname !== '/onboarding' && !pathname.startsWith('/list/')) {
        console.log('[Rec\'d Shell] Redirecting to onboarding...');
        router.push('/onboarding');
        return;
      }

      // 3. If authenticated AND onboarded, and on a landing/login/onboarding page, send to home
      if (isAuthenticated && isOnboarded && ['/', '/login', '/signup', '/onboarding'].includes(pathname)) {
        console.log('[Rec\'d Shell] Redirecting to home...');
        router.push('/home');
      }
    }
  }, [loading, isAuthenticated, isOnboarded, pathname, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-2 border-cinema-red border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(234,51,51,0.3)]" />
        <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight animate-pulse">
          Rec<span className="text-cinema-red">&apos;</span>d
        </h2>
        <p className="text-xs text-muted mt-4 uppercase tracking-widest">Stamping your taste...</p>
      </div>
    );
  }

  const noShell = !isAuthenticated || ['/', '/login', '/signup', '/onboarding'].includes(pathname) || pathname.startsWith('/list/');
  if (noShell) {
    return <main className="min-h-screen flex flex-col">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Desktop Top Nav */}
      <header className="hidden md:flex flex-col border-b border-border bg-ink/95 backdrop-blur-xl sticky top-0 z-40 px-6 pt-3 pb-0">
        {/* Logo Centered on Top */}
        <div className="flex justify-center mb-1">
          <Link href="/home" className="flex items-center gap-1.5 shrink-0">
            <span className="text-2xl font-bold text-bone font-editorial tracking-tight">
              Rec<span className="text-cinema-red">&apos;</span>d
            </span>
          </Link>
        </div>

        {/* Navigation Centered, Actions on Right */}
        <div className="flex items-center justify-center relative w-full h-12">
          {/* Centered Tabs */}
          <nav className="flex items-center gap-8 h-full">
            {navItems.map(item => {
              const isActive = pathname.startsWith(item.path);
              return (
                <Link key={item.path} href={item.path}
                  className={`relative flex items-center h-full text-sm font-medium transition-colors btn-press ${
                    isActive ? 'text-bone' : 'text-muted hover:text-bone'
                  }`}>
                  {item.name}
                  {/* Selected Indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-cinema-red rounded-t-full shadow-[0_-2px_10px_rgba(234,51,51,0.5)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions - Absolute positioned to keep nav centered */}
          <div className="absolute right-0 flex items-center gap-3">
            <button onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-bone hover:bg-surface/50 transition-colors btn-press">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Invite
            </button>
            
            <button onClick={() => openRecommendModal()}
              className="px-4 py-1.5 rounded-lg font-semibold text-xs bg-cinema-red text-bone hover:bg-cinema-red/90 transition-colors btn-press">
              + Recommend
            </button>

            <button onClick={() => setShowLogoutConfirm(true)}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-cinema-red transition-colors btn-press">
              Logout
            </button>

            <Link href="/profile" className="ml-1 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden hover:border-border-strong transition-colors btn-press">
               {currentUser?.displayName.charAt(0) || 'U'}
            </Link>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative w-full max-w-sm bg-surface border border-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-16 h-16 bg-cinema-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" width="24" height="24" className="text-cinema-red"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
              </div>
              <h3 className="text-xl font-bold text-bone mb-2">Ready to head out?</h3>
              <p className="text-muted text-sm mb-8">You&apos;ll need to sign back in to recommend or stamp your crew&apos;s taste.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 bg-surface-hover border border-border text-bone font-semibold rounded-xl hover:bg-surface transition-colors btn-press"
                >
                  Stay
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                    router.push('/');
                  }}
                  className="flex-1 py-3 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-colors shadow-lg shadow-cinema-red/20 btn-press"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Nav (Logo only) */}
      <header className="md:hidden flex items-center justify-center border-b border-border bg-ink/95 backdrop-blur-xl sticky top-0 z-40 py-3.5">
        <Link href="/home" className="flex items-center gap-1.5 shrink-0">
          <span className="text-xl font-bold text-bone font-editorial tracking-tight">
            Rec<span className="text-cinema-red">&apos;</span>d
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pb-24 md:pb-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-10 page-enter">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-ink/95 backdrop-blur-xl z-50 flex justify-around items-center px-2 pt-4 pb-8 safe-bottom">
        {[...navItems, { name: 'Profile', path: '/profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }].map(item => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link key={item.path} href={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all btn-press ${
                isActive ? 'text-cinema-red' : 'text-muted hover:text-bone'
              }`}>
              <span className={!isActive ? 'opacity-50' : ''}>{item.icon}</span>
              <span className="text-[11px] font-medium mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile FAB */}
      <button onClick={() => openRecommendModal()}
        className="md:hidden fixed bottom-[90px] right-4 z-50 w-14 h-14 rounded-full bg-cinema-red shadow-lg flex items-center justify-center btn-press hover:bg-cinema-red/90 transition-colors"
        style={{ boxShadow: '0 4px 24px rgba(234,51,51,0.4)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <RecommendModal />
      <GiveVerdictModal />
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ToastOverlay />
    </div>
  );
}
