'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Loader2, Users } from 'lucide-react';
import UserSearchResultCard from './UserSearchResultCard';
import { supabase } from '@/lib/supabase/client';

interface SearchResultUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tasteArchetype: string;
  tasteScore: number;
}

interface PeopleSearchProps {
  placeholder?: string;
  compact?: boolean;
}

export default function PeopleSearch({ 
  placeholder = 'Search people by name or username...', 
  compact = false 
}: PeopleSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const searchPeople = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    // Cancel previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/people/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        signal: abortRef.current.signal,
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Search failed');
        setResults([]);
      } else {
        setResults(data.results || []);
        setError(null);
      }
      setHasSearched(true);
    } catch (err: any) {
      if (err?.name === 'AbortError') return; // Ignore aborted requests
      console.error('[PeopleSearch] Error:', err);
      setError("Couldn't search people. Please try again.");
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchPeople(value);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 pr-4 bg-ink border border-border rounded-xl text-sm text-bone placeholder:text-muted/60 focus:outline-none focus:border-cinema-red/50 focus:ring-1 focus:ring-cinema-red/20 transition-all"
          style={{ paddingLeft: '2.75rem' }}
          autoComplete="off"
          spellCheck={false}
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setHasSearched(false);
              setError(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-bone transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Results / States */}
      <div className={compact ? 'max-h-[320px] overflow-y-auto hide-scrollbar' : ''}>
        {/* Idle state */}
        {!hasSearched && query.length < 2 && !error && (
          <div className="py-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-surface border border-border rounded-2xl flex items-center justify-center">
              <Users size={20} className="text-muted" />
            </div>
            <p className="text-sm text-muted">Find people already on Rec&apos;d Club.</p>
            <p className="text-[10px] text-muted/60 mt-1">Type at least 2 characters to search.</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="py-8 text-center">
            <p className="text-sm text-cinema-red mb-2">{error}</p>
            <button
              onClick={() => searchPeople(query)}
              className="text-xs font-bold text-bone hover:text-cinema-red transition-colors underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty results */}
        {hasSearched && !isLoading && !error && results.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted">No people found.</p>
            <p className="text-[10px] text-muted/60 mt-1">Try a different name or username.</p>
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3 px-1">
              {results.length} {results.length === 1 ? 'person' : 'people'} found
            </p>
            {results.map(user => (
              <UserSearchResultCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
