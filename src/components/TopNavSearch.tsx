'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Title } from '@/lib/types';

export default function TopNavSearch() {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!expanded) {
      setQuery('');
      setResults([]);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [expanded]);

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
    setExpanded(false);
    setQuery('');
    router.push(`/title/${title.id}`);
  };

  return (
    <div className="relative flex items-center h-full" ref={wrapperRef}>
      <div 
        className={`flex items-center transition-all duration-300 overflow-hidden rounded-xl ${
          expanded 
            ? 'w-64 bg-ink border border-cinema-red/50 ring-1 ring-cinema-red/30 shadow-lg' 
            : 'w-10 bg-transparent border border-transparent hover:bg-surface/50 cursor-pointer'
        }`}
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
      >
        <button 
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-muted hover:text-bone transition-colors"
          onClick={(e) => {
            if (expanded) {
              e.stopPropagation();
              setExpanded(false);
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies & shows..."
          className={`flex-1 !bg-transparent text-sm text-bone placeholder:text-muted/50 !outline-none !border-0 focus:!border-transparent focus:!ring-0 !ring-0 transition-opacity duration-300 h-10 ${
            expanded ? 'opacity-100 pr-3' : 'opacity-0 w-0 pr-0'
          }`}
        />
        
        {expanded && loading && (
          <div className="flex-shrink-0 w-8 h-full flex items-center justify-center mr-1">
            <div className="w-3 h-3 border-2 border-cinema-red border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results Dropdown */}
      {expanded && (query.length >= 2 || results.length > 0) && (
        <div className="absolute top-full right-0 mt-2 w-[300px] sm:w-[350px] z-50 rounded-2xl bg-ink border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto py-2">
            {results.length > 0 ? (
              results.map((title) => (
                <button
                  key={title.id}
                  onClick={() => handleSelect(title)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className={`w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-surface/50`}>
                    {title.posterUrl && (
                      <img src={title.posterUrl} alt={title.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-bold text-bone truncate">{title.title}</h4>
                    <p className="text-xs text-muted mt-1">
                      {title.releaseYear} • {title.format}
                    </p>
                  </div>
                </button>
              ))
            ) : query.length >= 2 && !loading ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted">No titles found for "{query}"</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
