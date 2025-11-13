/**
 * Global Currency Configuration for LIGNOVIA Storefront
 * 
 * This is the single source of truth for currency settings.
 * To change the currency, update the values below.
 */

export const currencyConfig = {
  // Currency code (ISO 4217)
  code: 'TRY',
  
  // Currency symbol
  symbol: '₺',
  
  // Locale for number formatting (tr-TR for Turkish Lira, en-US for USD)
  locale: 'tr-TR',
  
  // Number of decimal places
  decimals: 2,
  
  // Currency position: 'before' or 'after'
  position: 'before',
};

/**
 * Get currency configuration
 * @returns {Object} Currency configuration object
 */
export function getCurrencyConfig() {
  return currencyConfig;
}

/**
 * Set currency configuration (if needed for future multi-currency support)
 * @param {Object} config - Currency configuration
 */
export function setCurrencyConfig(config) {
  Object.assign(currencyConfig, config);
}

