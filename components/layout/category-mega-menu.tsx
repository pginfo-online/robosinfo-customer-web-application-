'use client';

// =====================================================================
// Customer Web Platform — Category Mega-Menu Grid
// (Matching Flipkart Reference Screenshot #2)
// =====================================================================

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  Headphones,
  Laptop,
  Tablet,
  Watch,
  Gamepad2,
  HardDrive,
  Cable,
  Camera,
  BatteryCharging,
  Home,
  Speaker,
  Monitor,
  Activity,
  Printer,
  X,
  ArrowRight,
} from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { ELECTRONICS_SUB_CATEGORIES } from '@/lib/constants';

const subIconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-6 w-6 text-amber-500" />,
  Headphones: <Headphones className="h-6 w-6 text-indigo-500" />,
  Laptop: <Laptop className="h-6 w-6 text-blue-500" />,
  Tablet: <Tablet className="h-6 w-6 text-sky-500" />,
  Watch: <Watch className="h-6 w-6 text-teal-500" />,
  Gamepad2: <Gamepad2 className="h-6 w-6 text-purple-500" />,
  HardDrive: <HardDrive className="h-6 w-6 text-slate-500" />,
  Cable: <Cable className="h-6 w-6 text-orange-500" />,
  Camera: <Camera className="h-6 w-6 text-rose-500" />,
  BatteryCharging: <BatteryCharging className="h-6 w-6 text-emerald-500" />,
  Home: <Home className="h-6 w-6 text-pink-500" />,
  Speaker: <Speaker className="h-6 w-6 text-violet-500" />,
  Monitor: <Monitor className="h-6 w-6 text-cyan-500" />,
  Activity: <Activity className="h-6 w-6 text-red-500" />,
  Printer: <Printer className="h-6 w-6 text-blue-600" />,
};

export function CategoryMegaMenu() {
  const { isMegaMenuOpen, setMegaMenuOpen, selectedCategorySlug } = useUIStore();

  if (!isMegaMenuOpen) return null;

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl transition-all animate-in fade-in-0 duration-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Explore Subcategories
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize">
              {selectedCategorySlug || 'Electronics'} Hub
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/search?categoryId=${selectedCategorySlug || 'electronics'}`}
              onClick={() => setMegaMenuOpen(false)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All in {selectedCategorySlug || 'Electronics'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setMegaMenuOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Icon Grid (Matching Image 2 rounded cards) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3 sm:gap-4">
          {ELECTRONICS_SUB_CATEGORIES.map((item, idx) => (
            <Link
              key={idx}
              href={`/search?q=${encodeURIComponent(item.name)}`}
              onClick={() => setMegaMenuOpen(false)}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-100/60 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-blue-100/60 dark:border-slate-700/60 transition-all hover:scale-105 hover:shadow-sm"
            >
              {/* Soft rounded icon box */}
              <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs mb-2 group-hover:shadow-md transition-shadow">
                {subIconMap[item.icon] || <Zap className="h-6 w-6 text-blue-500" />}
              </div>

              {/* Title */}
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                {item.name}
              </span>

              {/* Tag / Offer */}
              {item.tag && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {item.tag}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
