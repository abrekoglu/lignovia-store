/**
 * Price Formatting Utilities for LIGNOVIA Storefront
 * 
 * Provides consistent price formatting across the entire application
 */

import { currencyConfig } from '@/config/currency';

/**
 * Format a price amount with currency symbol and locale formatting
 * @param {number|string|null|undefined} amount - Price amount
 * @param {Object} options - Formatting options
 * @param {boolean} options.showSymbol - Show currency symbol (default: true)
 * @param {number} options.decimals - Number of decimal places (default: from config)
 * @param {string} options.locale - Locale for formatting (default: from config)
 * @param {string} options.position - Currency position 'before' or 'after' (default: from config)
 * @returns {string} Formatted price string (e.g., "₺129,90" or "$19.99")
 */
export function formatPrice(amount, options = {}) {
  const {
    showSymbol = true,
    decimals = currencyConfig.decimals,
    locale = currencyConfig.locale,
    position = currencyConfig.position,
    symbol = currencyConfig.symbol,
  } = options;

  // Handle invalid/null/undefined amounts
  if (amount === null || amount === undefined || amount === '' || isNaN(amount)) {
    const zeroFormatted = (0).toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return showSymbol 
      ? (position === 'before' ? `${symbol}${zeroFormatted}` : `${zeroFormatted} ${symbol}`)
      : zeroFormatted;
  }

  // Convert to number if string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid conversion
  if (isNaN(numAmount)) {
    const zeroFormatted = (0).toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return showSymbol 
      ? (position === 'before' ? `${symbol}${zeroFormatted}` : `${zeroFormatted} ${symbol}`)
      : zeroFormatted;
  }

  // Format number with locale
  const formatted = numAmount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Add currency symbol
  if (!showSymbol) {
    return formatted;
  }

  return position === 'before' 
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`;
}

/**
 * Format a price without currency symbol
 * @param {number|string|null|undefined} amount - Price amount
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price string without symbol
 */
export function formatPriceAmount(amount, options = {}) {
  return formatPrice(amount, { ...options, showSymbol: false });
}

/**
 * Format a price with custom symbol
 * @param {number|string|null|undefined} amount - Price amount
 * @param {string} customSymbol - Custom currency symbol
 * @param {Object} options - Additional formatting options
 * @returns {string} Formatted price string with custom symbol
 */
export function formatPriceWithSymbol(amount, customSymbol, options = {}) {
  return formatPrice(amount, { ...options, symbol: customSymbol });
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original/compare at price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage (0-100)
 */
export function calculateDiscountPercentage(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice || originalPrice <= 0) {
    return 0;
  }
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Check if product has a discount
 * @param {Object} product - Product object
 * @returns {boolean} True if product has discount
 */
export function hasDiscount(product) {
  if (!product) return false;
  const compareAtPrice = product.compareAtPrice || product.compareAt || 0;
  const price = product.price || 0;
  return compareAtPrice > 0 && compareAtPrice > price;
}

/**
 * Get the display price (sale price if discounted, regular price otherwise)
 * @param {Object} product - Product object
 * @returns {number} Display price
 */
export function getDisplayPrice(product) {
  if (!product) return 0;
  return product.price || 0;
}

/**
 * Get the compare at price (original price before discount)
 * @param {Object} product - Product object
 * @returns {number|null} Compare at price or null
 */
export function getCompareAtPrice(product) {
  if (!product) return null;
  const compareAtPrice = product.compareAtPrice || product.compareAt || null;
  if (compareAtPrice && compareAtPrice > (product.price || 0)) {
    return compareAtPrice;
  }
  return null;
}

