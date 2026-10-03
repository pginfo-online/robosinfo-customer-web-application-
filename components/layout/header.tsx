'use client';

// =====================================================================
// Customer Web Platform — Top Header
// (Matching Reference Image 4 & Modern Flipkart/Amazon UX)
// =====================================================================

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  Package,
  Bell,
  LogOut,
  Store,
  HelpCircle,
} from 'lucide-react';
import { SearchAutocomplete } from './search-autocomplete';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { APP_CONFIG } from '@/lib/constants';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const { openAuthModal, pincode, setPincodeModalOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full glass-header transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">
          {/* ─── 1. Brand Logo & Location ───────────────────────────────── */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg tracking-tighter">N</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Nova<span className="text-blue-600">Market</span>
                </span>
                <span className="text-[10px] font-bold text-amber-500 tracking-wider uppercase mt-0.5">
                  Plus Member
                </span>
              </div>
            </Link>

            {/* Delivery Pincode Indicator */}
            <button
              type="button"
              onClick={() => setPincodeModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[120px]">Deliver to {pincode}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* ─── 2. Search Bar & Rich Autocomplete (Image 4) ──────────── */}
          <div className="flex-1 max-w-2xl mx-auto hidden sm:block">
            <SearchAutocomplete />
          </div>

          {/* ─── 3. Action Controls (Login, Wishlist, Cart) ─────────────── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Account Dropdown */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-10 px-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    <div className="h-7 w-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs max-w-[90px] truncate hidden md:inline">
                      {user.name || user.phone || 'My Account'}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.name || user.phone}
                    </p>
                  </div>
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <User className="mr-2.5 h-4 w-4 text-blue-600" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/orders')}>
                    <Package className="mr-2.5 h-4 w-4 text-indigo-600" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/wishlist')}>
                    <Heart className="mr-2.5 h-4 w-4 text-pink-600" />
                    Wishlist ({wishlistIds.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/notifications')}>
                    <Bell className="mr-2.5 h-4 w-4 text-amber-600" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-600 dark:text-red-400 font-medium">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => openAuthModal('otp')}
                className="rounded-full px-4 font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <User className="mr-1.5 h-3.5 w-3.5" />
                Login
              </Button>
            )}

            {/* Wishlist Icon */}
            <Link
              href="/account/wishlist"
              className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-pink-600 text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in-75">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {/* Cart Icon & Count Badge */}
            <Link
              href="/cart"
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-900 dark:text-white transition-all font-bold text-xs"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-extrabold text-white flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar (under logo on small screens) */}
        <div className="pb-3 sm:hidden">
          <SearchAutocomplete />
        </div>
      </div>
    </header>
  );
}
