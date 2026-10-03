import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 my-4">
      <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 stroke-[1.5]" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">{description}</p>

      {actionText && (
        actionHref ? (
          <Button asChild size="default">
            <Link href={actionHref}>{actionText}</Link>
          </Button>
        ) : (
          <Button onClick={onAction} size="default">
            {actionText}
          </Button>
        )
      )}
    </div>
  );
}
