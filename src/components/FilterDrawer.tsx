'use client';

import { useState } from 'react';
import CategorySelector from './CategorySelector';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  genres: string[];
  moods: string[];
  onApply: (filters: FilterState) => void;
}

export interface FilterState {
  genres: string[];
  moods: string[];
  format: string[];
  watched: 'all' | 'watched' | 'unwatched';
}

const FORMAT_OPTIONS = ['Movie', 'Series', 'Documentary', 'Anime'];

export default function FilterDrawer({ isOpen, onClose, genres, moods, onApply }: FilterDrawerProps) {
  const [filters, setFilters] = useState<FilterState>({
    genres: [], moods: [], format: [], watched: 'all',
  });

  const activeCount = filters.genres.length + filters.moods.length + filters.format.length + (filters.watched !== 'all' ? 1 : 0);

  const handleApply = () => { onApply(filters); onClose(); };
  const handleClear = () => setFilters({ genres: [], moods: [], format: [], watched: 'all' });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface border-l border-border h-full overflow-y-auto page-enter flex flex-col">
        <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-bone font-editorial">Filters</h2>
          <button onClick={onClose} className="text-muted hover:text-bone text-lg">✕</button>
        </div>

        <div className="p-4 space-y-6 flex-1">
          <CategorySelector title="Genres" options={genres} selected={filters.genres} onChange={g => setFilters(f => ({ ...f, genres: g }))} />
          <CategorySelector title="Moods" options={moods} selected={filters.moods} onChange={m => setFilters(f => ({ ...f, moods: m }))} />
          <CategorySelector title="Format" options={FORMAT_OPTIONS} selected={filters.format} onChange={fm => setFilters(f => ({ ...f, format: fm }))} />

          <div>
            <h3 className="text-sm font-semibold text-bone mb-3">Status</h3>
            <div className="flex gap-2">
              {(['all', 'unwatched', 'watched'] as const).map(opt => (
                <button key={opt} onClick={() => setFilters(f => ({ ...f, watched: opt }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all btn-press capitalize ${
                    filters.watched === opt ? 'bg-cinema-red border-cinema-red text-bone' : 'bg-surface border-border text-muted hover:text-bone'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-border p-4 flex gap-3">
          <button onClick={handleClear} className="flex-1 py-2.5 rounded-lg bg-surface-hover border border-border text-muted text-sm font-medium btn-press hover:text-bone">
            Clear{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <button onClick={handleApply} className="flex-1 py-2.5 rounded-lg bg-cinema-red text-bone text-sm font-semibold btn-press hover:bg-cinema-red/90">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
