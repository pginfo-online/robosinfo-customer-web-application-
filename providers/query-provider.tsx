'use client';

// =====================================================================
// Customer Web Platform — TanStack Query & App Bootstrap Provider
// =====================================================================

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const initAuth = useAuthStore((s) => s.initAuth);
  const initWishlist = useWishlistStore((s) => s.initWishlist);
  const initCart = useCartStore((s) => s.initCart);

  useEffect(() => {
    initAuth();
    initWishlist();
    initCart();
  }, [initAuth, initWishlist, initCart]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
