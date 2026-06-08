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
    <footer className="w-full bg-ink border-t border-white/5 py-12 px-6 sm:px-12 mt-auto relative z-20">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
        
        {/* Large Logo */}
        <div className="mb-8">
          <Logo variant="square" size="lg" className="mx-auto" />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-semibold text-bone mb-8">
          <Link href="/home" className="hover:text-cinema-red transition-colors">Home</Link>
          <Link href="/explore" className="hover:text-cinema-red transition-colors">Explore</Link>
          <Link href="/groups" className="hover:text-cinema-red transition-colors">Groups</Link>
          <Link href="/watchlist" className="hover:text-cinema-red transition-colors">Watchlist</Link>
          <Link href="/profile" className="hover:text-cinema-red transition-colors">Profile</Link>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs font-medium text-bone/60 mb-8">
          <Link href="/privacy" className="hover:text-bone transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-bone transition-colors">Terms</Link>
          <Link href="/credits" className="hover:text-bone transition-colors">Credits</Link>
          <Link href="/contact" className="hover:text-bone transition-colors">Contact</Link>
          <Link href="/community-guidelines" className="hover:text-bone transition-colors">Community Guidelines</Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-6 text-bone/40 mb-8">
          {/* Email */}
          <Link href="mailto:recdclub0@gmail.com" className="hover:text-bone transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </Link>
          {/* Instagram */}
          <Link href="https://www.instagram.com/recd.club/" target="_blank" rel="noopener noreferrer" className="hover:text-bone transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center space-y-2">
          <p className="text-xs text-bone/40 font-medium">
            © {new Date().getFullYear()} Rec'd Club. All Rights Reserved.
          </p>
          <p className="text-[10px] text-bone/30 max-w-sm mx-auto">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
