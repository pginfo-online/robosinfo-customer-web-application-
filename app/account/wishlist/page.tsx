'use client';

// =====================================================================
// Customer Web Platform — Wishlist & Saved Products Page
// =====================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { Wishlist, WishlistItem } from '@/types';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/common/rating-stars';
import { PriceDisplay } from '@/components/common/price-display';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { formatPaisa } from '@/lib/utils';
import { toast } from 'sonner';

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { removeId } = useWishlistStore();
  const { fetchCartCount } = useCartStore();

  // Fetch Wishlist
  const { data: wishlist, isLoading } = useQuery<Wishlist>({
    queryKey: ['wishlist'],
    queryFn: () => api.get<Wishlist>(API_ENDPOINTS.WISHLIST),
  });

  // Remove Mutation
  const removeMutation = useMutation({
    mutationFn: (productId: string) =>
      api.delete(API_ENDPOINTS.WISHLIST_ITEM(productId)),
    onSuccess: (_, productId) => {
      removeId(productId);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.info('Item removed from wishlist');
    },
    onError: (err: any) => toast.error(err.message || 'Could not remove item'),
  });

  // Move to Cart Action
  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      // Fetch product to get first active variant
      const product = await api.get<any>(API_ENDPOINTS.PRODUCT_BY_ID(item.productId));
      const variantId = product?.variants?.[0]?.id;
      if (!variantId) {
        toast.error('Product variant not available');
        return;
      }

      await api.post(API_ENDPOINTS.CART_ITEMS, {
        variantId,
        qty: 1,
      });

      // Remove from wishlist
      await removeMutation.mutateAsync(item.productId);
      await fetchCartCount();
      toast.success('Moved to shopping cart!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to move to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-pink-50 dark:bg-pink-950/50 text-pink-600 mx-auto flex items-center justify-center">
          <Heart className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save items you love to your wishlist and revisit them anytime.
        </p>
        <Button asChild className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-700">
          <Link href="/">
            <ShoppingBag className="mr-2 h-4 w-4" /> Explore Top Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          My Wishlist ({items.length})
        </h2>
        <p className="text-xs text-slate-500">
          Items saved for later purchase or price drop notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-3 group"
          >
            <div>
              {/* Product Thumbnail */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden mb-3">
                <Image
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={item.title}
                  fill
                  sizes="240px"
                  className="object-contain p-3 group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(item.productId)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 shadow-sm text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Title */}
              <Link
                href={`/products/${item.slug}`}
                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2"
              >
                {item.title}
              </Link>

              {/* Rating */}
              <div className="mt-1.5">
                <RatingStars
                  rating={item.averageRating || 4.2}
                  count={item.totalReviews || 12}
                  size="sm"
                />
              </div>

              {/* Price */}
              <div className="mt-2">
                <PriceDisplay
                  sellingPricePaisa={item.minPricePaisa}
                  mrpPaisa={item.mrpPaisa}
                  size="sm"
                />
              </div>
            </div>

            {/* Move to Cart CTA */}
            <Button
              type="button"
              onClick={() => handleMoveToCart(item)}
              className="w-full rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 h-9"
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              Move to Cart
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
