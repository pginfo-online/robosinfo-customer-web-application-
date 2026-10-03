// =====================================================================
// Customer Web Platform — Cart UI & State Store (Zustand)
// =====================================================================

import { create } from 'zustand';
import { STORAGE_KEYS, API_ENDPOINTS } from '@/lib/constants';
import { api } from '@/lib/api-client';
import { Cart } from '@/types';

interface CartState {
  isDrawerOpen: boolean;
  itemCount: number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setItemCount: (count: number) => void;
  initCart: () => Promise<void>;
  fetchCartCount: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  isDrawerOpen: false,
  itemCount: 0,
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setItemCount: (count: number) => set({ itemCount: count }),

  initCart: async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const cart = await api.get<Cart>(API_ENDPOINTS.CART);
        if (cart) {
          const totalItems = cart.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
          set({ itemCount: totalItems });
        }
      } else {
        const local = localStorage.getItem(STORAGE_KEYS.CART_LOCAL);
        if (local) {
          const items = JSON.parse(local);
          const totalItems = items.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
          set({ itemCount: totalItems });
        }
      }
    } catch {
      // ignore
    }
  },

  fetchCartCount: async () => {
    if (typeof window === 'undefined') return;
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        const cart = await api.get<Cart>(API_ENDPOINTS.CART);
        if (cart) {
          const totalItems = cart.items?.reduce((sum, item) => sum + item.qty, 0) || 0;
          set({ itemCount: totalItems });
        }
      } else {
        const local = localStorage.getItem(STORAGE_KEYS.CART_LOCAL);
        if (local) {
          const items = JSON.parse(local);
          const totalItems = items.reduce((sum: number, item: any) => sum + (item.qty || 1), 0);
          set({ itemCount: totalItems });
        }
      }
    } catch {
      // ignore
    }
  },
}));
