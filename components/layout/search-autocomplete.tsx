'use client';

// =====================================================================
// Customer Web Platform — Rich Search Autocomplete Dropdown
// (Matching Flipkart Reference Screenshot #4)
// =====================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, X } from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { SearchSuggestionResponse, SearchSuggestionItem } from '@/types';
import { formatPaisa } from '@/lib/utils';
import Image from 'next/image';

interface SearchAutocompleteProps {
  initialQuery?: string;
  onSearchSubmit?: (q: string) => void;
  className?: string;
}

export function SearchAutocomplete({
  initialQuery = '',
  onSearchSubmit,
  className,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [items, setItems] = useState<SearchSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trending default searches when input is focused with empty query
  const trendingSearches = [
    'Smartphones 5G',
    'Wireless Earbuds',
    'Gaming Laptops',
    'Sneakers',
    'Smart Watches',
    'Noise Cancelling Headphones',
  ];

  // Fetch suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setItems([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get<SearchSuggestionResponse>(API_ENDPOINTS.SEARCH_SUGGEST, {
          q: query.trim(),
        });
        setSuggestions(res.suggestions || []);
        setItems(res.items || []);
      } catch {
        // Fallback gracefully
        setSuggestions([]);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className || ''}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-4 h-4 w-4 text-blue-600 dark:text-blue-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for Products, Brands and More"
          className="w-full h-11 pl-11 pr-10 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 transition-all outline-hidden shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setItems([]);
            }}
            className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Floating Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[480px] overflow-y-auto">
          {/* Case 1: Empty query -> show Trending Searches */}
          {!query.trim() && (
            <div className="p-3">
              <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                Trending Searches
              </div>
              <div className="mt-1 space-y-0.5">
                {trendingSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left font-medium transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Case 2: Matching Query -> Show Rich Items and Keyword Suggestions (Image 4) */}
          {query.trim() && (
            <div>
              {/* Product Match Items with thumbnail and category label */}
              {items.length > 0 && (
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Products & Categories
                  </div>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        if (item.slug) {
                          router.push(`/products/${item.slug}`);
                        } else {
                          handleSearch(item.text);
                        }
                      }}
                      className="flex items-center gap-3.5 w-full p-2 rounded-xl hover:bg-blue-50/60 dark:hover:bg-slate-800/80 transition-colors text-left group"
                    >
                      <div className="h-11 w-11 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.text}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        ) : (
                          <Search className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                          {item.text}
                        </div>
                        {item.categoryName && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            in {item.categoryName}
                          </div>
                        )}
                      </div>
                      {item.minPricePaisa && (
                        <div className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                          {formatPaisa(item.minPricePaisa)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Keyword text suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2 space-y-0.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                    Suggestions
                  </div>
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(sug);
                        handleSearch(sug);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left font-medium transition-colors"
                    >
                      <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {!isLoading && items.length === 0 && suggestions.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  Press Enter to search for &quot;<span className="font-semibold text-slate-800 dark:text-white">{query}</span>&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
