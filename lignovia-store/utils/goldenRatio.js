/**
 * Golden Ratio (Phi) Constants and Utilities
 * Phi = 1.618033988749895...
 * 
 * Used for premium, mathematically balanced design
 */

export const PHI = 1.618033988749895;
export const PHI_SQUARED = PHI * PHI; // 2.618...
export const PHI_CUBED = PHI_SQUARED * PHI; // 4.236...
export const PHI_INVERSE = 1 / PHI; // 0.618...

/**
 * Calculate golden ratio spacing
 * @param {number} base - Base size in pixels or rem
 * @param {number} multiplier - Phi multiplier (1, 1.618, 2.618, etc.)
 * @returns {number} Calculated size
 */
export function phiScale(base, multiplier = PHI) {
  return base * multiplier;
}

/**
 * Golden ratio typography scale
 * Base size multiplied by phi powers
 */
export const typeScale = {
  xs: 0.618,      // base * 0.618
  sm: 1,          // base (1rem)
  base: 1.618,    // base * 1.618
  lg: 2.618,      // base * 2.618
  xl: 4.236,      // base * 4.236
  '2xl': 6.854,   // base * 4.236 * 1.618
  '3xl': 11.09,   // base * 4.236 * 2.618
};

/**
 * Golden ratio spacing scale (in rem)
 * Each step is multiplied by phi
 */
export const spacing = {
  xs: '0.618rem',    // ~10px
  sm: '1rem',        // 16px
  base: '1.618rem',  // ~26px
  md: '2.618rem',    // ~42px
  lg: '4.236rem',    // ~68px
  xl: '6.854rem',    // ~110px
  '2xl': '11.09rem', // ~177px
  '3xl': '17.944rem', // ~287px
};

/**
 * Golden ratio aspect ratios
 */
export const aspectRatios = {
  golden: '1/1.618',      // Classic golden ratio
  wide: '16/10',          // Approximately golden
  portrait: '1.618/1',    // Inverse
};

/**
 * Get golden ratio split widths (for two-column layouts)
 */
export const goldenSplit = {
  wide: '61.8%',   // phi / (phi + 1)
  narrow: '38.2%', // 1 / (phi + 1)
};

/**
 * Golden ratio border radius scale
 */
export const borderRadius = {
  sm: '0.618rem',   // ~10px
  base: '1rem',     // 16px
  md: '1.618rem',   // ~26px
  lg: '2.618rem',   // ~42px
  xl: '4.236rem',   // ~68px
};

