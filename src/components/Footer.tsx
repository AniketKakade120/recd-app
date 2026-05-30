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
    <footer className="w-full bg-ink border-t border-white/5 pt-20 pb-10 px-6 sm:px-12 mt-auto relative z-20">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Top Section: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-start pr-8">
            <Logo variant="horizontal" size="sm" className="mb-6" />
            <p className="text-sm text-bone/50 max-w-sm leading-relaxed mb-8">
              Good taste travels person to person. Turn loose picks from your group chat into real, verifiable recommendations.
            </p>
            <div className="flex items-center gap-5 text-bone/40">
              <Link href="#" className="hover:text-bone transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </Link>
              <Link href="#" className="hover:text-bone transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </Link>
              <Link href="#" className="hover:text-bone transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
              </Link>
              <Link href="#" className="hover:text-bone transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </Link>
            </div>
          </div>

          {/* Product Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-bone font-bold text-sm tracking-wide mb-2">Product</h4>
            <Link href="/explore" className="text-sm text-bone/50 hover:text-bone transition-colors">Explore</Link>
            <Link href="/groups" className="text-sm text-bone/50 hover:text-bone transition-colors">Groups</Link>
            <Link href="/watchlist" className="text-sm text-bone/50 hover:text-bone transition-colors">Watchlist</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Taste Score</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Changelog</Link>
          </div>

          {/* Resources Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-bone font-bold text-sm tracking-wide mb-2">Resources</h4>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Help Center</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Community</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Blog</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Creator Program</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">API Docs</Link>
          </div>

          {/* Company Column */}
          <div className="flex flex-col gap-4">
            <h4 className="text-bone font-bold text-sm tracking-wide mb-2">Company</h4>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">About Us</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Careers</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Manifesto</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Brand Assets</Link>
            <Link href="#" className="text-sm text-bone/50 hover:text-bone transition-colors">Contact</Link>
          </div>

        </div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 text-xs text-bone/40">
          <p>© {new Date().getFullYear()} Rec'd Club. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-bone transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-bone transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-bone transition-colors">Cookie Settings</Link>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
