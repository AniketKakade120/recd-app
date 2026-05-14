'use client';

import { useApp } from '@/lib/context';
import { useState } from 'react';

interface AddToCrewButtonProps {
  userId: string;
  username: string;
  className?: string;
}

export default function AddToCrewButton({ userId, username, className = '' }: AddToCrewButtonProps) {
  const { isUserInCrew, addToCrew, removeFromCrew } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const inCrew = isUserInCrew(userId);

  if (inCrew) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowConfirm(!showConfirm)}
          className={`px-6 py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-all active:scale-95 flex items-center gap-2 ${className}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cinema-red"><path d="M20 6 9 17l-5-5"/></svg>
          In Your Crew
        </button>

        {showConfirm && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowConfirm(false)} />
            <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => {
                  removeFromCrew(userId);
                  setShowConfirm(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-cinema-red hover:bg-white/5 transition-colors"
              >
                Remove from Crew
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={() => addToCrew(userId)}
      className={`px-8 py-2.5 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-all active:scale-95 shadow-lg shadow-cinema-red/20 ${className}`}
    >
      Add to Crew
    </button>
  );
}
