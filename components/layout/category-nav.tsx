'use client';

// =====================================================================
// Customer Web Platform — Category Navigation Bar
// (Matching Flipkart Reference Screenshot #3 & #1)
// =====================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Shirt,
  Smartphone,
  Laptop,
  Sparkle,
  Lamp,
  Tv,
  Baby,
  Dumbbell,
  Armchair,
  BookOpen,
  Bike,
  ChevronDown,
} from 'lucide-react';
import { HEADER_CATEGORIES } from '@/lib/constants';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-5 w-5 text-indigo-500" />,
  Shirt: <Shirt className="h-5 w-5 text-blue-500" />,
  Smartphone: <Smartphone className="h-5 w-5 text-sky-500" />,
  Laptop: <Laptop className="h-5 w-5 text-violet-500" />,
  Sparkle: <Sparkle className="h-5 w-5 text-pink-500" />,
  Lamp: <Lamp className="h-5 w-5 text-amber-500" />,
  Tv: <Tv className="h-5 w-5 text-teal-500" />,
  Baby: <Baby className="h-5 w-5 text-rose-500" />,
  Dumbbell: <Dumbbell className="h-5 w-5 text-emerald-500" />,
  Armchair: <Armchair className="h-5 w-5 text-orange-500" />,
  BookOpen: <BookOpen className="h-5 w-5 text-cyan-500" />,
  Bike: <Bike className="h-5 w-5 text-red-500" />,
};

interface CategoryNavProps {
  activeCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export function CategoryNav({ activeCategory, onSelectCategory }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMegaMenuOpen, setMegaMenuOpen, selectedCategorySlug } = useUIStore();

  const handleCategoryClick = (slug: string, e: React.MouseEvent) => {
    if (slug === 'electronics' || slug === 'mobiles' || slug === 'fashion') {
      e.preventDefault();
      if (isMegaMenuOpen && selectedCategorySlug === slug) {
        setMegaMenuOpen(false);
      } else {
        setMegaMenuOpen(true, slug);
      }
    } else {
      setMegaMenuOpen(false);
      if (onSelectCategory) {
        onSelectCategory(slug);
      } else {
        router.push(`/search?categoryId=${slug}`);
      }
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2.5">
          {HEADER_CATEGORIES.map((cat) => {
            const isSelected =
              activeCategory === cat.slug ||
              selectedCategorySlug === cat.slug ||
              (pathname === '/' && cat.slug === 'for-you' && !activeCategory && !selectedCategorySlug);

            return (
              <button
                key={cat.slug}
                type="button"
                onClick={(e) => handleCategoryClick(cat.slug, e)}
                className={cn(
                  'group flex flex-col items-center justify-center min-w-[72px] sm:min-w-[84px] py-1 px-2 rounded-xl transition-all cursor-pointer relative shrink-0',
                  isSelected
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                )}
              >
                {/* Category Icon Container */}
                <div
                  className={cn(
                    'h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center transition-all duration-200 mb-1.5',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 ring-2 ring-blue-500 scale-105'
                      : 'bg-slate-50 dark:bg-slate-800/80 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 group-hover:scale-105'
                  )}
                >
                  {iconMap[cat.icon] || <Sparkles className="h-5 w-5 text-blue-500" />}
                </div>

                {/* Category Label */}
                <span className="text-xs text-center whitespace-nowrap flex items-center gap-0.5">
                  {cat.name}
                  {(cat.slug === 'electronics' || cat.slug === 'mobiles' || cat.slug === 'fashion') && (
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  )}
                </span>

                {/* Active Indicator Bar (Flipkart Reference Image 1 & 3) */}
                {isSelected && (
                  <span className="absolute -bottom-2.5 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
