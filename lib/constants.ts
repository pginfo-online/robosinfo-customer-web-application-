// =====================================================================
// Customer Web Platform — Global Constants & Endpoints
// =====================================================================

export const APP_CONFIG = {
  appName: 'NovaMarket',
  appTagline: 'India\'s Most Loved Marketplace',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  defaultPincode: '560001',
  supportEmail: 'support@novamarket.com',
  supportPhone: '1800-123-9999',
};

export const API_ENDPOINTS = {
  // Auth
  OTP_SEND: '/api/v1/auth/otp/send',
  OTP_VERIFY: '/api/v1/auth/otp/verify',
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',

  // Profile & Address
  USER_PROFILE: '/api/v1/users/me',
  USER_ADDRESSES: '/api/v1/users/me/addresses',

  // Catalog & Search
  PRODUCTS: '/api/v1/products',
  PRODUCT_BY_SLUG: (slug: string) => `/api/v1/products/slug/${slug}`,
  PRODUCT_BY_ID: (id: string) => `/api/v1/products/${id}`,
  PRODUCT_RELATED: (id: string) => `/api/v1/products/${id}/related`,
  PRODUCT_FEATURED: '/api/v1/products/featured',
  CATEGORIES: '/api/v1/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/api/v1/categories/slug/${slug}`,
  BRANDS: '/api/v1/brands',
  SEARCH: '/api/v1/search',
  SEARCH_SUGGEST: '/api/v1/search/suggest',

  // Cart
  CART: '/api/v1/cart',
  CART_ITEMS: '/api/v1/cart/items',
  CART_ITEM: (id: string) => `/api/v1/cart/items/${id}`,

  // Orders & Payments
  ORDERS: '/api/v1/orders',
  MY_ORDERS: '/api/v1/orders/me',
  ORDER_BY_ID: (id: string) => `/api/v1/orders/${id}`,
  ORDER_BY_NUMBER: (num: string) => `/api/v1/orders/number/${num}`,
  CANCEL_ORDER: (id: string) => `/api/v1/orders/${id}/cancel`,
  PAYMENT_INTENT: '/api/v1/payments/intent',
  PAYMENT_VERIFY: '/api/v1/payments/verify',

  // Coupons & Promotions
  COUPONS_ACTIVE: '/api/v1/promotions/coupons',
  COUPON_VALIDATE: '/api/v1/promotions/coupons/validate',

  // Wishlist
  WISHLIST: '/api/v1/wishlist',
  WISHLIST_ITEM: (productId: string) => `/api/v1/wishlist/${productId}`,
  WISHLIST_IDS: '/api/v1/wishlist/ids',
  WISHLIST_CHECK: (productId: string) => `/api/v1/wishlist/check/${productId}`,

  // Reviews
  REVIEWS: '/api/v1/reviews',
  PRODUCT_REVIEWS: (productId: string) => `/api/v1/reviews/products/${productId}`,
  PRODUCT_RATING_SUMMARY: (productId: string) => `/api/v1/reviews/products/${productId}/summary`,
  REVIEW_HELPFUL: (id: string) => `/api/v1/reviews/${id}/helpful`,
  MY_REVIEWS: '/api/v1/reviews/me',

  // Returns
  RETURNS: '/api/v1/returns',
  MY_RETURNS: '/api/v1/returns/me',
  RETURN_BY_ID: (id: string) => `/api/v1/returns/${id}`,

  // Notifications
  NOTIFICATIONS_ME: '/api/v1/notifications/me',
  DEVICE_TOKEN: '/api/v1/notifications/device-token',

  // Tracking
  SHIPMENT_TRACKING: (id: string) => `/api/v1/shipments/${id}/tracking`,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'customer_access_token',
  REFRESH_TOKEN: 'customer_refresh_token',
  USER: 'customer_user_profile',
  CART_LOCAL: 'customer_local_cart',
  WISHLIST_IDS: 'customer_wishlist_ids',
  RECENTLY_VIEWED: 'customer_recently_viewed',
  SELECTED_PINCODE: 'customer_selected_pincode',
};

