'use client';

// =====================================================================
// Customer Web Platform — Search & Catalog Listing Page
// =====================================================================

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { SearchResponse } from '@/types';
import { FilterSidebar, FilterState } from '@/components/search/filter-sidebar';
import { SortBar } from '@/components/search/sort-bar';
import { ProductGrid } from '@/components/product/product-grid';
import { CategoryNav } from '@/components/layout/category-nav';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryIdParam = searchParams.get('categoryId') || undefined;

  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('RELEVANCE');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categoryId: categoryIdParam,
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    inStockOnly: undefined,
  });

  // Query search API
  const { data, isLoading } = useQuery<SearchResponse>({
    queryKey: ['search', queryParam, filters, sortBy, page],
    queryFn: () =>
      api.get<SearchResponse>(API_ENDPOINTS.SEARCH, {
        q: queryParam || undefined,
        categoryId: filters.categoryId || undefined,
        brandId: filters.brandId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        minRating: filters.minRating || undefined,
        inStockOnly: filters.inStockOnly || undefined,
        sortBy,
        page,
        size: 16,
      }),
  });

  const products = data?.products || [];
  const facets = data?.facets;
  const totalResults = data?.totalResults || 0;
  const totalPages = data?.totalPages || 1;

  const handleResetFilters = () => {
    setFilters({
      categoryId: undefined,
      brandId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      inStockOnly: undefined,
    });
    setPage(0);
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: undefined }));
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      <CategoryNav activeCategory={filters.categoryId} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile Filter Toggle */}
        <div className="flex md:hidden items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full flex items-center justify-center gap-2 rounded-xl"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className="flex gap-6 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-72 shrink-0 sticky top-20">
            <FilterSidebar
              facets={facets}
              filters={filters}
              onFilterChange={(f) => {
                setFilters(f);
                setPage(0);
              }}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Mobile Filter Overlay */}
          {isMobileFilterOpen && (
            <div className="block md:hidden w-full mb-6">
              <FilterSidebar
                facets={facets}
                filters={filters}
                onFilterChange={(f) => {
                  setFilters(f);
                  setPage(0);
                  setIsMobileFilterOpen(false);
                }}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* Product Listing Main Area */}
          <main className="flex-1 min-w-0">
            <SortBar
              totalCount={totalResults}
              sortBy={sortBy}
              onSortChange={(s) => {
                setSortBy(s);
                setPage(0);
              }}
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              query={queryParam}
            />

            <ProductGrid
              products={products}
              isLoading={isLoading}
              emptyTitle="No Matching Products Found"
              emptyDescription="We couldn't find any products matching your filters. Try clearing some filters to see more results."
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => {
                    setPage((p) => Math.max(0, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>

                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Page {page + 1} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => {
                    setPage((p) => Math.min(totalPages - 1, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading catalog...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
