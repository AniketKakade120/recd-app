'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype } from '@/lib/types';

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [archetype, setArchetype] = useState<TasteArchetype>(currentUser?.tasteArchetype || 'Emotional Damage Dealer');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-bone font-editorial">Settings</h1>
        <p className="text-xs text-muted mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <SettingsSection title="Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Username</label>
            <input type="text" value={currentUser?.username || ''} disabled className="text-muted/50" />
          </div>
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider mb-1.5">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell people what kind of recs to expect." className="h-20 resize-none text-sm" maxLength={160} />
            <div className="text-right text-sm text-muted">{bio.length}/160</div>
          </div>
        </div>
      </SettingsSection>

      {/* Taste archetype */}
      <SettingsSection title="Taste Archetype">
        <p className="text-xs text-muted mb-3">This tells people what to expect from your recs.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TASTE_ARCHETYPES.map(type => (
            <button key={type} onClick={() => setArchetype(type)}
              className={`p-2.5 rounded-xl border text-left text-xs transition-all btn-press ${
                archetype === type ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-ink border-border text-muted hover:text-bone'
              }`}>{type}</button>
          ))}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications">
        <div className="space-y-3">
          {[
            { label: 'New recommendations', desc: 'When someone sends you a rec' },
            { label: 'Verdicts', desc: 'When someone rates one of your recs' },
            { label: 'Nudges', desc: 'When your crew pings you to watch something' },
            { label: 'Badge earned', desc: 'When you earn a new stamp or badge' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-bone">{item.label}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" id={item.label} />
                <label htmlFor={item.label}
                  className="flex w-9 h-5 bg-warm-grey peer-checked:bg-cinema-red rounded-full cursor-pointer transition-colors">
                  <span className="w-3.5 h-3.5 bg-white rounded-full mt-0.5 ml-0.5 peer-checked:translate-x-4 transition-transform block" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-xs font-medium text-bone">Email</p>
              <p className="text-xs text-muted">{currentUser?.username}@demo.recd.app</p>
            </div>
            <span className="text-sm text-muted px-2 py-0.5 border border-border rounded">Demo mode</span>
          </div>
          <button disabled className="w-full text-left py-2 text-xs text-muted/40 cursor-not-allowed">
            Change password (coming soon)
          </button>
        </div>
      </SettingsSection>

      {/* Save + logout */}
      <div className="flex justify-between items-center pt-2">
        <button onClick={handleLogout} className="px-4 py-2 text-xs text-muted hover:text-cinema-red transition-colors">
          Sign out
        </button>
        <button onClick={handleSave}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold btn-press transition-all ${
            saved ? 'bg-cinema-red/20 text-cinema-red border border-cinema-red/30' : 'bg-cinema-red text-bone hover:bg-cinema-red/90'
          }`}>
          {saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
