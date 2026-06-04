'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import type { Group, GroupVibe } from '@/lib/types';
import { GROUP_VIBES } from '@/lib/types';
import UserAvatar from './UserAvatar';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: Group; // If present, we are in Edit mode
  initialStep?: number;
}

export default function GroupModal({ isOpen, onClose, group, initialStep }: GroupModalProps) {
  const { createGroup, updateGroup, getGroupMembers, users, currentUser, crewConnections, addToast } = useApp();
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vibe, setVibe] = useState<GroupVibe>('Movie chaos');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('private');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isEdit = !!group;

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setVibe(group.vibe);
      setPrivacy(group.privacy);
      const existingMembers = getGroupMembers(group.id);
      setSelectedMembers(existingMembers.filter(m => m.id !== group.createdBy).map(m => m.id));
    } else {
      setName('');
      setDescription('');
      setVibe('Movie chaos');
      setPrivacy('private');
      setSelectedMembers([]);
    }
    setStep(initialStep || 1);
  }, [group, isOpen, initialStep, getGroupMembers]);

  const filteredUsers = useMemo(() => {
    const crewMemberIds = new Set(crewConnections.map(c => c.crewMemberId));
    
    return users.filter(u => 
      u.id !== currentUser?.id && 
      crewMemberIds.has(u.id) &&
      (u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [users, crewConnections, currentUser, searchQuery]);

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    if (isEdit && group) {
      updateGroup(group.id, { name, description, vibe, privacy }, selectedMembers);
      addToast('Group updated successfully');
    } else {
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name,
        vibe,
        description,
        privacy,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        createdBy: currentUser?.id || 'user-1',
        createdAt: new Date().toISOString(),
        avatarGradient: Math.ceil(Math.random() * 10),
      };
      createGroup(newGroup, selectedMembers);
      addToast('Group created! Let the chaos begin.');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-ink/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <div className="relative z-10 w-full max-w-lg h-[85vh] max-h-[90vh] bg-surface border border-border rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
        
        {/* Progress Bar - Fixed at top */}
        <div className="flex-none w-full h-1 bg-white/5">
          <div 
            className="h-full bg-cinema-red transition-all duration-500" 
            style={{ width: `${(step / 2) * 100}%` }} 
          />
        </div>

        {/* Header - Fixed */}
        <div className="flex-none p-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-editorial text-bone">
              {isEdit ? 'Edit group' : 'Create a crew'}
            </h2>
            <p className="text-[10px] text-muted mt-1 uppercase tracking-widest font-bold">
              Step {step} of 2 • {step === 1 ? 'Details' : 'Members'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted hover:text-bone">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-4 scrollbar-hide">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Group Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prestige Drama Heads"
                    className="w-full bg-ink border border-white/10 rounded-2xl px-5 py-3.5 text-bone focus:outline-none focus:border-cinema-red/50 transition-colors"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-2">Description (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                    className="w-full bg-ink border border-white/10 rounded-2xl px-5 py-3.5 text-bone focus:outline-none focus:border-cinema-red/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">The Vibe</label>
                <div className="flex flex-wrap gap-2">
                  {GROUP_VIBES.map(v => (
                    <button 
                      key={v}
                      onClick={() => setVibe(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        vibe === v ? 'bg-cinema-red border-cinema-red text-bone shadow-lg shadow-cinema-red/20' : 'bg-ink border-white/5 text-muted hover:text-bone hover:border-white/10'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted mb-3">Privacy</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setPrivacy('private')}
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                      privacy === 'private' ? 'bg-cinema-red/10 border-cinema-red text-bone' : 'bg-ink border-white/5 text-muted hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold mb-1">Private</span>
                    <span className="text-[10px] opacity-60">Invite only</span>
                  </button>
                  <button 
                    onClick={() => setPrivacy('public')}
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                      privacy === 'public' ? 'bg-cinema-red/10 border-cinema-red text-bone' : 'bg-ink border-white/5 text-muted hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold mb-1">Public</span>
                    <span className="text-[10px] opacity-60">Discoverable</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Members */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends to add..."
                  className="w-full bg-ink border border-white/10 rounded-2xl !pl-14 pr-5 py-4 text-bone focus:outline-none focus:border-cinema-red/50 transition-colors"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-hide space-y-2">
                {filteredUsers.map(user => (
                  <button 
                    key={user.id}
                    onClick={() => toggleMember(user.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all group ${
                      selectedMembers.includes(user.id) ? 'bg-cinema-red/10 border-cinema-red' : 'bg-ink border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} size="sm" />
                      <div className="text-left">
                        <p className="text-sm font-bold text-bone">{user.displayName}</p>
                        <p className="text-[10px] text-muted">@{user.username}</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedMembers.includes(user.id) ? 'bg-cinema-red border-cinema-red text-bone' : 'border-white/10'
                    }`}>
                      {selectedMembers.includes(user.id) && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {selectedMembers.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2">
                  {selectedMembers.map(id => {
                    const user = users.find(u => u.id === id);
                    return (
                      <div key={id} className="shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                        <span className="text-[10px] font-bold text-bone">{user?.displayName}</span>
                        <button onClick={() => toggleMember(id)} className="text-muted hover:text-cinema-red">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-none p-8 pt-4 border-t border-white/5 bg-surface z-10">
          <div className="flex justify-between items-center gap-4">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-4 text-xs font-bold text-muted hover:text-bone transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={step === 1 ? () => setStep(2) : handleSubmit}
              disabled={!name.trim()}
              className={`${step === 1 ? 'w-full' : 'flex-1'} py-4 bg-cinema-red text-bone font-black uppercase tracking-widest rounded-2xl hover:bg-cinema-red/90 transition-all btn-press shadow-2xl shadow-cinema-red/20 disabled:opacity-30 text-xs`}
            >
              {step === 1 ? 'Continue' : (isEdit ? 'Save Changes' : 'Launch Group')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
