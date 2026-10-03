import React from 'react';
import { ArrowUpDown, X } from 'lucide-react';
import { FilterState } from './filter-sidebar';

interface SortBarProps {
  totalCount: number;
  sortBy: string;
  onSortChange: (sort: string) => void;
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState) => void;
  categoryName?: string;
  query?: string;
}

export function SortBar({
  totalCount,
  sortBy,
  onSortChange,
  filters,
  onRemoveFilter,
  categoryName,
  query,
}: SortBarProps) {
  const sortOptions = [
    { label: 'Relevance', value: 'RELEVANCE' },
    { label: 'Price -- Low to High', value: 'PRICE_LOW_HIGH' },
    { label: 'Price -- High to Low', value: 'PRICE_HIGH_LOW' },
    { label: 'Customer Rating', value: 'RATING' },
    { label: 'Newest Arrivals', value: 'NEWEST' },
  ];

  return (
    <div className="flex flex-col gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Results Count */}
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {query ? (
              <>Showing results for &quot;<span className="text-blue-600">{query}</span>&quot;</>
            ) : categoryName ? (
              categoryName
            ) : (
              'All Products'
            )}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            ({totalCount} {totalCount === 1 ? 'item' : 'items'} found)
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-blue-600" /> Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(filters.categoryId ||
        filters.brandId ||
        filters.minRating ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.inStockOnly) && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400">Active Filters:</span>

          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              In Stock Only
              <button type="button" onClick={() => onRemoveFilter('inStockOnly')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.minRating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              {filters.minRating}★ & Above
              <button type="button" onClick={() => onRemoveFilter('minRating')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {(filters.minPrice || filters.maxPrice) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              Price Filter
              <button
                type="button"
                onClick={() => {
                  onRemoveFilter('minPrice');
                  onRemoveFilter('maxPrice');
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
