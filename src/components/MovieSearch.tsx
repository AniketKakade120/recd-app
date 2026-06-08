'use client';

import { useState, useEffect, useRef } from 'react';
import { Clapperboard } from 'lucide-react';
import type { Title } from '@/lib/types';

interface MovieSearchProps {
  onSelect: (title: Title) => void;
  placeholder?: string;
  className?: string;
}

export default function MovieSearch({ onSelect, placeholder = "Search for a movie or show...", className = "" }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (title: Title) => {
    onSelect(title);
    setQuery('');
    setResults([]);
    setFocused(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-muted z-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="w-full py-4 !pr-12 bg-ink border border-border rounded-2xl text-bone text-base placeholder:text-muted/50 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all shadow-2xl"
          style={{ paddingLeft: '3.5rem' }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-5 flex items-center">
            <div className="w-4 h-4 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {focused && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-3 rounded-2xl bg-surface border border-border shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border/30">
            {results.length > 0 ? (
              results.map((title) => (
                <button
                  key={title.id}
                  onClick={() => handleSelect(title)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-ink/50 transition-all group text-left"
                >
                  <div className={`w-12 h-18 rounded-lg overflow-hidden shrink-0 border border-border/30 bg-ink ${!title.posterUrl ? `poster-gradient-${title.posterGradient}` : ''}`}>
                    {title.posterUrl && (
                      <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-bone truncate group-hover:text-cinema-red transition-colors">{title.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] text-muted font-medium">{title.releaseYear}</p>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <p className="text-[10px] text-muted font-medium">{title.format}</p>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <p className="text-[10px] text-cinema-red font-bold">{title.genres.slice(0, 2).join(', ')}</p>
                    </div>
                    {title.overview && (
                      <p className="text-[10px] text-muted/60 line-clamp-1 mt-1 font-normal italic">"{title.overview}"</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">Select →</span>
                </button>
              ))
            ) : query.length >= 2 && !loading ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Clapperboard className="w-8 h-8 text-muted/60 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-muted font-medium">No titles found for "{query}"</p>
                <p className="text-xs text-muted/50 mt-1">Try a different search term.</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
