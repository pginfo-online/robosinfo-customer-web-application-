// =====================================================================
// Customer Web Platform — Design Tokens & Theme Specification
// =====================================================================

export const theme = {
  colors: {
    // Primary Brand Identity: Deep Royal Sapphire & Electric Indigo
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core brand primary
      700: '#1d4ed8', // Core hover
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    // Emerald Accents: Discounts, Savings, In-stock highlights
    accent: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669', // Core savings highlight
      700: '#047857',
    },
    // Flash Sale / Urgency Coral
    urgency: {
      500: '#ef4444',
      600: '#dc2626',
    },
    // Review Rating Star Gold
    rating: {
      star: '#f59e0b',
      starMuted: '#e2e8f0',
    },
    // Neutral Scales (Canvas, Surfaces, Typography)
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
  },

  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '22px',
    full: '9999px',
  },

  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 1px 3px -1px rgba(15, 23, 42, 0.04)',
    cardHover: '0 12px 24px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.06)',
    dropdown: '0 20px 30px -10px rgba(15, 23, 42, 0.18), 0 8px 16px -4px rgba(15, 23, 42, 0.08)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '350ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type Theme = typeof theme;
