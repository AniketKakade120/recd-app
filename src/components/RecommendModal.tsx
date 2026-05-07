'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import type { Title, MoodTag } from '@/lib/types';
import { MOOD_TAGS } from '@/lib/types';
import UserAvatar from './UserAvatar';

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: Title;
}

export default function RecommendModal({ isOpen, onClose, title }: RecommendModalProps) {
  const { currentUser, groups, getGroupMembers, addRecommendation, getUser } = useApp();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToGroup, setSendToGroup] = useState(false);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(75);
  const [selectedMoods, setSelectedMoods] = useState<MoodTag[]>([]);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [sending, setSending] = useState(false);

  if (!isOpen || !currentUser) return null;

  const selectedGroupMembers = selectedGroupId ? getGroupMembers(selectedGroupId).filter(m => m.id !== currentUser.id) : [];

  const allFriends = Array.from(new Set(
    groups.flatMap(g => getGroupMembers(g.id))
          .filter(m => m.id !== currentUser.id)
          .map(m => m.id)
  )).map(id => getUser(id)).filter(Boolean);

  const toggleMood = (mood: MoodTag) => {
    setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      addRecommendation({
        id: `rec-${Date.now()}`,
        titleId: title.id,
        groupId: selectedGroupId || undefined,
        recommendedBy: currentUser.id,
        recommendedToUserIds: sendToGroup ? selectedGroupMembers.map(m => m.id) : selectedRecipients,
        recommendedToGroup: sendToGroup,
        reason,
        confidenceScore: confidence,
        moodTags: selectedMoods,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSending(false);
      setStep('success');
    }, 800);
  };

  const canSend = reason.trim().length > 0 && (sendToGroup || selectedRecipients.length > 0);

  const confLabel = confidence >= 86 ? 'Certified good call' : confidence >= 61 ? 'Pretty confident' : confidence >= 31 ? 'I see the vision' : 'Risky take';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-4xl bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-ink/50 sticky top-0 z-10">
              <p className="font-bold text-sm text-bone">Recommend this</p>
              <button onClick={onClose} className="text-muted hover:text-bone p-1 transition-colors">✕</button>
            </div>

            <div className="p-5 md:p-6 space-y-6">
              {/* Selected Title Preview */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-ink border border-border">
                <div className={`w-14 h-[84px] rounded-lg overflow-hidden shrink-0 border border-border/50 ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                  {title.posterUrl && <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-bone truncate">{title.title}</h3>
                  <p className="text-xs text-muted">{title.releaseYear} · {title.format || 'Movie'} · {title.genres.slice(0, 2).join(', ')}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cinema-red shrink-0"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>

              {/* Select Crew */}
              <div>
                <label className="text-xs font-bold text-bone uppercase tracking-wider mb-2 block">Send to Crew</label>
                <div className="flex gap-2 flex-wrap">
                  {groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGroupId(g.id === selectedGroupId && sendToGroup ? null : g.id);
                        setSendToGroup(true);
                        setSelectedRecipients([]);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                        selectedGroupId === g.id && sendToGroup
                          ? 'bg-cinema-red border-cinema-red text-bone'
                          : 'bg-ink border-border text-muted hover:border-border-strong hover:text-bone'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Or Direct to Friend */}
              <div>
                <label className="text-xs font-bold text-bone uppercase tracking-wider mb-2 block">Or direct to friend</label>
                <div className="flex gap-2 flex-wrap max-h-[140px] overflow-y-auto hide-scrollbar pr-2 pb-2">
                  {allFriends.map(friend => (
                    <button
                      key={friend!.id}
                      onClick={() => {
                        setSelectedGroupId(null);
                        setSendToGroup(false);
                        toggleRecipient(friend!.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                        selectedRecipients.includes(friend!.id)
                          ? 'bg-cinema-red border-cinema-red text-bone'
                          : 'bg-ink border-border text-muted hover:border-border-strong hover:text-bone'
                      }`}
                    >
                      <UserAvatar name={friend!.displayName} size="xs" />
                      {friend!.displayName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-bold text-bone uppercase tracking-wider mb-2 block">Why should they watch this?</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="This feels painfully you. You'll either love this or block me."
                  className="w-full h-20 p-3 bg-ink border border-border rounded-xl text-sm text-bone placeholder:text-muted/50 focus:outline-none focus:border-cinema-red/50 resize-none transition-colors"
                />
              </div>

              {/* Confidence Score */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-bone uppercase tracking-wider">Confidence</label>
                  <span className="text-xs font-semibold text-cinema-red">{confidence}% — {confLabel}</span>
                </div>
                <input
                  type="range" min="10" max="100" value={confidence}
                  onChange={e => setConfidence(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-border cursor-pointer accent-cinema-red"
                />
              </div>

              {/* Mood Chips */}
              <div>
                <label className="text-xs font-bold text-bone uppercase tracking-wider mb-2 block">Mood tags</label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_TAGS.map(mood => (
                    <button
                      key={mood}
                      onClick={() => toggleMood(mood)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                        selectedMoods.includes(mood)
                          ? 'bg-cinema-red border-cinema-red text-bone'
                          : 'bg-ink border-border text-muted hover:text-bone'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Send CTA */}
              <button
                onClick={handleSend}
                disabled={!canSend || sending}
                className="w-full py-4 bg-cinema-red text-bone font-bold rounded-xl disabled:opacity-40 transition-all hover:bg-cinema-red/90 active:scale-[0.98] shadow-lg text-sm flex items-center justify-center gap-2"
              >
                {sending && <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />}
                {sending ? 'Sending…' : 'Send Recommendation'}
              </button>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <span className="text-5xl block mb-4">🎬</span>
            <h2 className="text-2xl font-bold text-bone font-editorial mb-2">Recommendation sent.</h2>
            <p className="text-sm text-muted mb-6">Ego pending.</p>
            <div className="flex gap-3 max-w-xs mx-auto">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-cinema-red text-bone font-bold rounded-xl hover:bg-cinema-red/90 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
