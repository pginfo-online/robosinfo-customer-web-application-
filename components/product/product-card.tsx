'use client';

// =====================================================================
// Customer Web Platform — Product Card
// (Matching Flipkart Reference Screenshot #1 & Modern E-Commerce UX)
// =====================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { SearchProductCard, Product } from '@/types';
import { PriceDisplay } from '@/components/common/price-display';
import { formatMonthlyEmi, calculateDiscount } from '@/lib/utils';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { useUIStore } from '@/store/ui-store';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';

interface ProductCardProps {
  product: SearchProductCard | Product;
  specBadges?: string[]; // e.g. ["7000mAh Battery", "144Hz AMOLED", "IP64"]
  priority?: boolean;
}

export function ProductCard({ product, specBadges, priority = false }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { isWishlisted, addId, removeId } = useWishlistStore();
  const { openAuthModal } = useUIStore();
  const setItemCount = useCartStore((s) => s.setItemCount);
  const openCartDrawer = useCartStore((s) => s.openDrawer);

  const [isAdding, setIsAdding] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  // Normalize fields between SearchProductCard and Product
  const id = product.id;
  const title = product.title;
  const slug = product.slug;
  const brandName = product.brandName || 'Brand';
  const imageUrl =
    'imageUrl' in product && product.imageUrl
      ? product.imageUrl
      : 'imageUrls' in product && product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80';

  let minPrice = 0;
  let mrp = 0;
  let inStock = true;
  let rating = 4.3;
  let reviewsCount = 120;

  if ('minPricePaisa' in product) {
    minPrice = product.minPricePaisa;
    mrp = product.mrpPaisa;
    inStock = product.inStock ?? true;
    rating = product.averageRating || 4.2;
    reviewsCount = product.totalReviews || 85;
  } else if ('variants' in product && product.variants && product.variants.length > 0) {
    const buyBox = product.variants[0]?.buyBoxListing;
    if (buyBox) {
      minPrice = buyBox.sellingPricePaisa;
      mrp = buyBox.mrpPaisa;
    }
    rating = product.averageRating || 4.5;
    reviewsCount = product.totalReviews || 110;
  }

  const wishlisted = isWishlisted(id);
  const discount = calculateDiscount(mrp, minPrice);
  const emiText = minPrice > 0 ? `Pay Only ${formatMonthlyEmi(minPrice)}` : null;

  // ─── Wishlist Toggle ─────────────────────────────────────────────────
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal('otp');
      return;
    }

    if (wishlisted) {
      removeId(id);
      try {
        await api.delete(API_ENDPOINTS.WISHLIST_ITEM(id));
        toast.info('Removed from wishlist');
      } catch {
        addId(id);
      }
    } else {
      addId(id);
      try {
        await api.post(API_ENDPOINTS.WISHLIST_ITEM(id));
        toast.success('Added to wishlist');
      } catch {
        removeId(id);
      }
    }
  };

  // ─── Quick Add to Cart ───────────────────────────────────────────────
  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal('otp');
      return;
    }

    setIsAdding(true);
    try {
      let variantId = '';
      let listingId: string | undefined = undefined;

      if ('variants' in product && product.variants && product.variants.length > 0) {
        variantId = product.variants[0].id;
        listingId = product.variants[0].buyBoxListing?.id;
      }

      // If variantId is missing from search card, fetch full product
      if (!variantId) {
        const fullProd = await api.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
        if (fullProd.variants && fullProd.variants.length > 0) {
          variantId = fullProd.variants[0].id;
          listingId = fullProd.variants[0].buyBoxListing?.id;
        }
      }

      if (!variantId) {
        toast.error('Product variant currently unavailable');
        return;
      }

      const cartRes: any = await api.post(API_ENDPOINTS.CART_ITEMS, {
        variantId,
        sellerListingId: listingId,
        qty: 1,
      });

      setItemCount(cartRes.itemCount || 1);
      setJustAdded(true);
      toast.success('Added to cart!');
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden">
      {/* ─── Top Badges (Discount & Wishlist) ─────────────────────────── */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {discount > 0 ? (
          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
            {discount}% OFF
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="h-8 w-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 shadow-sm transition-transform active:scale-90 pointer-events-auto"
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`h-4 w-4 ${
              wishlisted ? 'fill-pink-600 text-pink-600 dark:fill-pink-500 dark:text-pink-500' : ''
            }`}
          />
        </button>
      </div>

      {/* ─── Product Image Container with Zoom Effect ────────────────── */}
      <Link href={`/products/${slug}`} className="block relative w-full pt-[95%] bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
        />

        {/* Spec Overlay Panel (Flipkart Reference Image 1) */}
        {specBadges && specBadges.length > 0 && (
          <div className="absolute bottom-2 left-2 right-2 p-1.5 rounded-xl spec-panel flex flex-col gap-0.5 text-[10px] font-bold text-slate-800 dark:text-slate-200">
            {specBadges.map((spec, i) => (
              <span key={i} className="truncate">
                • {spec}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* ─── Blue Monthly EMI Ribbon (Flipkart Reference Image 1) ───── */}
      {emiText && (
        <div className="w-full py-1 px-3 emi-ribbon text-center text-xs font-bold tracking-wide">
          {emiText}
        </div>
      )}

      {/* ─── Product Details ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Brand & Ratings */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">
            {brandName}
          </span>
          {rating > 0 && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shrink-0">
              <span>{rating.toFixed(1)}</span>
              <Star className="h-2.5 w-2.5 fill-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/products/${slug}`}
          className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 leading-snug"
          title={title}
        >
          {title}
        </Link>

        {/* Price & Savings */}
        <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <PriceDisplay sellingPricePaisa={minPrice} mrpPaisa={mrp} size="sm" />

          {/* Stock & Quick Add */}
          <div className="flex items-center justify-between gap-2 mt-3">
            {inStock ? (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                In Stock
              </span>
            ) : (
              <span className="text-[11px] font-medium text-red-500">
                Out of stock
              </span>
            )}

            <button
              type="button"
              disabled={!inStock || isAdding}
              onClick={handleQuickAdd}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" /> Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
