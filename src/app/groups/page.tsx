'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import GroupCard from '@/components/GroupCard';
import InviteModal from '@/components/InviteModal';
import { GROUP_VIBES, type GroupVibe } from '@/lib/types';
import { mockGroups } from '@/lib/mock-data';

import GroupModal from '@/components/GroupModal';

export default function GroupsPage() {
  const { groups, joinGroup, groupMembers, currentUser, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const myGroupIds = groupMembers.filter(gm => gm.userId === currentUser?.id).map(gm => gm.groupId);
  const myGroups = groups.filter(g => myGroupIds.includes(g.id));

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const target = groups.find(g => g.inviteCode === joinCode.toUpperCase());
    if (target) {
      joinGroup(target.id);
      addToast(`Welcome to ${target.name}!`, { type: 'success' });
      setIsJoining(false); 
      setJoinCode('');
    } else {
      addToast('Invalid invite code. Try again.', { type: 'error' });
    }
  };

  return (
    <div className="space-y-16 pb-20 page-enter">
      {/* Header Section */}
      <div className="relative rounded-[40px] overflow-hidden bg-surface border border-white/5 p-12 text-center shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cinema-red to-transparent opacity-50" />
        
        <p className="text-[10px] font-black text-cinema-red uppercase tracking-[0.3em] mb-4">Find Your Crew</p>
        <h1 className="text-4xl md:text-6xl font-bold text-bone font-editorial mb-6 leading-tight tracking-tight">
          Great taste is better <br className="hidden md:block" /> together.
        </h1>
        <p className="text-base text-muted max-w-xl mx-auto leading-relaxed mb-10">
          Join groups to find your signal in the noise. Discuss picks, track group taste, and see what&apos;s actually worth your time.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto px-10 py-4 bg-cinema-red text-bone font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-xl shadow-cinema-red/20 text-xs"
          >
            + Create a Crew
          </button>
          <button 
            onClick={() => setIsJoining(true)}
            className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-bone font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-white/10 transition-all btn-press text-xs"
          >
            Join with Code
          </button>
        </div>
      </div>

      {/* Join form */}
      {isJoining && (
        <div className="rounded-[32px] bg-ink border border-white/10 p-8 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-bone font-editorial">Enter invite code</h3>
            <button onClick={() => setIsJoining(false)} className="p-2 text-muted hover:text-bone">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={joinCode} 
              onChange={e => setJoinCode(e.target.value)}
              placeholder="e.g. AZ72X9" 
              autoFocus 
              className="flex-1 bg-surface border border-white/10 rounded-2xl px-6 py-4 text-bone font-black uppercase tracking-widest focus:outline-none focus:border-cinema-red/50" 
            />
            <button 
              type="submit" 
              disabled={!joinCode.trim()} 
              className="px-10 py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 btn-press transition-all text-xs"
            >
              Join
            </button>
          </form>
        </div>
      )}

      {/* My Groups */}
      {myGroups.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-end justify-between px-1">
            <h2 className="text-2xl font-bold text-bone font-editorial tracking-tight">Your Crews</h2>
            <span className="text-[10px] font-black text-muted uppercase tracking-widest">{myGroups.length} Active</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {myGroups.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        </section>
      )}



      {groups.length === 0 && !showCreateModal && (
        <div className="py-32 text-center bg-surface/50 border border-white/5 border-dashed rounded-[40px]">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-bone/10">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <h3 className="text-2xl font-bold text-bone font-editorial mb-3">Solitary viewing isn&apos;t the vibe.</h3>
          <p className="text-base text-muted max-w-sm mx-auto mb-10 leading-relaxed">Create a group or invite your crew to start debating what&apos;s actually worth watching.</p>
          <button 
            onClick={() => setInviteOpen(true)}
            className="px-10 py-4 bg-white/5 border border-white/10 text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all btn-press text-xs"
          >
            Invite friends
          </button>
        </div>
      )}

      <GroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
