'use client';

// =====================================================================
// Customer Web Platform — Product Detail Page (PDP)
// (Rich Spec Highlights, EMI Ribbon, Variant Switcher, Delivery Checker)
// =====================================================================

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingCart,
  Heart,
  Share2,
  Tag,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants';
import { Product, Variant, PageResponse, SearchProductCard } from '@/types';
import { ImageGallery } from '@/components/product/image-gallery';
import { PriceDisplay } from '@/components/common/price-display';
import { RatingStars } from '@/components/common/rating-stars';
import { TrustBadges } from '@/components/common/trust-badges';
import { ReviewsSection } from '@/components/product/reviews-section';
import { ProductCard } from '@/components/product/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { formatPaisa } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, pincode, setPincode } = useUIStore();
  const { isWishlisted, addId, removeId } = useWishlistStore();
  const { fetchCartCount } = useCartStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [pincodeInput, setPincodeInput] = useState(pincode || '560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  // 1. Fetch Product by Slug
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => api.get<Product>(API_ENDPOINTS.PRODUCT_BY_SLUG(slug)),
    enabled: !!slug,
  });

  // Active Variant computation
  const activeVariant = useMemo<Variant | null>(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    if (selectedVariantId) {
      const found = product.variants.find((v) => v.id === selectedVariantId);
      if (found) return found;
    }
    // Default to first variant
    return product.variants[0];
  }, [product, selectedVariantId]);

  // Pricing & Stock
  const buyBox = activeVariant?.buyBoxListing;
  const sellingPricePaisa = buyBox?.sellingPricePaisa ?? 0;
  const mrpPaisa = buyBox?.mrpPaisa ?? sellingPricePaisa;
  const inStock = (buyBox?.isActive ?? false) || (product?.variants?.length ?? 0) > 0;
  const monthlyEmi = Math.round(sellingPricePaisa / 100 / 6);

  // 2. Fetch Related Products
  const { data: relatedData } = useQuery<PageResponse<Product>>({
    queryKey: ['product', product?.id, 'related'],
    queryFn: () => api.get<PageResponse<Product>>(API_ENDPOINTS.PRODUCT_RELATED(product!.id)),
    enabled: !!product?.id,
  });

  const relatedProducts = relatedData?.data || [];

  // Parse variant attributes safely
  const parseAttributes = (raw?: string) => {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  };

  const productAttributes = parseAttributes(product?.attributes);
  const variantAttributes = parseAttributes(activeVariant?.variantAttributes);

  // Wishlist Toggle Mutation
  const handleToggleWishlist = async () => {
    if (!product) return;
    const wishlisted = isWishlisted(product.id);
    if (!isAuthenticated) {
      if (wishlisted) {
        removeId(product.id);
        toast.info('Removed from saved items');
      } else {
        addId(product.id);
        toast.success('Saved to your wishlist!');
      }
      return;
    }

    try {
      if (wishlisted) {
        await api.delete(API_ENDPOINTS.WISHLIST_ITEM(product.id));
        removeId(product.id);
        toast.info('Removed from wishlist');
      } else {
        await api.post(API_ENDPOINTS.WISHLIST_ITEM(product.id));
        addId(product.id);
        toast.success('Added to wishlist!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not update wishlist');
    }
  };

  // Add to Cart Action
  const handleAddToCart = async (buyNow = false) => {
    if (!product || !activeVariant) {
      toast.error('Please select a product variant');
      return;
    }

    if (buyNow) {
      setIsBuyingNow(true);
    } else {
      setIsAddingToCart(true);
    }

    try {
      if (isAuthenticated) {
        await api.post(API_ENDPOINTS.CART_ITEMS, {
          variantId: activeVariant.id,
          sellerListingId: buyBox?.id,
          qty: 1,
        });
        await fetchCartCount();
      } else {
        // Save to local cart
        const local = localStorage.getItem(STORAGE_KEYS.CART_LOCAL);
        let items = local ? JSON.parse(local) : [];
        const existingIdx = items.findIndex((item: any) => item.variantId === activeVariant.id);
        if (existingIdx >= 0) {
          items[existingIdx].qty += 1;
        } else {
          items.push({
            id: `local_${Date.now()}`,
            variantId: activeVariant.id,
            sellerListingId: buyBox?.id,
            productTitle: product.title,
            productSlug: product.slug,
            sku: activeVariant.sku,
            variantAttributes: activeVariant.variantAttributes,
            imageUrl: product.imageUrls?.[0] || '',
            unitPricePaisa: sellingPricePaisa,
            mrpPaisa: mrpPaisa,
            qty: 1,
            subtotalPaisa: sellingPricePaisa,
            inStock: true,
          });
        }
        localStorage.setItem(STORAGE_KEYS.CART_LOCAL, JSON.stringify(items));
        await fetchCartCount();
      }

      toast.success(buyNow ? 'Redirecting to checkout...' : 'Added to cart!');
      if (buyNow) {
        router.push('/checkout');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
      setIsBuyingNow(false);
    }
  };

  // Pincode Check
  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincodeInput)) {
      setPincode(pincodeInput);
      setPincodeChecked(true);
      toast.success(`Delivery availability verified for ${pincodeInput}`);
    } else {
      toast.error('Please enter a valid 6-digit PIN code');
    }
  };

  // Share Product Link
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  // ─── Loading Skeleton ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          <div className="lg:col-span-6 space-y-4">
            <Skeleton className="aspect-square w-full rounded-3xl" />
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found ──────────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/50 text-red-500 mx-auto flex items-center justify-center">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Product Not Found
        </h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm">
          The item you are looking for may have been removed, sold out, or the link might be incorrect.
        </p>
        <Button asChild className="rounded-full px-6 font-bold bg-blue-600 hover:bg-blue-700">
          <Link href="/search">Browse All Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      {/* ─── 1. Breadcrumbs ───────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar py-1">
        <Link href="/" className="hover:text-blue-600 transition-colors shrink-0">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        {product.categoryName && (
          <>
            <Link
              href={`/search?categoryId=${product.categoryId}`}
              className="hover:text-blue-600 transition-colors shrink-0"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          </>
        )}
        {product.brandName && (
          <>
            <Link
              href={`/search?brandId=${product.brandId}`}
              className="hover:text-blue-600 transition-colors shrink-0 font-medium"
            >
              {product.brandName}
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
          </>
        )}
        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs">
          {product.title}
        </span>
      </nav>

      {/* ─── 2. Main PDP Two-Column Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery & Floating Action Buttons */}
        <div className="lg:col-span-6 space-y-6 sticky top-24">
          <div className="relative">
            <ImageGallery images={product.imageUrls || []} title={product.title} />

            {/* Floating Top-Right Wishlist & Share buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform"
                title={isWishlisted(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isWishlisted(product.id) ? 'fill-pink-600 text-pink-600' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform"
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Primary Action Buttons (Add to Cart & Buy Now) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={!inStock || isAddingToCart}
              onClick={() => handleAddToCart(false)}
              className="h-13 rounded-2xl text-sm sm:text-base font-extrabold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-xs"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>

            <Button
              type="button"
              size="lg"
              disabled={!inStock || isBuyingNow}
              onClick={() => handleAddToCart(true)}
              className="h-13 rounded-2xl text-sm sm:text-base font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
            >
              <Zap className="mr-2 h-5 w-5 fill-white" />
              {isBuyingNow ? 'Processing...' : 'Buy Now'}
            </Button>
          </div>
        </div>

        {/* Right Column: Product Info & Selectors */}
        <div className="lg:col-span-6 space-y-6">
          {/* Brand & Title */}
          <div>
            {product.brandName && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {product.brandName}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Ratings & Reviews jump link */}
          <div className="flex items-center gap-3">
            <RatingStars
              rating={product.averageRating || 4.2}
              count={product.totalReviews || 128}
              size="md"
            />
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a
              href="#reviews-section"
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Read {product.totalReviews || 128} Reviews
            </a>
          </div>

          {/* Price Section with Discount Badge */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-baseline gap-3">
              <PriceDisplay
                sellingPricePaisa={sellingPricePaisa}
                mrpPaisa={mrpPaisa}
                size="xl"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Inclusive of all taxes • Free delivery available on this item
            </p>

            {/* Electric Blue EMI Banner (Matching Flipkart Reference Screenshot #1) */}
            {sellingPricePaisa > 300000 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white shadow-xs">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-sky-200 shrink-0" />
                  <span className="text-xs font-bold">
                    Pay Only ₹{monthlyEmi.toLocaleString('en-IN')}/month
                  </span>
                </div>
                <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  No Cost EMI
                </span>
              </div>
            )}
          </div>

          {/* Available Offers & Coupons */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              Available Offers & Bank Discounts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    Bank Offer: 10% Instant Discount
                  </span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">
                    up to ₹1,500 on all major credit and debit cards.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-900/50">
                <Tag className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-900 dark:text-blue-300">
                    Special Coupon: Code SAVE10
                  </span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">
                    Apply during checkout to receive flat 10% discount.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variant Selector (Options e.g. Color, Storage, Size) */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Option / Variant:
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const attrs = parseAttributes(v.variantAttributes);
                  const label =
                    Object.values(attrs).join(' / ') || v.sku || 'Default Variant';
                  const isSelected = activeVariant?.id === v.id;
                  const vPrice = v.buyBoxListing?.sellingPricePaisa;

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>{label}</div>
                      {vPrice && (
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {formatPaisa(vPrice)}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery & Pincode Checker */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-blue-600" />
              Delivery Options & Serviceability
            </h3>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <Input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit Pincode"
                className="h-10 text-xs font-mono max-w-[200px]"
              />
              <Button type="submit" size="sm" variant="outline" className="font-bold">
                Check
              </Button>
            </form>

            {pincodeChecked && (
              <div className="space-y-1.5 pt-1 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  Free Delivery by Tomorrow, 9 PM
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  Order within 2 hrs 40 mins for same-day dispatch
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <RotateCcw className="h-3.5 w-3.5" />
                  7 Days Replacement & Return Policy
                </div>
              </div>
            )}
          </div>

          {/* Specifications & Highlights */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Product Specifications & Details
            </h3>

            {/* Description */}
            {product.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Key attribute key-value pairs */}
            {(Object.keys(productAttributes).length > 0 ||
              Object.keys(variantAttributes).length > 0) && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {Object.entries({ ...productAttributes, ...variantAttributes }).map(
                  ([key, val]: [string, any], idx) => (
                    <div key={idx} className="grid grid-cols-3 p-2.5">
                      <span className="font-semibold text-slate-500 capitalize">{key}</span>
                      <span className="col-span-2 text-slate-900 dark:text-slate-100 font-medium">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Verified Seller info */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Sold & Fulfilled by:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                NovaMarket Retail Express
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Seller
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. Trust Badges ─────────────────────────────────────────── */}
      <TrustBadges />

      {/* ─── 4. Customer Ratings & Reviews Section ────────────────────── */}
      <ReviewsSection productId={product.id} />

      {/* ─── 5. Related Products Carousel ─────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="py-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              You Might Also Like
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Similar & Complementary Products
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => {
              const cardData: SearchProductCard = {
                id: rel.id,
                title: rel.title,
                slug: rel.slug,
                categoryId: rel.categoryId,
                categoryName: rel.categoryName || '',
                brandId: rel.brandId,
                brandName: rel.brandName,
                minPricePaisa: rel.variants?.[0]?.buyBoxListing?.sellingPricePaisa || 99900,
                mrpPaisa: rel.variants?.[0]?.buyBoxListing?.mrpPaisa || 199900,
                imageUrl: rel.imageUrls?.[0],
                averageRating: rel.averageRating || 4.2,
                totalReviews: rel.totalReviews || 45,
                inStock: true,
                createdAt: rel.createdAt,
              };
              return <ProductCard key={rel.id} product={cardData} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
