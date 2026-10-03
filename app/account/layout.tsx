'use client';

// =====================================================================
// Customer Web Platform — Account Hub Layout & Navigation
// =====================================================================

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  Package,
  Heart,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const { openAuthModal } = useUIStore();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 mx-auto flex items-center justify-center">
          <User className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Sign In to Your Account
        </h2>
        <p className="text-xs text-slate-500">
          Access your orders, track shipments, view your wishlist, and manage your profile.
        </p>
        <Button
          onClick={() => openAuthModal('otp')}
          className="w-full rounded-xl font-bold bg-blue-600 hover:bg-blue-700"
        >
          Sign In / Register
        </Button>
      </div>
    );
  }

  const navItems = [
    { label: 'My Profile', href: '/account', icon: User },
    { label: 'My Orders', href: '/account/orders', icon: Package },
    {
      label: 'Wishlist',
      href: '/account/wishlist',
      icon: Heart,
      badge: wishlistIds.length > 0 ? wishlistIds.length : undefined,
    },
    { label: 'Notifications', href: '/account/notifications', icon: Bell },
    { label: 'Customer Helpdesk', href: '/account/tickets', icon: HelpCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Sidebar Navigation ────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-4 sticky top-24">
          {/* User Profile Card Header */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-xs text-slate-400 font-medium">Hello,</span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {user?.name || user?.phone || 'Customer'}
              </h3>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Plus Member
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge !== undefined && (
                      <span className="h-5 min-w-5 px-1 rounded-full bg-pink-100 text-pink-600 text-[10px] font-extrabold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* ─── Main Account Content ──────────────────────────────────── */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
