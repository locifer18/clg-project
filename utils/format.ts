/**
 * Currency and Number Formatting Utilities
 * For product prices, order totals, statistics
 */

/**
 * Format number as Indian Rupees
 * @example formatCurrency(1999.99) // "₹1,999.99"
 */
export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    locale?: string;
    decimals?: number;
  }
): string {
  const {
    currency = "INR",
    locale = "en-IN",
    decimals = 2,
  } = options || {};

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format number with commas (Indian numbering system)
 * @example formatNumber(1999999) // "19,99,999"
 */
export function formatNumber(num: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format number in compact form (1K, 1M, 1B)
 * @example formatCompactNumber(1500) // "1.5K"
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

/**
 * Calculate percentage
 * @example calculatePercentage(50, 200) // 25
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate discount percentage
 * @example calculateDiscount(1000, 800) // 20 (20% off)
 */
export function calculateDiscount(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice === 0) return 0;
  return Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100
  );
}

/**
 * Clamp number between min and max
 * @example clamp(150, 0, 100) // 100
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round to nearest decimal places
 * @example roundToDecimals(1.2345, 2) // 1.23
 */
export function roundToDecimals(num: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
}

/**
 * Calculate tax amount
 * @example calculateTax(1000, 18) // 180 (18% GST)
 */
export function calculateTax(amount: number, taxRate: number): number {
  return roundToDecimals((amount * taxRate) / 100, 2);
}

/**
 * Calculate shipping cost based on order value
 * Free shipping above threshold
 */
export function calculateShipping(
  orderTotal: number,
  freeShippingThreshold = 500
): number {
  if (orderTotal >= freeShippingThreshold) return 0;
  return 50; // Base shipping cost
}

/**
 * Format percentage
 * @example formatPercentage(0.15) // "15%"
 */
export function formatPercentage(
  value: number,
  decimals = 0
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}