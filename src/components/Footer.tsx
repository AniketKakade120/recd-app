'use client';

import Link from 'next/link';
import Logo from './Logo';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on auth pages or onboarding to keep them focused
  const hiddenRoutes = ['/login', '/signup', '/onboarding', '/auth/callback'];
  if (hiddenRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="w-full bg-ink border-t border-white/5 py-24 px-6 sm:px-12 mt-auto relative z-20">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
        
        {/* Large Logo */}
        <div className="mb-12">
          <Logo variant="square" size="lg" className="mx-auto" />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-semibold text-bone mb-10">
          <Link href="/home" className="hover:text-cinema-red transition-colors">Home</Link>
          <Link href="/explore" className="hover:text-cinema-red transition-colors">Explore</Link>
          <Link href="/groups" className="hover:text-cinema-red transition-colors">Groups</Link>
          <Link href="/watchlist" className="hover:text-cinema-red transition-colors">Watchlist</Link>
          <Link href="/profile" className="hover:text-cinema-red transition-colors">Profile</Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 text-bone/40 mb-16">
          {/* Globe/Website */}
          <Link href="#" className="hover:text-bone transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </Link>
          {/* Twitter / X */}
          <Link href="#" className="hover:text-bone transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
          </Link>
          {/* Instagram */}
          <Link href="#" className="hover:text-bone transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-xs text-bone/40 font-medium">
          © {new Date().getFullYear()} Rec'd Club. All Rights Reserved.
        </p>
        
      </div>
    </footer>
  );
}
