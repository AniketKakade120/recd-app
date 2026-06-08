import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Community Guidelines | Rec\'d Club',
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      <header className="px-8 py-10 flex flex-col items-center gap-6 border-b border-white/5">
        <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC'D</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold font-editorial mb-8 text-center">Community Guidelines</h1>

        <div className="space-y-10 text-bone/90 leading-relaxed text-sm md:text-base max-w-2xl mx-auto">
          
          <section className="text-center">
            <p className="text-lg text-muted">
              Rec'd Club is built around personal recommendations, taste, and friendly verdicts. Keep it respectful.
            </p>
          </section>

          <section className="bg-surface/50 p-8 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold font-editorial mb-6 text-bone">The Rules</h2>
            <ul className="space-y-4 text-muted">
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Be respectful</strong> of others' tastes and opinions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not harass or threaten people.</strong> Keep verdicts friendly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not post hate speech.</strong> We have zero tolerance for it.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not spam people</strong> with unwanted requests or recommendations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not impersonate others.</strong> Be yourself.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not share private personal information</strong> (yours or anyone else's).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Keep crew and list names safe</strong> and respectful.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-cinema-red mt-1">✦</span>
                <span><strong className="text-bone/90">Do not use Rec'd Club to distribute illegal or harmful content.</strong></span>
              </li>
            </ul>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">Moderation</h2>
            <p className="text-muted">
              We may remove content or restrict accounts that break these guidelines to protect the community.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}
