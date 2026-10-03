// =====================================================================
// Customer Web Platform — UI Modal & Navigation Store (Zustand)
// =====================================================================

import { create } from 'zustand';
import { APP_CONFIG, STORAGE_KEYS } from '@/lib/constants';

interface UIState {
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'otp' | 'register';
  isMegaMenuOpen: boolean;
  selectedCategorySlug: string | null;
  pincode: string;
  isPincodeModalOpen: boolean;
  openAuthModal: (tab?: 'login' | 'otp' | 'register') => void;
  closeAuthModal: () => void;
  setMegaMenuOpen: (open: boolean, categorySlug?: string) => void;
  setPincode: (pincode: string) => void;
  setPincodeModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAuthModalOpen: false,
  authModalTab: 'login',
  isMegaMenuOpen: false,
  selectedCategorySlug: null,
  pincode: typeof window !== 'undefined'
    ? localStorage.getItem(STORAGE_KEYS.SELECTED_PINCODE) || APP_CONFIG.defaultPincode
    : APP_CONFIG.defaultPincode,
  isPincodeModalOpen: false,

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setMegaMenuOpen: (open, categorySlug) =>
    set({ isMegaMenuOpen: open, selectedCategorySlug: categorySlug ?? null }),
  setPincode: (pincode: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PINCODE, pincode);
    }
    set({ pincode });
  },
  setPincodeModalOpen: (open) => set({ isPincodeModalOpen: open }),
}));
