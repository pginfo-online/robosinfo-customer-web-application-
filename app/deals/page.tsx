'use client';

// =====================================================================
// Customer Web Platform — Deals, Offers & Coupons Showcase Page
// =====================================================================

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Tag,
  Sparkles,
  Percent,
  Copy,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Coupon } from '@/types';
import { Button } from '@/components/ui/button';
import { formatPaisa } from '@/lib/utils';
import { toast } from 'sonner';

export default function DealsPage() {
  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ['coupons', 'active'],
    queryFn: () => api.get<Coupon[]>(API_ENDPOINTS.COUPONS_ACTIVE),
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* ─── Mega Deals Hero ────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-950 p-8 sm:p-12 text-white shadow-xl">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 fill-slate-950" />
            Grand Festive Offers
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Extra Savings on Every Order
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Discover active voucher codes, instant bank discounts, and limited-time festival offers across smartphones, electronics, and lifestyle.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="rounded-2xl font-bold bg-white text-slate-950 hover:bg-slate-100">
              <Link href="/search?sortBy=PRICE_ASC">Shop Lowest Price Deals</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl font-bold border-white/40 text-white hover:bg-white/10">
              <Link href="/search?categoryId=mobiles">Explore Smartphones</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Active Coupon Cards Grid ───────────────────────────────── */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Available Vouchers
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Apply at Checkout for Instant Discounts
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : !coupons || coupons.length === 0 ? (
          <div className="p-10 text-center text-slate-500 border rounded-3xl border-dashed">
            Check back soon for new coupon codes and exclusive offers!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500 transition-colors"
              >
                {/* Decorative Pill Top Right */}
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-2xl">
                  {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `FLAT ${formatPaisa(c.discountValue)}`}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <span className="font-mono text-lg font-black text-slate-900 dark:text-white">
                      {c.code}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                    <p>• Min order value: {formatPaisa(c.minOrderValuePaisa)}</p>
                    {c.maxDiscountCapPaisa && (
                      <p>• Maximum discount capped at {formatPaisa(c.maxDiscountCapPaisa)}</p>
                    )}
                  </div>
                </div>

                {/* Copy Code CTA */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyCode(c.code)}
                  className="w-full rounded-xl font-bold text-xs gap-1.5 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Code: {c.code}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bank Partner Discounts ─────────────────────────────────── */}
      <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ongoing Partner Bank & Card Offers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">HDFC Bank Credit Cards</span>
            <p className="text-slate-500">10% Instant Discount up to ₹1,500 on minimum purchase of ₹5,000.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">ICICI Bank NetBanking</span>
            <p className="text-slate-500">Flat ₹500 cashback on orders above ₹10,000.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white">No Cost EMI Options</span>
            <p className="text-slate-500">Zero interest EMI available for 3, 6, and 9 month tenures on select electronics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
