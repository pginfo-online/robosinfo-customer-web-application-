// =====================================================================
// Customer Web Platform — Core TypeScript Definitions
// =====================================================================

export type ProductStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface BuyBoxListing {
  id: string;
  sellerId: string;
  variantId: string;
  mrpPaisa: number;
  sellingPricePaisa: number;
  isActive: boolean;
  condition?: string;
  fulfillmentType?: string;
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  variantAttributes: string; // JSON string e.g. {"color":"Black","storage":"256GB"}
  weightGrams?: number;
  dimensionsCm?: string;
  isActive: boolean;
  buyBoxListing?: BuyBoxListing | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  attributes?: string; // JSON string e.g. {"RAM":"8GB"}
  status: ProductStatus;
  createdBy?: string;
  variants: Variant[];
  imageUrls: string[];
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
}

export interface SearchProductCard {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  minPricePaisa: number;
  mrpPaisa: number;
  imageUrl?: string;
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  createdAt: string;
}

export interface FacetCount {
  id: string;
  name: string;
  count: number;
}

export interface SearchFacets {
  categories: FacetCount[];
  brands: FacetCount[];
  minPricePaisa: number;
  maxPricePaisa: number;
}

export interface SearchResponse {
  products: SearchProductCard[];
  facets: SearchFacets;
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchSuggestionItem {
  id: string;
  text: string;
  categoryName?: string;
  slug?: string;
  imageUrl?: string;
  minPricePaisa?: number;
}

export interface SearchSuggestionResponse {
  query: string;
  suggestions: string[];
  items?: SearchSuggestionItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level?: number;
  displayOrder?: number;
  imageUrl?: string | null;
  isActive?: boolean;
  attributesTemplate?: string | null;
  returnWindowDays?: number;
  createdAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
}

// ─── Cart ─────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  variantId: string;
  sellerListingId: string;
  productTitle: string;
  productSlug?: string;
  sku: string;
  variantAttributes?: string;
  imageUrl?: string;
  unitPricePaisa: number;
  mrpPaisa: number;
  qty: number;
  subtotalPaisa: number;
  inStock: boolean;
  availableQty: number;
}

export interface Cart {
  cartId?: string;
  customerId: string;
  items: CartItem[];
  subtotalPaisa: number;
  totalSavingsPaisa: number;
  itemCount: number;
}

export interface AddToCartPayload {
  variantId: string;
  sellerListingId?: string;
  qty: number;
}

// ─── User & Addresses ──────────────────────────────────────────────────

export interface User {
  id: string;
  phone?: string;
  email?: string | null;
  name?: string | null;
  userType: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'DELIVERY_PARTNER' | 'WAREHOUSE_STAFF';
  status: string;
  roles: string[];
}

export interface UserAddress {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface AddressPayload {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

// ─── Orders ────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  variantId: string;
  sellerId: string;
  sellerListingId: string;
  productTitle: string;
  sku: string;
  qty: number;
  unitPricePaisa: number;
  mrpPaisa: number;
  discountPaisa: number;
  taxPaisa: number;
  totalPaisa: number;
  status: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  shippingAddressSnapshot: string;
  subtotalPaisa: number;
  discountPaisa: number;
  taxPaisa: number;
  shippingPaisa: number;
  totalPaisa: number;
  couponCode?: string | null;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderPayload {
  addressId: string;
  idempotencyKey: string;
  couponCode?: string;
  notes?: string;
}

// ─── Coupons & Discounts ───────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT_AMOUNT';
  discountValue: number;
  minOrderValuePaisa: number;
  maxDiscountCapPaisa?: number | null;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FLAT_AMOUNT';
  discountPaisa: number;
  finalTotalPaisa: number;
  message?: string;
}

// ─── Wishlist ──────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  slug: string;
  categoryName?: string;
  brandName?: string;
  minPricePaisa: number;
  mrpPaisa: number;
  imageUrl?: string;
  averageRating: number;
  totalReviews: number;
  inStock: boolean;
  addedAt: string;
}

export interface Wishlist {
  customerId: string;
  totalItems: number;
  items: WishlistItem[];
}

// ─── Reviews ───────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  orderItemId: string;
  customerId: string;
  customerName?: string;
  rating: number;
  title: string;
  comment: string;
  photoUrls?: string[];
  helpfulVotes: number;
  verifiedBuyer: boolean;
  sellerResponse?: string;
  createdAt: string;
}

export interface ProductRatingSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  starDistribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
}

export interface CreateReviewPayload {
  orderItemId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  photoUrls?: string[];
}

// ─── Returns ───────────────────────────────────────────────────────────

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  orderItemId: string;
  productTitle?: string;
  reason: string;
  customerNotes?: string;
  status: string;
  refundAmountPaisa: number;
  photoUrls?: string[];
  createdAt: string;
}

export interface CreateReturnPayload {
  orderItemId: string;
  reason: string;
  customerNotes?: string;
  photoUrls?: string[];
}

// ─── Notifications ─────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: string;
  read: boolean;
  createdAt: string;
}

// ─── Common Page Response ──────────────────────────────────────────────

export interface PageResponse<T> {
  data: T[];
  totalCount: number;
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
