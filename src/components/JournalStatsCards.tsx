'use client';

import type { JournalStats } from '@/lib/types';

interface JournalStatsCardsProps {
  stats: JournalStats;
}

export default function JournalStatsCards({ stats }: JournalStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-surface border border-border p-5 rounded-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Total Logged</p>
        <p className="text-3xl font-editorial font-bold text-bone">{stats.loggedCount}</p>
      </div>
      <div className="bg-surface border border-border p-5 rounded-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Avg Rating</p>
        <p className="text-3xl font-editorial font-bold text-cinema-red">{stats.avgRating.toFixed(1)}</p>
      </div>
      <div className="bg-surface border border-border p-5 rounded-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Top Genre</p>
        <p className="text-xl font-bold text-bone truncate leading-tight mt-1">{stats.topGenre}</p>
      </div>
      <div className="bg-surface border border-border p-5 rounded-2xl">
        <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Top Stamp</p>
        <p className="text-sm font-bold text-bone uppercase tracking-wider mt-1">{stats.topStamp}</p>
      </div>
    </div>
  );
}
