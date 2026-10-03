// =====================================================================
// Customer Web Platform — Wishlist Fast Lookup Store (Zustand)
// =====================================================================

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants';

interface WishlistStoreState {
  productIds: string[];
  initWishlist: () => void;
  setProductIds: (ids: string[]) => void;
  addId: (id: string) => void;
  removeId: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStoreState>((set, get) => ({
  productIds: [],

  initWishlist: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST_IDS);
      if (saved) {
        set({ productIds: JSON.parse(saved) });
      }
    } catch {}
  },

  setProductIds: (ids: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WISHLIST_IDS, JSON.stringify(ids));
    }
    set({ productIds: ids });
  },

  addId: (id: string) => {
    const current = get().productIds;
    if (!current.includes(id)) {
      const updated = [...current, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WISHLIST_IDS, JSON.stringify(updated));
      }
      set({ productIds: updated });
    }
  },

  removeId: (id: string) => {
    const current = get().productIds;
    const updated = current.filter((x) => x !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.WISHLIST_IDS, JSON.stringify(updated));
    }
    set({ productIds: updated });
  },

  isWishlisted: (id: string) => get().productIds.includes(id),
}));
