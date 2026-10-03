'use client';

// =====================================================================
// Customer Web Platform — Main Marketplace Homepage
// =====================================================================

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { SearchResponse, Product } from '@/types';
import { CategoryNav } from '@/components/layout/category-nav';
import { CategoryMegaMenu } from '@/components/layout/category-mega-menu';
import { HeroBanner } from '@/components/home/hero-banner';
import { DealsCarousel } from '@/components/home/deals-carousel';
import { FeaturedShowcase } from '@/components/home/featured-showcase';
import { ProductGrid } from '@/components/product/product-grid';
import { TrustBadges } from '@/components/common/trust-badges';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  // 1. Fetch Featured / Deals products
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      try {
        const res = await api.get<Product[]>(API_ENDPOINTS.PRODUCT_FEATURED, { limit: 10 });
        if (res && res.length > 0) return res;
        // Fallback to general search if featured is empty
        const searchRes = await api.get<SearchResponse>(API_ENDPOINTS.SEARCH, { size: 10 });
        return (searchRes.products || []) as any;
      } catch {
        // Safe fallback
        const searchRes = await api.get<SearchResponse>(API_ENDPOINTS.SEARCH, { size: 10 });
        return (searchRes.products || []) as any;
      }
    },
  });

  // 2. Fetch Catalog Products for Trending Grid
  const { data: searchData, isLoading: isCatalogLoading } = useQuery<SearchResponse>({
    queryKey: ['products', 'trending'],
    queryFn: () =>
      api.get<SearchResponse>(API_ENDPOINTS.SEARCH, {
        sortBy: 'RELEVANCE',
        size: 12,
      }),
  });

  const catalogProducts = searchData?.products || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── 1. Category Bar (Image 3) ─────────────────────────────────── */}
      <CategoryNav />

      {/* ─── 2. MegaMenu Drawer (Image 2) ─────────────────────────────── */}
      <CategoryMegaMenu />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-16">
        {/* ─── 3. Festive Hero Banner (Image 3) ────────────────────────── */}
        <HeroBanner />

        {/* ─── 4. Trust Badges Bar ─────────────────────────────────────── */}
        <TrustBadges />

        {/* ─── 5. Deals of the Day Carousel (Image 1) ─────────────────── */}
        <DealsCarousel
          title="Best Deals on Mobiles & Tech"
          subtitle="Top rated flagships with ₹0 Down Payment & No Cost EMI"
          viewAllLink="/search?categoryId=mobiles"
          products={featuredProducts && featuredProducts.length > 0 ? featuredProducts : catalogProducts.slice(0, 8)}
        />

        {/* ─── 6. Category Spotlights ──────────────────────────────────── */}
        <FeaturedShowcase />

        {/* ─── 7. Big Discount Coupons Promo Banner ─────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-950 p-6 sm:p-10 my-8 text-white border border-indigo-800/60 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Tag className="h-3.5 w-3.5" /> Extra Member Savings
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Unlock Up to ₹2,500 Off with Verified Promo Codes
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Apply code <span className="font-extrabold text-amber-400 underline">WELCOME10</span> or <span className="font-extrabold text-amber-400 underline">FESTIVE20</span> during checkout for instant discounts.
            </p>
            <div className="pt-2">
              <Link
                href="/deals"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-950 font-extrabold text-xs hover:bg-slate-100 transition-all"
              >
                <span>View All Offers & Coupons</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 8. Trending & Popular Products Grid ─────────────────────── */}
        <section className="my-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Trending Now Across India
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Highest rated customer favorites with verified buyer reviews
              </p>
            </div>

            <Link
              href="/search"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Explore All Products</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ProductGrid
            products={catalogProducts}
            isLoading={isCatalogLoading}
            emptyTitle="Catalog Initializing"
            emptyDescription="Products are being synchronized. Please refresh or explore categories above."
          />
        </section>
      </main>
    </div>
  );
}
