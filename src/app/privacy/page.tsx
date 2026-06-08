import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Rec\'d Club',
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const privacyEmail = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@recdclub.com';

  return (
    <div className="min-h-screen bg-background text-bone pb-32">
      <header className="px-8 py-10 flex flex-col items-center gap-6 border-b border-white/5">
        <Link href="/" className="text-3xl font-black tracking-tighter text-cinema-red italic">REC'D</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold font-editorial mb-4">Privacy Policy</h1>
        <p className="text-muted mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 text-bone/90 leading-relaxed text-sm md:text-base">
          <section>
            <p>
              Rec'd Club is a social movie and show recommendation platform. This Privacy Policy explains what information we collect, how we use it, and how you can control your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">1. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li><strong className="text-bone/90">Google login information:</strong> name, email address, profile photo/avatar</li>
              <li><strong className="text-bone/90">Account/profile information:</strong> username, display name, bio, taste traits, genre preferences, watch vibes, streaming platforms</li>
              <li><strong className="text-bone/90">Social activity:</strong> crew requests, crew connections, recommendations, verdicts, comments/notes, lists/watchlists</li>
              <li><strong className="text-bone/90">Product usage data:</strong> pages visited, actions like recommendation sent, verdict submitted, invite accepted</li>
              <li><strong className="text-bone/90">Technical data:</strong> device/browser type, logs, error events, approximate usage timestamps</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li>to create and manage your account</li>
              <li>to help users recommend movies/shows to each other</li>
              <li>to show your crew, recommendations, verdicts, taste profile, and lists</li>
              <li>to personalize product experience such as Taste Match and Taste Score</li>
              <li>to improve and secure the product</li>
              <li>to debug errors and prevent abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">3. Google login data</h2>
            <p>
              We use Google login only to authenticate you and create your Rec'd Club profile. We do not access your Gmail, Drive, Calendar, contacts, or private Google data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">4. What is visible to others</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li>display name, username, avatar, taste traits may be visible to other users depending on profile settings</li>
              <li>recommendations/verdicts may be visible to involved users or crews</li>
              <li>shared lists/story cards may be visible to people with the link or where the user posts them</li>
              <li>private account data like email is not shown publicly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">5. Data sharing</h2>
            <p className="mb-2">We do not sell personal data.</p>
            <p className="mb-2">We may use trusted service providers such as:</p>
            <ul className="list-disc pl-5 space-y-2 text-muted">
              <li>Supabase for authentication/database</li>
              <li>Vercel for hosting</li>
              <li>TMDB for movie/show metadata</li>
              <li>analytics/error logging providers if configured</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">6. Analytics</h2>
            <p>
              Rec'd Club may collect basic product analytics to understand usage and improve the product. If we use analytics, we will use them to understand product usage, not to sell personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">7. Data retention</h2>
            <p>
              We keep account data while the account is active. Users can request deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">8. Data deletion</h2>
            <p>
              You can request account/data deletion by contacting us at <a href={`mailto:${privacyEmail}`} className="text-cinema-red hover:underline">{privacyEmail}</a>. You can also visit Settings → Account → Delete Account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">9. Age and guardian permission</h2>
            <p>
              Rec'd Club is intended for users aged 13 and above. If you are under 18, you should use Rec'd Club only with parent or guardian permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">10. Security</h2>
            <p>
              We use reasonable technical and organizational safeguards, including HTTPS and Supabase Row Level Security where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">11. Changes to this policy</h2>
            <p>
              We may update this policy and will update the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-editorial mb-4 text-bone">12. Contact</h2>
            <p>
              For privacy questions or deletion requests, contact:<br />
              <a href={`mailto:${privacyEmail}`} className="text-cinema-red hover:underline">{privacyEmail}</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
