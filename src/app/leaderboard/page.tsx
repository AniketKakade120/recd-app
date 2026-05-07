'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import PageHeader from '@/components/PageHeader';
import LeaderboardRow from '@/components/LeaderboardRow';

export default function LeaderboardPage() {
  const { leaderboard, currentUser, groups } = useApp();
  const [timeFilter, setTimeFilter] = useState<'overall' | 'week'>('overall');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" subtitle="Taste standings. Friendships may be affected." />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 bg-surface rounded-lg border border-border shrink-0 w-max">
          <button onClick={() => setTimeFilter('overall')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${timeFilter === 'overall' ? 'bg-ink text-bone' : 'text-muted'}`}>All Time</button>
          <button onClick={() => setTimeFilter('week')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${timeFilter === 'week' ? 'bg-ink text-bone' : 'text-muted'}`}>This Week</button>
        </div>
        <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
          className="bg-surface border border-border text-bone text-xs rounded-lg px-3 py-2 outline-none focus:border-cinema-red w-full sm:w-auto">
          <option value="all">All My Groups</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        {leaderboard.map(entry => (
          <LeaderboardRow key={entry.user.id} entry={entry} isCurrentUser={entry.user.id === currentUser?.id} />
        ))}
      </div>
      
      <div className="text-center pt-6 pb-4">
        <p className="text-xs text-muted">Scores based on how accurately you recommend content to others.</p>
      </div>
    </div>
  );
}
