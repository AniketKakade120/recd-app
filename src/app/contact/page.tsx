import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Contact | Rec\'d Club',
};

export default function ContactPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'recdclub0@gmail.com';
  const privacyEmail = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'recdclub0@gmail.com';

  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      <header className="px-8 py-10 flex flex-col items-center gap-6 border-b border-white/5">
        <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC'D</Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-editorial mb-12">Contact Rec'd Club</h1>

        <div className="space-y-8 text-bone/90 leading-relaxed text-sm md:text-base">
          
          <section className="bg-surface/50 p-8 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">Support & Feedback</h2>
            <p className="mb-6 text-muted">
              For product support, bug reports, or general feedback about your experience, please reach out to us at:
            </p>
            <a href={`mailto:${supportEmail}`} className="inline-block px-8 py-4 bg-cinema-red text-bone font-bold rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20">
              Email Support
            </a>
            <p className="mt-4 text-xs font-medium text-cinema-red">{supportEmail}</p>
          </section>

          <section className="bg-surface/50 p-8 rounded-3xl border border-border">
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">Privacy & Data Deletion</h2>
            <p className="mb-6 text-muted">
              For privacy questions, data requests, or to permanently delete your account and data:
            </p>
            <a href={`mailto:${privacyEmail}`} className="inline-block px-8 py-4 bg-surface-hover border border-border text-bone font-bold rounded-2xl hover:bg-white/5 transition-all btn-press">
              Email Privacy Team
            </a>
            <p className="mt-4 text-xs font-medium text-muted">{privacyEmail}</p>
          </section>

        </div>
      </main>
    </div>
  );
}
