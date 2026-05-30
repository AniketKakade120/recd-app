'use client';

import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';

interface LandingNavProps {
  onGetStarted: () => void;
}

export default function LandingNav({ onGetStarted }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const links = [
    { label: 'How it Works', id: 'how-it-works' },
    { label: 'Taste Score', id: 'taste-score' },
    { label: 'Crews', id: 'crews' },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink/90 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 md:h-[72px] flex items-center justify-between">
        <Logo variant="horizontal" size="sm" />

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-[11px] font-bold uppercase tracking-[0.15em] text-bone/50 hover:text-bone transition-colors duration-300"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-cinema-red text-bone text-[11px] font-bold uppercase tracking-[0.15em] rounded-lg hover:bg-cinema-red/90 transition-all duration-300 shadow-[0_0_20px_rgba(234,51,51,0.15)] hover:shadow-[0_0_30px_rgba(234,51,51,0.3)]"
          >
            Get Started
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-bone/60 hover:text-bone transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-ink/95 backdrop-blur-2xl border-t border-white/5 px-6 py-6 space-y-4">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="block w-full text-left text-sm font-bold uppercase tracking-widest text-bone/60 hover:text-bone py-2"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
