'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Plus } from 'lucide-react';
import JournalEntryCard from '@/components/JournalEntryCard';
import JournalStatsCards from '@/components/JournalStatsCards';
import LogMovieFlow from '@/components/LogMovieFlow';
export default function JournalPage() {
  const { currentUser, journalEntries, getJournalStats, loading } = useApp();
  const [showLogFlow, setShowLogFlow] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-ink flex items-center justify-center"><div className="w-8 h-8 border-4 border-cinema-red/30 border-t-cinema-red rounded-full animate-spin" /></div>;
  }

  const userEntries = currentUser ? journalEntries.filter(e => e.userId === currentUser.id) : [];
  const stats = currentUser ? getJournalStats(currentUser.id) : { loggedCount: 0, avgRating: 0, topGenre: '-', topStamp: '-' };

  return (
    <div className="min-h-screen bg-ink pt-safe pb-24 lg:pb-safe max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-8">
        <div>
          <h1 className="text-4xl font-editorial font-bold text-bone mb-2">Verdict Journal</h1>
          <p className="text-muted text-sm">Your personal movie & show diary. Build your Taste Profile.</p>
        </div>
        <button
          onClick={() => {
            if (!currentUser) window.location.href = '/login';
            else setShowLogFlow(true);
          }}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-bone text-ink rounded-xl font-bold uppercase tracking-widest text-xs btn-press hover:bg-white transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus size={16} />
          Log a Watch
        </button>
      </div>

      {/* Stats */}
      {userEntries.length > 0 && (
        <JournalStatsCards stats={stats} />
      )}

      {/* Content */}
      {userEntries.length === 0 ? (
        <div className="mt-16 text-center max-w-md mx-auto p-8 rounded-3xl border border-white/5 bg-surface">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="text-white/40" size={32} />
          </div>
          <h2 className="text-2xl font-editorial font-bold text-bone mb-3">Your Journal is Empty</h2>
          <p className="text-muted text-sm leading-relaxed mb-8">
            Start logging the movies and shows you watch alone. Rate them, add a stamp, and write a short verdict to build out your Taste Profile.
          </p>
          <button
            onClick={() => setShowLogFlow(true)}
            className="w-full py-4 bg-cinema-red text-bone rounded-xl font-bold tracking-widest uppercase text-sm btn-press transition-colors hover:bg-cinema-red/90"
          >
            Log Your First Title
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userEntries.map(entry => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      <LogMovieFlow isOpen={showLogFlow} onClose={() => setShowLogFlow(false)} />
    </div>
  );
}
