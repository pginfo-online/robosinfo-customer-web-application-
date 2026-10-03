// =====================================================================
// Customer Web Platform — Typography Hierarchy
// =====================================================================

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans), "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif',
    mono: 'var(--font-mono), "JetBrains Mono", monospace',
  },

  // Type scales tailored for e-commerce readability and conversion
  scale: {
    hero: 'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight',
    sectionTitle: 'text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white',
    sectionSubtitle: 'text-sm text-slate-500 dark:text-slate-400 font-medium',
    productTitle: 'text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-blue-600 transition-colors',
    productDetailTitle: 'text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug',
    priceBig: 'text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight',
    priceCard: 'text-base font-bold text-slate-900 dark:text-white',
    priceMrp: 'text-xs text-slate-400 line-through font-medium',
    priceDiscount: 'text-xs font-bold text-emerald-600 dark:text-emerald-400',
    emiTag: 'text-[11px] font-bold tracking-wide uppercase',
    badge: 'text-[11px] font-semibold tracking-wider uppercase',
    body: 'text-sm text-slate-600 dark:text-slate-300 leading-relaxed',
    bodySmall: 'text-xs text-slate-500 dark:text-slate-400',
    label: 'text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider',
  },
} as const;
