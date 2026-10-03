// =====================================================================
// Customer Web Platform — Core Utilities & Formatters
// =====================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats paisa (integer) to INR Currency String (e.g. 7999900 -> ₹79,999)
 */
export function formatPaisa(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined) return '₹0';
  const rupees = paisa / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Calculates discount percentage
 */
export function calculateDiscount(mrpPaisa: number, sellingPricePaisa: number): number {
  if (!mrpPaisa || mrpPaisa <= sellingPricePaisa) return 0;
  return Math.round(((mrpPaisa - sellingPricePaisa) / mrpPaisa) * 100);
}

/**
 * Formats a monthly EMI estimate (e.g. 7999900 -> "₹6,667/m")
 */
export function formatMonthlyEmi(paisa: number, months = 12): string {
  if (!paisa || paisa <= 0) return '₹0/m';
  const monthlyPaisa = Math.round(paisa / months);
  return `${formatPaisa(monthlyPaisa)}/m`;
}

/**
 * Formats an ISO date string to a human-readable format
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Estimated delivery date string (e.g. "Free Delivery by Sunday, 20 Sep")
 */
export function getEstimatedDeliveryDate(daysFromNow = 3): string {
  const target = new Date();
  target.setDate(target.getDate() + daysFromNow);
  const weekday = target.toLocaleDateString('en-IN', { weekday: 'short' });
  const day = target.getDate();
  const month = target.toLocaleDateString('en-IN', { month: 'short' });
  return `Delivery by ${weekday}, ${day} ${month}`;
}
