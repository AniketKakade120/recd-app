'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import type { User } from '@/lib/types';
import CrewMemberCard from './CrewMemberCard';
import UserAvatar from './UserAvatar';
import InviteModal from './InviteModal';
import { UserCheck, Clock, Send, Check, X, UserPlus } from 'lucide-react';

export default function ProfileCrewTab() {
  const { 
    crewConnections, 
    crewRequests, 
    currentUser, 
    getUser, 
    acceptCrewRequest, 
    rejectCrewRequest,
    cancelCrewRequest,
    removeCrewMember 
  } = useApp();
  
  const [activeSubTab, setActiveSubTab] = useState<'crew' | 'requests'>('crew');
  const [inviteOpen, setInviteOpen] = useState(false);

  if (!currentUser) return null;

  // 1. My Crew (Accepted Connections)
  const myCrew = crewConnections
    .map(c => c.crew_member_profile)
    .filter((p): p is User => Boolean(p));

  // 2. Pending Received
  const pendingReceived = crewRequests
    .filter(r => r.receiverId === currentUser.id && r.status === 'pending')
    .map(r => ({ ...r, user: r.sender_profile }))
    .filter(r => r.user);

  // 3. Pending Sent
  const pendingSent = crewRequests
    .filter(r => r.senderId === currentUser.id && r.status === 'pending')
    .map(r => ({ ...r, user: r.receiver_profile }))
    .filter(r => r.user);

  const totalRequests = pendingReceived.length + pendingSent.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sub-Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        <button 
          onClick={() => setActiveSubTab('crew')}
          className={`pb-3 text-xs font-bold uppercase tracking-widest relative transition-colors ${activeSubTab === 'crew' ? 'text-bone' : 'text-muted'}`}
        >
          My Crew ({myCrew.length})
          {activeSubTab === 'crew' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red" />}
        </button>
        <button 
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 text-xs font-bold uppercase tracking-widest relative transition-colors ${activeSubTab === 'requests' ? 'text-bone' : 'text-muted'}`}
        >
          Requests {totalRequests > 0 && <span className="ml-1 px-1.5 py-0.5 bg-cinema-red text-bone text-[8px] rounded-full">{totalRequests}</span>}
          {activeSubTab === 'requests' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red" />}
        </button>
      </div>

      {activeSubTab === 'crew' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-bone font-editorial">Your Crew</h2>
              <p className="text-muted text-xs mt-1">People whose taste you trust.</p>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-border rounded-lg text-[10px] font-bold text-muted hover:text-bone transition-colors uppercase tracking-widest">
              Manage
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCrew.length > 0 ? (
              myCrew.map(member => (
                <CrewMemberCard key={member!.id} user={member!} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-surface border border-border border-dashed rounded-3xl">
                <p className="text-muted text-sm mb-4">Your crew is empty.</p>
                <button 
                  onClick={() => setInviteOpen(true)}
                  className="px-6 py-2 bg-cinema-red text-bone text-xs font-bold rounded-xl shadow-lg shadow-cinema-red/20 btn-press"
                >
                  Invite Friends
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'requests' && (
        <div className="space-y-12">
          
          {/* Incoming */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-cinema-red/10 text-cinema-red rounded-lg">
                <UserPlus size={16} />
              </div>
              <h3 className="text-sm font-bold text-bone uppercase tracking-widest">Requests Received</h3>
            </div>
            
            <div className="space-y-3">
              {pendingReceived.length > 0 ? (
                pendingReceived.map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl">
                    <UserAvatar name={req.user!.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-bone truncate">{req.user!.displayName}</p>
                      <p className="text-[10px] text-muted uppercase">@{req.user!.username}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => acceptCrewRequest(req.id)}
                        className="px-4 py-2 bg-cinema-red text-bone text-[10px] font-bold rounded-lg hover:bg-cinema-red/90 transition-all uppercase tracking-widest"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectCrewRequest(req.id)}
                        className="p-2 bg-ink border border-border text-muted hover:text-bone rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted italic pl-1">No incoming requests.</p>
              )}
            </div>
          </section>

          {/* Outgoing */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-ink text-muted rounded-lg border border-border">
                <Send size={14} />
              </div>
              <h3 className="text-sm font-bold text-bone uppercase tracking-widest">Requests Sent</h3>
            </div>
            
            <div className="space-y-3">
              {pendingSent.length > 0 ? (
                pendingSent.map(req => (
                  <div key={req.id} className="flex items-center gap-4 p-4 bg-ink/40 border border-border rounded-2xl opacity-80">
                    <UserAvatar name={req.user!.displayName} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-bone truncate">{req.user!.displayName}</p>
                      <p className="text-[10px] text-muted">Awaiting response...</p>
                    </div>
                    <button 
                      onClick={() => cancelCrewRequest(req.id)}
                      className="text-[10px] font-bold text-muted hover:text-cinema-red uppercase tracking-widest px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted italic pl-1">No pending outgoing requests.</p>
              )}
            </div>
          </section>

        </div>
      )}

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
