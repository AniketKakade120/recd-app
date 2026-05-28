'use client';

import { useApp } from '@/lib/context';
import { useState } from 'react';
import { UserPlus, UserCheck, Clock, X, UserMinus, ChevronDown } from 'lucide-react';

interface AddToCrewButtonProps {
  userId: string;
  username: string;
  className?: string;
}

export default function AddToCrewButton({ userId, username, className = '' }: AddToCrewButtonProps) {
  const { 
    currentUser, 
    getConnectionState, 
    sendCrewRequest, 
    acceptCrewRequest, 
    rejectCrewRequest,
    cancelCrewRequest,
    removeCrewMember,
    crewRequests 
  } = useApp();
  
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  if (!currentUser || currentUser.id === userId) return null;

  const state = getConnectionState(userId);

  const handleAction = async (action: () => Promise<any>) => {
    setIsLoading(true);
    await action();
    setIsLoading(false);
    setShowMenu(false);
  };

  // 1. PENDING SENT
  if (state === 'pending_sent') {
    return (
      <div className="relative inline-block">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center gap-2 px-6 py-2.5 bg-ink border border-border text-muted font-bold rounded-xl hover:text-bone transition-all active:scale-95 ${className}`}
        >
          <Clock size={16} />
          Request Sent
          <ChevronDown size={14} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => {
                  const req = crewRequests.find(r => r.senderId === currentUser.id && r.receiverId === userId);
                  if (req) handleAction(() => cancelCrewRequest(req.id));
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-muted hover:text-cinema-red hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <X size={14} /> Cancel Request
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 2. PENDING RECEIVED
  if (state === 'pending_received') {
    return (
      <div className="flex items-center gap-2">
        <button 
          disabled={isLoading}
          onClick={() => {
            const req = crewRequests.find(r => r.receiverId === currentUser.id && r.senderId === userId);
            if (req) handleAction(() => acceptCrewRequest(req.id));
          }}
          className={`flex items-center gap-2 px-6 py-2.5 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-all active:scale-95 shadow-lg shadow-cinema-red/20 ${className}`}
        >
          {isLoading ? 'Accepting...' : 'Accept Request'}
        </button>
        <button 
          disabled={isLoading}
          onClick={() => {
            const req = crewRequests.find(r => r.receiverId === currentUser.id && r.senderId === userId);
            if (req) handleAction(() => rejectCrewRequest(req.id));
          }}
          className="p-2.5 bg-surface border border-border text-muted hover:text-bone rounded-xl transition-colors"
          title="Reject Request"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  // 3. CONNECTED
  if (state === 'connected') {
    return (
      <div className="relative inline-block">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className={`flex items-center gap-2 px-6 py-2.5 bg-ink border border-border text-bone font-bold rounded-xl hover:border-border-strong transition-all active:scale-95 ${className}`}
        >
          <UserCheck size={16} className="text-cinema-red" />
          In Your Crew
          <ChevronDown size={14} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute top-full left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-2xl z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => handleAction(() => removeCrewMember(userId))}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-cinema-red hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <UserMinus size={14} /> Remove from Crew
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // 4. NONE (OR REJECTED)
  return (
    <button 
      disabled={isLoading}
      onClick={() => handleAction(() => sendCrewRequest(userId))}
      className={`flex items-center gap-2 px-8 py-2.5 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-all active:scale-95 shadow-lg shadow-cinema-red/20 ${className}`}
    >
      <UserPlus size={18} />
      {isLoading ? 'Sending...' : 'Add to Crew'}
    </button>
  );
}
