'use client';

import { useApp } from '@/lib/context';
import type { User } from '@/lib/types';
import ClickableUserAvatar from './ClickableUserAvatar';
import Link from 'next/link';
import { useState } from 'react';

interface CrewMemberCardProps {
  user: User;
}

export default function CrewMemberCard({ user }: CrewMemberCardProps) {
  const { removeCrewMember } = useApp();
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 hover:border-border-strong transition-all group relative flex items-center justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <ClickableUserAvatar 
          userId={user.id} 
          username={user.username} 
          name={user.displayName} 
          avatarUrl={user.avatarUrl}
          size="md"
        />
        <div className="min-w-0">
          <Link href={`/profile/${user.username}`} className="block group/name">
            <h3 className="text-bone font-bold text-sm hover:text-cinema-red transition-colors truncate">{user.displayName}</h3>
            <p className="text-muted text-[10px] font-bold uppercase tracking-widest mt-0.5">{user.tasteArchetype}</p>
          </Link>
        </div>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 text-muted hover:text-bone transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
        
        {showOptions && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-surface-hover border border-border rounded-2xl shadow-2xl z-20 overflow-hidden py-1">
              <button 
                onClick={() => {
                  removeCrewMember(user.id);
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-cinema-red hover:bg-white/5 transition-colors font-bold"
              >
                Remove from Crew
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
