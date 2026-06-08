'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { TASTE_ARCHETYPES, type TasteArchetype } from '@/lib/types';
import UserAvatar from './UserAvatar';
import ModalBase from './ModalBase';

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
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Refine your identity on Rec'd."
      maxWidth="max-w-xl"
    >
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
    </ModalBase>
  );
}
