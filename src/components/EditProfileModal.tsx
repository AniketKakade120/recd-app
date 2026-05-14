'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype } from '@/lib/types';
import UserAvatar from './UserAvatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, updateUser } = useApp();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [archetype, setArchetype] = useState<TasteArchetype>(currentUser?.tasteArchetype || 'Emotional Damage Dealer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateUser({
        displayName,
        bio,
        tasteArchetype: archetype
      });
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full md:max-w-xl bg-surface border border-border rounded-t-[32px] md:rounded-[32px] p-8 slide-up md:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-bone font-editorial">Edit Profile</h2>
            <p className="text-sm text-muted mt-1">Refine your identity on Rec&apos;d.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-bone transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-1 rounded-full bg-ink border border-border shadow-2xl">
              <UserAvatar name={displayName} size="xl" />
            </div>
            <button type="button" className="text-xs font-bold text-cinema-red hover:underline uppercase tracking-widest">
              Change Avatar
            </button>
          </div>

          <div className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-ink border border-border rounded-xl px-4 py-3 text-bone focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all outline-none"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Bio</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your crew what you're into..."
                rows={3}
                className="w-full bg-ink border border-border rounded-xl px-4 py-3 text-bone focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all outline-none resize-none text-sm"
              />
            </div>

            {/* Taste Archetype */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest px-1">Taste Archetype</label>
              <div className="grid grid-cols-2 gap-2">
                {TASTE_ARCHETYPES.map((arch) => (
                  <button
                    key={arch}
                    type="button"
                    onClick={() => setArchetype(arch)}
                    className={`px-4 py-3 rounded-xl border text-[11px] font-bold text-left transition-all ${
                      archetype === arch 
                        ? 'bg-cinema-red border-cinema-red text-bone shadow-[0_0_20px_rgba(234,51,51,0.2)]' 
                        : 'bg-ink border-border text-muted hover:border-border-strong'
                    }`}
                  >
                    {arch}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-surface-hover border border-border text-bone font-bold rounded-2xl hover:bg-warm-grey transition-all btn-press text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 bg-cinema-red text-bone font-bold rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-lg shadow-cinema-red/20 text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
