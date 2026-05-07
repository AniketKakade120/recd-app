'use client';

import { useState } from 'react';
import type { BadgeType } from '@/lib/types';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  inviterName?: string;
}

export default function InviteModal({ isOpen, onClose, groupName, inviterName = 'Aniket' }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const inviteLink = 'https://recd.app/invite/ABC123';

  const previewMsg = groupName
    ? `${inviterName} invited you to join ${groupName} on Rec'd — recommend movies, stamp good picks, and settle who actually has taste.`
    : `${inviterName} invited you to Rec'd — recommend movies to your crew, get stamped, and prove your taste.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface border border-border rounded-t-2xl md:rounded-2xl p-6 slide-up md:mx-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-bone font-editorial">Bring your crew in.</h3>
            <p className="text-xs text-muted mt-0.5">Rec&apos;d gets better when your friends join.</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-bone text-xl leading-none p-1">✕</button>
        </div>

        {/* Preview */}
        <div className="bg-ink/60 border border-border rounded-xl p-3 mb-4 text-xs text-muted/80 italic leading-relaxed">
          &ldquo;{previewMsg}&rdquo;
        </div>

        {/* Invite link */}
        <div className="flex gap-2 mb-3">
          <input type="text" readOnly value={inviteLink} className="flex-1 text-xs text-muted truncate" />
          <button onClick={handleCopy}
            className={`px-3 py-2 rounded-lg text-xs font-bold btn-press shrink-0 transition-colors ${
              copied ? 'bg-cinema-red/20 text-cinema-red border border-cinema-red/30' : 'bg-cinema-red text-bone hover:bg-cinema-red/90'
            }`}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* WhatsApp */}
        <a href={`https://wa.me/?text=${encodeURIComponent(previewMsg + ' ' + inviteLink)}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] rounded-lg text-sm font-medium hover:bg-[#25D366]/20 transition-colors btn-press mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Share on WhatsApp
        </a>

        {/* Email */}
        <div className="flex gap-2">
          <input type="email" placeholder="friend@email.com" value={email} onChange={e => setEmail(e.target.value)}
            className="flex-1 text-xs" />
          <button
            disabled={!email.includes('@')}
            className="px-3 py-2 bg-surface-hover border border-border text-bone text-xs font-medium rounded-lg hover:bg-warm-grey transition-colors btn-press disabled:opacity-40 shrink-0">
            Invite
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-4 text-xs text-muted hover:text-bone transition-colors py-1.5">
          Skip for now
        </button>
      </div>
    </div>
  );
}
