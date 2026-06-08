'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { Copy, Check, Mail, Search, Link2 } from 'lucide-react';
import PeopleSearch from './PeopleSearch';
import ModalBase from './ModalBase';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  inviteCode?: string;
}

export default function InviteModal({ isOpen, onClose, groupName, inviteCode }: InviteModalProps) {
  const { currentUser, createInvite, addToast } = useApp();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'link'>('link');
  
  useEffect(() => {
    if (!isOpen) return;
    
    if (inviteCode) {
      // Group invite link
      setInviteUrl(`${window.location.origin}/groups?join=${inviteCode}`);
      return;
    }

    if (!inviteUrl && currentUser && !isLoading) {
      const generateLink = async () => {
        setIsLoading(true);
        const url = await createInvite();
        setInviteUrl(url);
        setIsLoading(false);
      };
      generateLink();
    }
  }, [isOpen, inviteUrl, currentUser, createInvite, inviteCode, isLoading]);

  const handleCopy = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addToast('Invite link copied!', { type: 'success' });
    }
  };

  const nameToUse = currentUser?.displayName || 'Your friend';
  const previewMsg = groupName
    ? `${nameToUse} invited you to join ${groupName} on Rec'd. Join with code ${inviteCode}:`
    : `${nameToUse} invited you to Rec'd — recommend movies to your crew, get stamped, and prove your taste.`;

  if (!isOpen) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={groupName ? `Invite to ${groupName}` : "Invite your crew."}
      subtitle="Search people on Rec'd Club, or send an invite link."
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-full min-h-0 relative z-10">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-red/10 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none" />

        <div className="shrink-0 mb-4 relative z-10">
            <div className="flex gap-1 bg-ink/60 border border-border rounded-xl p-1 mt-4">
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'link'
                    ? 'bg-cinema-red text-bone shadow-lg shadow-cinema-red/20'
                    : 'text-muted hover:text-bone'
                }`}
              >
                <Link2 size={14} />
                Invite Link
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'search'
                    ? 'bg-cinema-red text-bone shadow-lg shadow-cinema-red/20'
                    : 'text-muted hover:text-bone'
                }`}
              >
                <Search size={14} />
                Search People
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 pt-4 pb-6 overflow-y-auto min-h-0 flex-1">
            
            {/* Search People Tab */}
            {activeTab === 'search' && (
              <PeopleSearch compact placeholder="Search by name or username..." />
            )}

            {/* Invite Link Tab */}
            {activeTab === 'link' && (
              <div className="space-y-4">
                {/* Preview Box */}
                <div className="bg-ink/40 border border-border rounded-xl p-4 relative group">
                  <div className="absolute -top-2 left-4 px-2 py-0.5 bg-surface border border-border rounded text-[10px] font-bold text-muted uppercase tracking-widest">
                    Message Preview
                  </div>
                  <p className="text-xs text-muted/90 italic leading-relaxed">
                    &ldquo;{previewMsg}&rdquo;
                  </p>
                </div>

                {/* Link + Copy */}
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 block ml-1">
                    Your Invitation Link
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-11 bg-ink/60 border border-border rounded-xl px-4 flex items-center overflow-hidden">
                      <span className="text-xs text-muted truncate">
                        {isLoading ? 'Generating secure link...' : (inviteUrl || 'Loading...')}
                      </span>
                    </div>
                    <button 
                      onClick={handleCopy}
                      disabled={!inviteUrl || isLoading}
                      className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all active:scale-90 shadow-lg ${
                        copied 
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                          : 'bg-cinema-red text-bone hover:bg-cinema-red/90 shadow-cinema-red/20'
                      } disabled:opacity-30`}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* WhatsApp Share */}
                <button 
                  onClick={() => {
                    if (inviteUrl) {
                      window.open(`https://wa.me/?text=${encodeURIComponent(previewMsg + ' ' + inviteUrl)}`, '_blank');
                    }
                  }}
                  disabled={!inviteUrl || isLoading}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] rounded-xl text-sm font-bold hover:bg-[#25D366]/20 transition-all active:scale-[0.98] disabled:opacity-30"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share on WhatsApp
                </button>

                <div className="relative group/mail">
                  <button 
                    disabled
                    className="w-full h-11 flex items-center justify-center gap-2 bg-white/5 border border-border text-muted rounded-xl text-sm font-medium opacity-50 cursor-not-allowed"
                  >
                    <Mail size={16} /> Invite by Email
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/mail:opacity-100 transition-opacity bg-surface/90 rounded-xl">
                    <span className="text-[10px] font-bold text-cinema-red uppercase tracking-widest">Coming Soon</span>
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
    </ModalBase>
  );
}

const X = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
