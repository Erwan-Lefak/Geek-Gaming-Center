/**
 * Currency utilities for Geek Gaming Center
 * Handles FCFA (West African CFA Franc) formatting and cart calculations
 */

import { CartItem } from '@/types/cart';

/**
 * Format price to FCFA (West African CFA Franc)
 * @param price - Price in FCFA (number)
 * @returns Formatted price string (e.g., "100 000 FCFA")
 *
 * @example
 * formatFCFA(100000) // "100 000 FCFA"
 * formatFCFA(1234567) // "1 234 567 FCFA"
 */
export function formatFCFA(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF', // FCFA ISO code
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Calculate cart subtotal from cart items
 * @param items - Array of cart items
 * @returns Subtotal in FCFA
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
}

/**
 * Calculate cart total (subtotal + tax + shipping)
 * For now, returns subtotal. Can be extended for tax/shipping calculation.
 * @param items - Array of cart items
 * @param taxRate - Tax rate (default 0 for now)
 * @param shippingCost - Shipping cost in FCFA (default 0 for now)
 * @returns Total in FCFA
 */
export function calculateTotal(
  items: CartItem[],
  taxRate: number = 0,
  shippingCost: number = 0
): number {
  const subtotal = calculateSubtotal(items);
  const tax = subtotal * taxRate;
  return subtotal + tax + shippingCost;
}

/**
 * Format price range (for products with multiple prices)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatFCFA(minPrice);
  }
  return `${formatFCFA(minPrice)} - ${formatFCFA(maxPrice)}`;
}

/**
 * Parse FCFA string back to number
 * @param formatted - Formatted FCFA string
 * @returns Price as number
 */
export function parseFCFA(formatted: string): number {
  // Remove spaces, "FCFA", "XAF", and any non-numeric characters except decimal point
  const cleaned = formatted
    .replace(/\s/g, '')
    .replace(/[A-Za-z]/g, '')
    .replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Discount percentage (0-100)
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Apply discount percentage to price
 * @param price - Original price
 * @param discountPercentage - Discount percentage (0-100)
 * @returns Discounted price
 */
export function applyDiscount(
  price: number,
  discountPercentage: number
): number {
  if (discountPercentage <= 0 || discountPercentage > 100) {
    return price;
  }
  return Math.round(price * (1 - discountPercentage / 100));
}
