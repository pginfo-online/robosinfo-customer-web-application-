'use client';

// =====================================================================
// Customer Web Platform — Shopping Cart Page
// (Dual Auth/Local Sync, Quantity Stepper, Coupon Tray, Price Breakdown)
// =====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Heart,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';
import { Cart, CartItem, Coupon, CouponValidationResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { formatPaisa, calculateDiscount } from '@/lib/utils';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { fetchCartCount, setItemCount } = useCartStore();
  const { isWishlisted, addId } = useWishlistStore();
  const { pincode, setPincodeModalOpen, openAuthModal } = useUIStore();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [localItems, setLocalItems] = useState<CartItem[]>([]);

  // 1. Fetch Backend Cart if Authenticated
  const {
    data: serverCart,
    isLoading: isServerCartLoading,
    refetch: refetchServerCart,
  } = useQuery<Cart>({
    queryKey: ['cart'],
    queryFn: () => api.get<Cart>(API_ENDPOINTS.CART),
    enabled: isAuthenticated,
  });

  // Load local items if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.CART_LOCAL);
        if (stored) {
          setLocalItems(JSON.parse(stored));
        }
      } catch {}
    }
  }, [isAuthenticated]);

  // Combine items depending on auth state
  const items: CartItem[] = useMemo(() => {
    if (isAuthenticated) {
      return serverCart?.items || [];
    }
    return localItems;
  }, [isAuthenticated, serverCart, localItems]);

  // Totals calculation
  const subtotalPaisa = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.subtotalPaisa || item.unitPricePaisa * item.qty), 0);
  }, [items]);

  const totalMrpPaisa = useMemo(() => {
    return items.reduce((sum, item) => sum + ((item.mrpPaisa || item.unitPricePaisa) * item.qty), 0);
  }, [items]);

  const discountOnMrp = totalMrpPaisa - subtotalPaisa;
  const couponDiscountPaisa = appliedCoupon?.discountPaisa || 0;
  const deliveryFeePaisa = subtotalPaisa >= 49900 || subtotalPaisa === 0 ? 0 : 4900;
  const finalTotalPaisa = Math.max(0, subtotalPaisa - couponDiscountPaisa + deliveryFeePaisa);
  const totalSavingsPaisa = discountOnMrp + couponDiscountPaisa;

  // 2. Fetch Active Coupons from Backend
  const { data: availableCoupons } = useQuery<Coupon[]>({
    queryKey: ['coupons', 'active'],
    queryFn: () => api.get<Coupon[]>(API_ENDPOINTS.COUPONS_ACTIVE),
  });

  // Update Cart Quantity
  const handleUpdateQty = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    if (isAuthenticated) {
      try {
        await api.put(API_ENDPOINTS.CART_ITEM(itemId), { qty: newQty });
        await refetchServerCart();
        await fetchCartCount();
      } catch (err: any) {
        toast.error(err.message || 'Could not update quantity');
      }
    } else {
      const updated = localItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              qty: newQty,
              subtotalPaisa: item.unitPricePaisa * newQty,
            }
          : item
      );
      setLocalItems(updated);
      localStorage.setItem(STORAGE_KEYS.CART_LOCAL, JSON.stringify(updated));
      setItemCount(updated.reduce((sum, i) => sum + i.qty, 0));
    }
  };

  // Remove Item
  const handleRemoveItem = async (itemId: string) => {
    if (isAuthenticated) {
      try {
        await api.delete(API_ENDPOINTS.CART_ITEM(itemId));
        await refetchServerCart();
        await fetchCartCount();
        toast.info('Item removed from cart');
      } catch (err: any) {
        toast.error(err.message || 'Could not remove item');
      }
    } else {
      const updated = localItems.filter((i) => i.id !== itemId);
      setLocalItems(updated);
      localStorage.setItem(STORAGE_KEYS.CART_LOCAL, JSON.stringify(updated));
      setItemCount(updated.reduce((sum, i) => sum + i.qty, 0));
      toast.info('Item removed from cart');
    }
  };

  // Move to Wishlist
  const handleMoveToWishlist = async (item: CartItem) => {
    if (item.variantId) {
      addId(item.variantId);
    }
    await handleRemoveItem(item.id);
    toast.success('Moved to Wishlist!');
  };

  // Validate & Apply Coupon
  const handleApplyCoupon = async (code: string) => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await api.post<CouponValidationResult>(API_ENDPOINTS.COUPON_VALIDATE, {
        code: code.trim().toUpperCase(),
        cartTotalPaisa: subtotalPaisa,
      });

      if (result.valid) {
        setAppliedCoupon(result);
        setCouponCodeInput(code.trim().toUpperCase());
        toast.success(`Coupon ${code.toUpperCase()} applied! You saved ${formatPaisa(result.discountPaisa)}`);
      } else {
        toast.error(result.message || 'Invalid or expired coupon code');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    toast.info('Coupon removed');
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      openAuthModal('otp');
      toast.info('Please log in or register to complete your order securely');
      return;
    }
    // Pass applied coupon to checkout via search params if applicable
    if (appliedCoupon) {
      router.push(`/checkout?coupon=${appliedCoupon.code}`);
    } else {
      router.push('/checkout');
    }
  };

  // ─── Loading State ───────────────────────────────────────────────────
  if (isAuthenticated && isServerCartLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-4 h-72 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ─── Empty Cart State ────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-28 w-28 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
          <ShoppingBag className="h-14 w-14" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Explore our vast catalog of smartphones, electronics, fashion, and more with exclusive deals!
          </p>
        </div>

        <Button asChild size="lg" className="rounded-full px-8 font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
          <Link href="/">Start Shopping Today</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Title & Pincode Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Shopping Cart ({items.reduce((s, i) => s + i.qty, 0)} Items)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your selected items before proceeding to secure checkout.
          </p>
        </div>

        {/* Delivery Location pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
          <MapPin className="h-3.5 w-3.5 text-blue-600" />
          <span>Deliver to: {pincode}</span>
          <button
            type="button"
            onClick={() => setPincodeModalOpen(true)}
            className="text-blue-600 hover:underline font-bold ml-1"
          >
            Change
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ─── Left Column: Cart Items List ──────────────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const discount = item.mrpPaisa
              ? calculateDiscount(item.mrpPaisa, item.unitPricePaisa)
              : 0;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4"
              >
                <div className="flex gap-4 sm:gap-6">
                  {/* Thumbnail */}
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                    <Image
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={item.productTitle}
                      fill
                      sizes="112px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Link
                      href={item.productSlug ? `/products/${item.productSlug}` : '/search'}
                      className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>

                    {item.variantAttributes && (
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {item.variantAttributes}
                      </p>
                    )}

                    {/* Price row */}
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {formatPaisa(item.unitPricePaisa)}
                      </span>
                      {item.mrpPaisa && item.mrpPaisa > item.unitPricePaisa && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {formatPaisa(item.mrpPaisa)}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                            {discount}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> In Stock
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[11px] text-slate-500">Free delivery available</span>
                    </div>
                  </div>
                </div>

                {/* Stepper & Action Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={item.qty <= 1}
                      onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                      className="h-7 w-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                      className="h-7 w-7 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Actions: Save for later & Delete */}
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleMoveToWishlist(item)}
                      className="text-slate-500 hover:text-pink-600 flex items-center gap-1 transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Save for Later</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Trust Guarantees */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
              <span className="font-semibold">Safe and Secure Payments. 100% Authentic Products.</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Easy 7-day doorstep return policy</span>
            </div>
          </div>
        </div>

        {/* ─── Right Column: Coupons & Price Summary ─────────────────── */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          {/* Coupon Input & Available Offers */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-blue-600" />
              Coupons & Bank Offers
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
                    {appliedCoupon.code} Applied
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Saved {formatPaisa(appliedCoupon.discountPaisa)} with this coupon
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Coupon Code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="text-xs font-mono tracking-wider uppercase h-10"
                />
                <Button
                  type="button"
                  onClick={() => handleApplyCoupon(couponCodeInput)}
                  disabled={isValidatingCoupon || !couponCodeInput.trim()}
                  className="h-10 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  {isValidatingCoupon ? 'Checking...' : 'Apply'}
                </Button>
              </div>
            )}

            {/* Suggested coupons list */}
            {availableCoupons && availableCoupons.length > 0 && !appliedCoupon && (
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Available Discounts:
                </span>
                {availableCoupons.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {c.code}
                      </span>
                      <p className="text-[10px] text-slate-500 leading-tight">{c.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Price Details
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Price ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                <span>{formatPaisa(totalMrpPaisa)}</span>
              </div>

              {discountOnMrp > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Discount on MRP</span>
                  <span>-{formatPaisa(discountOnMrp)}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-{formatPaisa(couponDiscountPaisa)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charges</span>
                <span>
                  {deliveryFeePaisa === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatPaisa(deliveryFeePaisa)
                  )}
                </span>
              </div>
            </div>

            <Separator />

            {/* Total to pay */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                Total Amount
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {formatPaisa(finalTotalPaisa)}
              </span>
            </div>

            {totalSavingsPaisa > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>You will save {formatPaisa(totalSavingsPaisa)} on this order</span>
              </div>
            )}

            {/* Primary Checkout CTA */}
            <Button
              type="button"
              size="lg"
              onClick={handleProceedToCheckout}
              className="w-full h-12 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
