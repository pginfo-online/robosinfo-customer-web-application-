'use client';

// =====================================================================
// Customer Web Platform — Search & Catalog Filter Sidebar
// =====================================================================

import React from 'react';
import { SearchFacets } from '@/types';
import { Button } from '@/components/ui/button';
import { Star, Check, RotateCcw, Filter } from 'lucide-react';
import { formatPaisa } from '@/lib/utils';

export interface FilterState {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
}

interface FilterSidebarProps {
  facets?: SearchFacets;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  className?: string;
}

export function FilterSidebar({
  facets,
  filters,
  onFilterChange,
  onResetFilters,
  className,
}: FilterSidebarProps) {
  const categories = facets?.categories || [];
  const brands = facets?.brands || [];

  return (
    <aside className={`w-full space-y-6 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs ${className || ''}`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Filters</h3>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Clear All
        </button>
      </div>

      {/* ─── 1. In Stock Only Toggle ─────────────────────────────────── */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            In Stock Only
          </span>
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) =>
              onFilterChange({ ...filters, inStockOnly: e.target.checked ? true : undefined })
            }
            className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300"
          />
        </label>
      </div>

      {/* ─── 2. Categories ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Categories
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = filters.categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      ...filters,
                      categoryId: isSelected ? undefined : cat.id,
                    })
                  }
                  className={`flex items-center justify-between w-full p-2 rounded-xl text-xs font-medium transition-colors text-left ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. Brands ───────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Brands
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const isSelected = filters.brandId === brand.id;
              return (
                <label
                  key={brand.id}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onFilterChange({
                          ...filters,
                          brandId: isSelected ? undefined : brand.id,
                        })
                      }
                      className="h-3.5 w-3.5 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="truncate">{brand.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                    {brand.count}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 4. Customer Rating ──────────────────────────────────────── */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Customer Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => {
            const isSelected = filters.minRating === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    minRating: isSelected ? undefined : r,
                  })
                }
                className={`flex items-center gap-2 w-full p-2 rounded-xl text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                  <span>{r}★</span>
                  <Star className="h-2.5 w-2.5 fill-white" />
                </div>
                <span>& Above</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Price Range Filter ────────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">MIN</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice ? filters.minPrice / 100 : ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) * 100 : undefined,
                })
              }
              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1">MAX</label>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ? filters.maxPrice / 100 : ''}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) * 100 : undefined,
                })
              }
              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
