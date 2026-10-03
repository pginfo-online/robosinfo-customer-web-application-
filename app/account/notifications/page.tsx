'use client';

// =====================================================================
// Customer Web Platform — Notifications Feed Page
// =====================================================================

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell,
  Package,
  Tag,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { NotificationItem, PageResponse } from '@/types';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { data: notificationsData, isLoading } = useQuery<
    PageResponse<NotificationItem> | NotificationItem[]
  >({
    queryKey: ['notifications', 'me'],
    queryFn: () => api.get<any>(API_ENDPOINTS.NOTIFICATIONS_ME),
  });

  const notifications: NotificationItem[] = Array.isArray(notificationsData)
    ? notificationsData
    : (notificationsData as PageResponse<NotificationItem>)?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Notifications & Alerts
        </h2>
        <p className="text-xs text-slate-500">
          Stay updated on your order milestones, price drops, and special offers.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
          <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 mx-auto flex items-center justify-center">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            All Caught Up!
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You don&apos;t have any unread notifications right now.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !n.read ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatDate(n.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {n.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
