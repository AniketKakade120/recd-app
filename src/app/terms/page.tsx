import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use | Rec\'d Club',
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'recdclub0@gmail.com';

  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      <header className="px-8 py-10 flex flex-col items-center gap-6 border-b border-white/5">
        <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC'D</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold font-editorial mb-4">Terms of Use</h1>
        <p className="text-muted mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 text-bone/90 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">1. Acceptance of terms</h2>
            <p>
              By using Rec'd Club, users agree to these Terms of Use and our <Link href="/privacy" className="text-cinema-red hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">2. Eligibility</h2>
            <p>
              Rec'd Club is intended for users aged 13 and above. If you are under 18, you may use Rec'd Club only with parent or guardian permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">3. Account</h2>
            <p>
              Users are responsible for their account activity and keeping login access secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">4. User content</h2>
            <p className="mb-2">Users may create:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted mb-4">
              <li>recommendations</li>
              <li>notes</li>
              <li>verdicts</li>
              <li>comments</li>
              <li>crew names</li>
              <li>list names</li>
              <li>profile details</li>
              <li>shared story cards</li>
            </ul>
            <p>
              Users retain ownership of their content, but grant Rec'd Club permission to display, store, format, and share that content inside the product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">5. Acceptable use</h2>
            <p className="mb-2">Users must not:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li>harass or abuse others</li>
              <li>post hate speech or threats</li>
              <li>spam users with requests/recommendations</li>
              <li>impersonate someone</li>
              <li>upload or post illegal content</li>
              <li>share private information of others</li>
              <li>misuse the product or attempt to break security</li>
              <li>scrape data or reverse-engineer the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">6. Moderation rights</h2>
            <p>
              Rec'd Club may remove content, restrict accounts, or suspend users if they violate the Terms or create harm.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">7. Movie/show data disclaimer</h2>
            <p>
              Movie/show metadata, posters, cast images, ratings, and streaming information may come from third-party sources and may not always be accurate or available.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">8. No affiliation disclaimer</h2>
            <p>
              Rec'd Club is not affiliated with or endorsed by TMDB, IMDb, Netflix, Prime Video, Disney, Apple TV, MUBI, or any streaming platform unless explicitly stated.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">9. Availability</h2>
            <p>
              The product is provided as an early product/beta/MVP and may change or be unavailable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">10. Limitation of liability</h2>
            <p>
              Rec'd Club is provided “as is.” We are not responsible for indirect losses, unavailable content, inaccurate metadata, or user-generated content posted by others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">11. Termination</h2>
            <p>
              Users can stop using Rec'd Club. Rec'd Club may suspend accounts that violate terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">12. Contact</h2>
            <p>
              Contact:<br />
              <a href={`mailto:${supportEmail}`} className="text-cinema-red hover:underline">{supportEmail}</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