// Category Icon navigation reference (Matching Reference Image 3 & 2)
export const HEADER_CATEGORIES = [
  { name: 'For You', slug: 'for-you', icon: 'Sparkles' },
  { name: 'Fashion', slug: 'fashion', icon: 'Shirt' },
  { name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone' },
  { name: 'Electronics', slug: 'electronics', icon: 'Laptop' },
  { name: 'Beauty', slug: 'beauty', icon: 'Sparkle' },
  { name: 'Home', slug: 'home', icon: 'Lamp' },
  { name: 'Appliances', slug: 'appliances', icon: 'Tv' },
  { name: 'Toys & Baby', slug: 'toys-baby', icon: 'Baby' },
  { name: 'Sports & Fitness', slug: 'sports-fitness', icon: 'Dumbbell' },
  { name: 'Furniture', slug: 'furniture', icon: 'Armchair' },
  { name: 'Books', slug: 'books', icon: 'BookOpen' },
  { name: 'Two Wheelers', slug: 'two-wheelers', icon: 'Bike' },
];

// Subcategory grid for MegaMenu (Matching Reference Image 2)
export const ELECTRONICS_SUB_CATEGORIES = [
  { name: 'New Launches', icon: 'Zap', tag: 'Hot' },
  { name: 'Earphones', icon: 'Headphones', tag: 'Min 40% Off' },
  { name: 'Laptops', icon: 'Laptop', tag: 'From ₹24,990' },
  { name: 'Tablets', icon: 'Tablet', tag: 'Top Deals' },
  { name: 'Wearables', icon: 'Watch', tag: 'Up to 70% Off' },
  { name: 'Gaming', icon: 'Gamepad2', tag: 'Consoles & Gear' },
  { name: 'Storage', icon: 'HardDrive', tag: 'SSDs & Pen Drives' },
  { name: 'Chargers & Cable', icon: 'Cable', tag: 'Fast Charging' },
  { name: 'Cameras', icon: 'Camera', tag: 'DSLR & Action' },
  { name: 'Power Banks', icon: 'BatteryCharging', tag: '10000+ mAh' },
  { name: 'Smart Devices', icon: 'Home', tag: 'Alexa & Google' },
  { name: 'Speakers', icon: 'Speaker', tag: 'Bluetooth & Soundbars' },
  { name: 'IT Peripherals', icon: 'Monitor', tag: 'Keyboards & Mice' },
  { name: 'Health Care', icon: 'Activity', tag: 'Massagers & Bp' },
  { name: 'Printers', icon: 'Printer', tag: 'Laser & Inkjet' },
];

// Promotional Hero Banners (Matching Reference Image 3)
export const HERO_BANNERS = [
  {
    id: 'b1',
    badge: 'GRAND FESTIVE CARNIVAL',
    title: 'THE MEGA SHOPPING FESTIVAL',
    subtitle: 'Starts 9th Oct • Extra 10% Instant Discount on Bank Cards',
    highlightText: 'Up to 80% Off on Top Tech & Fashion',
    ctaText: 'Explore Deals',
    ctaLink: '/search?sortBy=RELEVANCE',
    bgGradient: 'from-blue-700 via-indigo-800 to-slate-900',
    accentColor: '#3b82f6',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'b2',
    badge: 'NEXT-GEN FLAGSHIPS',
    title: 'Flagship Smartphones',
    subtitle: 'Snapdragon 8 Elite • 144Hz AMOLED • Segment-Fastest 5G',
    highlightText: 'Pay Only ₹3,999/month No Cost EMI',
    ctaText: 'Shop Mobiles',
    ctaLink: '/search?categoryId=mobiles',
    bgGradient: 'from-slate-900 via-sky-950 to-indigo-950',
    accentColor: '#0ea5e9',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'b3',
    badge: 'LUXURY AUDIO & WEARABLES',
    title: 'Studio Sound & Smart Life',
    subtitle: 'Active Noise Cancellation • 40Hr Battery • Seamless Pairing',
    highlightText: 'Special Introductory Prices from ₹1,499',
    ctaText: 'Discover Audio',
    ctaLink: '/search?categoryId=electronics',
    bgGradient: 'from-emerald-900 via-teal-950 to-slate-900',
    accentColor: '#10b981',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
  },
];
