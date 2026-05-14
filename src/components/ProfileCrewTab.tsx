'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import CrewMemberCard from './CrewMemberCard';
import InviteModal from './InviteModal';

export default function ProfileCrewTab() {
  const { userConnections, currentUser, getUser, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filter, setFilter] = useState('All');

  if (!currentUser) return null;

  const myCrew = userConnections
    .filter(c => c.userId === currentUser.id && c.status === 'connected')
    .map(c => getUser(c.connectedUserId))
    .filter(Boolean);

  const filteredCrew = myCrew.filter(member => {
    const matchesSearch = member!.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         member!.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const isEmpty = myCrew.length === 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-bone font-editorial">My Crew</h2>
          <p className="text-muted text-sm mt-1">People whose taste you trust enough to risk your watchlist.</p>
        </div>
        
        {!isEmpty && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative group w-full sm:max-w-md flex-1">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted z-10 group-focus-within:text-cinema-red transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search your crew..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 !pl-12 !pr-10 bg-ink border border-border rounded-xl text-bone text-sm placeholder:text-muted/60 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all relative"
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-bone transition-colors z-10"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="w-full sm:w-auto px-6 py-3 bg-cinema-red text-bone text-xs font-bold rounded-xl hover:bg-cinema-red/90 transition-all active:scale-95 shadow-lg shadow-cinema-red/20"
            >
              Add Someone
            </button>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="bg-surface border border-border border-dashed rounded-[32px] p-12 text-center max-w-lg mx-auto mt-12">
          <div className="w-20 h-20 bg-ink border border-border rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            🤝
          </div>
          <h3 className="text-xl font-bold text-bone mb-2">Your crew is empty.</h3>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            Add people whose taste you trust. Rec’d gets better when your people start recommending too.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => addToast('Search is focused on people.', { type: 'info' })}
              className="px-8 py-3 bg-bone text-ink font-bold rounded-xl hover:bg-white transition-all active:scale-95"
            >
              Find people
            </button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-8 py-3 bg-ink border border-border text-bone font-bold rounded-xl hover:bg-surface transition-all active:scale-95"
            >
              Invite friends
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Recently Added', 'High Taste Score', 'Mutual Groups'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === f 
                    ? 'bg-cinema-red border-cinema-red text-bone shadow-[0_0_15px_rgba(234,51,51,0.2)]' 
                    : 'bg-surface border-border text-muted hover:text-bone hover:border-border-strong'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {filteredCrew.map(member => (
              <CrewMemberCard key={member!.id} user={member!} />
            ))}
          </div>
          
          {filteredCrew.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted italic">No crew members found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </>
      )}

      {showInviteModal && (
        <InviteModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
