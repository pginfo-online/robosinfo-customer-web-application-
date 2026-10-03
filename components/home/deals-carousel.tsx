'use client';

// =====================================================================
// Customer Web Platform — Deals Carousel Component
// (Matching Flipkart Reference Screenshot #1)
// =====================================================================

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { SearchProductCard, Product } from '@/types';
import { ProductCard } from '@/components/product/product-card';

interface DealsCarouselProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  products: (SearchProductCard | Product)[];
  specBadgesMap?: Record<string, string[]>;
}

export function DealsCarousel({
  title,
  subtitle = 'Top rated offers with Lowest Price Guarantee',
  viewAllLink = '/search',
  products,
  specBadgesMap = {},
}: DealsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Default mock spec badges if product doesn't have custom ones
  const defaultSpecs = [
    'Segment\'s FASTEST Processor',
    '7000mAh Battery • 45W Turbo',
    '144Hz AMOLED Display • IP64',
  ];

  if (!products || products.length === 0) return null;

  return (
    <section className="relative w-full my-8 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs">
      {/* ─── Header Bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={viewAllLink}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-2 rounded-xl transition-colors"
          >
            <span>View All Deals</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {/* Navigation Arrows (Matching Image 1 Right Arrow Button) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-xs transition-transform active:scale-90"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-transform active:scale-90"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Horizontal Scroll Container (Image 1) ─────────────────── */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth -mx-1 px-1"
      >
        {products.map((product, idx) => {
          const specs = specBadgesMap[product.id] || defaultSpecs;
          return (
            <div
              key={product.id}
              className="w-[240px] sm:w-[260px] md:w-[280px] shrink-0 flex flex-col"
            >
              <ProductCard product={product} specBadges={specs} priority={idx < 2} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
