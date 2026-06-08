import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Credits | Rec\'d Club',
};

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      <header className="px-8 py-10 flex flex-col items-center gap-6 border-b border-white/5">
        <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC'D</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-editorial mb-12">Credits</h1>

        <div className="space-y-12 text-bone/90 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
          
          <section className="bg-surface/50 p-8 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">TMDB Attribution</h2>
            <p className="mb-4 text-muted">
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
            <p className="text-muted text-sm">
              Movie and show posters, metadata, cast details, and related media may be powered by TMDB.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">Streaming Platforms</h2>
            <p className="text-muted">
              Streaming availability, platform names, and logos are shown for convenience. Rec'd Club is not affiliated with or endorsed by any streaming platform unless explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">Trademarks</h2>
            <p className="text-muted">
              All trademarks, logos, and brand names are the property of their respective owners.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
