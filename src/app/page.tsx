'use client';

import Link from 'next/link';
import StampBadge from '@/components/StampBadge';

const STAMPS = ['Certified Good Call', 'Worth It', 'Crew Pick', 'Risky But Worth It', 'Not For Everyone', 'Missed The Mark'] as const;

const HOW_IT_WORKS = [
  { n: '01', t: 'Get a rec from your crew', d: 'A friend sends you a movie or show. With context. With a reason. Not just a title.' },
  { n: '02', t: 'Save it to your watchlist', d: 'Your watchlist becomes a trust-based library, curated by people who know your taste.' },
  { n: '03', t: 'Watch when ready', d: 'No pressure. The rec waits. Your crew waits. (Okay, some pressure.)' },
  { n: '04', t: 'Rate the pick', d: 'Rate the content itself. Then rate how well they read your taste.' },
  { n: '05', t: 'Stamp the recommendation', d: 'Good Call. Worth It. Certified Good Call. One stamp. Maximum weight.' },
  { n: '06', t: 'Build taste reputation', d: 'Every stamp updates your Taste Score. Your crew sees your record. Respect is earned.' },
];

const WHY_DIFFERENT = [
  { t: 'From your crew, not an algorithm', d: 'Real recommendations from people who actually know what you like.' },
  { t: 'See who to trust', d: 'Taste Scores show you whose picks are worth your time.' },
  { t: 'Every pick has context', d: 'Why they recommended it. How confident they were. What mood it fits.' },
  { t: 'Your watchlist gets smarter', d: 'Curated by your crew. Filtered by trust. Actually worth watching.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col bg-ink">
      {/* Ambient blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-cinema-red/6 rounded-full blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brick/8 rounded-full blur-[120px] pointer-events-none animate-blob animation-delay-4000" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border/40">
        <span className="text-xl font-bold text-bone font-editorial tracking-tight">
          Rec<span className="text-cinema-red">&apos;</span>d
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted hover:text-bone transition-colors px-3 py-1.5">Sign in</Link>
          <Link href="/signup" className="text-sm bg-cinema-red text-bone px-4 py-2 rounded-lg font-semibold hover:bg-cinema-red/90 transition-colors btn-press">
            Start recommending
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border text-xs mb-8 animate-float">
            <span className="w-3.5 h-3.5 rounded-full border border-cinema-red flex items-center justify-center text-cinema-red text-[6px] font-bold">R</span>
            <span className="text-muted uppercase tracking-widest font-medium">Stamped by taste</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight font-editorial text-bone">
            Every rec is a<br />
            <span className="text-cinema-red italic">stamp</span> of approval.
          </h1>

          <p className="text-lg text-muted mb-10 max-w-xl leading-relaxed">
            Good taste travels person to person. From your crew. For your watchlist.
            <span className="text-cinema-red font-medium"> Pass it on.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/signup" className="px-8 py-4 bg-cinema-red text-bone rounded-xl font-semibold hover:bg-cinema-red/90 transition-colors btn-press text-base">
              Start recommending
            </Link>
            <Link href="/login" className="px-8 py-4 bg-surface text-bone border border-border rounded-xl font-medium hover:bg-surface-hover transition-colors btn-press text-base">
              View demo
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-xs text-cinema-red uppercase tracking-widest font-semibold mb-2">The loop</p>
            <h2 className="text-3xl font-bold font-editorial text-bone">How it works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_IT_WORKS.map(item => (
              <div key={item.n} className="p-5 rounded-2xl bg-surface border border-border hover:border-border-strong transition-colors">
                <span className="text-xs font-bold text-cinema-red/60 uppercase tracking-widest block mb-3">{item.n}</span>
                <h3 className="text-base font-bold mb-2 text-bone">{item.t}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why different */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <p className="text-xs text-cinema-red uppercase tracking-widest font-semibold mb-2">The difference</p>
            <h2 className="text-3xl font-bold font-editorial text-bone">Why Rec&apos;d is different</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_DIFFERENT.map(item => (
              <div key={item.t} className="p-6 rounded-2xl bg-surface border border-border flex gap-4">
                <div className="w-2 h-2 rounded-full bg-cinema-red shrink-0 mt-2" />
                <div>
                  <h3 className="font-bold text-bone mb-1.5">{item.t}</h3>
                  <p className="text-sm text-muted">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stamp preview */}
        <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <p className="text-xs text-cinema-red uppercase tracking-widest font-semibold mb-2">The badge system</p>
            <h2 className="text-3xl font-bold font-editorial text-bone">Stamps that mean something</h2>
            <p className="text-sm text-muted mt-2">One stamp per recommendation. Earned, not given.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {STAMPS.map(s => <StampBadge key={s} stamp={s} size="lg" variant="filled" />)}
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-editorial text-bone mb-4">Pass it on.</h2>
          <p className="text-muted mb-8 max-w-sm mx-auto">Good recs. Better taste. From your crew. For your watchlist.</p>
          <Link href="/signup" className="inline-block px-10 py-4 bg-cinema-red text-bone rounded-xl font-bold text-lg hover:bg-cinema-red/90 btn-press transition-colors">
            Start recommending
          </Link>
          <p className="text-xs text-muted/40 mt-6 uppercase tracking-widest">Stamped by taste.</p>
        </section>
      </main>
    </div>
  );
}
