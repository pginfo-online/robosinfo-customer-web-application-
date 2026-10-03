import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number; // 0 - 5
  totalReviews?: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function RatingStars({
  rating,
  totalReviews,
  count,
  size = 'sm',
  showCount = true,
  className,
}: RatingStarsProps) {
  const displayCount = totalReviews ?? count;
  const roundedRating = Math.round(rating * 10) / 10;
  const starSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              starSizes[size],
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-500'
                : 'text-slate-300 dark:text-slate-600'
            )}
          />
        ))}
      </div>

      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
        {roundedRating.toFixed(1)}
      </span>

      {showCount && displayCount !== undefined && displayCount > 0 && (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          ({displayCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
