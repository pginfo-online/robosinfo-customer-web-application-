import React from 'react';
import { formatPaisa, calculateDiscount } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  sellingPricePaisa: number;
  mrpPaisa?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
  className?: string;
}

export function PriceDisplay({
  sellingPricePaisa,
  mrpPaisa,
  size = 'md',
  showSavings = true,
  className,
}: PriceDisplayProps) {
  const discount = mrpPaisa ? calculateDiscount(mrpPaisa, sellingPricePaisa) : 0;
  const hasDiscount = discount > 0;

  const sizeClasses = {
    sm: {
      selling: 'text-sm font-bold',
      mrp: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.2',
    },
    md: {
      selling: 'text-base font-bold',
      mrp: 'text-xs',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      selling: 'text-2xl font-extrabold',
      mrp: 'text-sm',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      selling: 'text-3xl sm:text-4xl font-extrabold',
      mrp: 'text-base',
      badge: 'text-sm px-3 py-1',
    },
  };

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('text-slate-900 dark:text-white', sizeClasses[size].selling)}>
        {formatPaisa(sellingPricePaisa)}
      </span>

      {hasDiscount && mrpPaisa && (
        <>
          <span
            className={cn(
              'text-slate-400 line-through font-medium dark:text-slate-500',
              sizeClasses[size].mrp
            )}
          >
            {formatPaisa(mrpPaisa)}
          </span>

          {showSavings && (
            <span
              className={cn(
                'rounded-md font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400',
                sizeClasses[size].badge
              )}
            >
              {discount}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
}
