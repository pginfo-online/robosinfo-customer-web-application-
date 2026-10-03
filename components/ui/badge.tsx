import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white',
        secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        discount: 'bg-emerald-600 text-white shadow-xs',
        urgency: 'bg-red-600 text-white',
        outline: 'border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300',
        rating: 'bg-emerald-600 text-white flex items-center gap-1 font-bold',
        emi: 'bg-blue-600 text-white text-[11px] font-bold tracking-wide',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
