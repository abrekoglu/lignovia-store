/**
 * Image Utilities for Lignovia Storefront
 * 
 * Provides consistent image normalization across the entire application
 */

/**
 * Get the primary image for a product
 * @param {Object} product - Product object
 * @returns {string|null} - Image URL or null if no image available
 */
export function getProductImage(product) {
  if (!product) return null;
  
  // Priority order: mainImage > images[0] > image (legacy) > null
  if (product.mainImage && product.mainImage.trim()) {
    return normalizeImageUrl(product.mainImage);
  }
  
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage && firstImage.trim()) {
      return normalizeImageUrl(firstImage);
    }
  }
  
  // Legacy support
  if (product.image && product.image.trim()) {
    return normalizeImageUrl(product.image);
  }
  
  return null;
}

/**
 * Get the secondary/hover image for a product
 * @param {Object} product - Product object
 * @returns {string|null} - Image URL or null if no secondary image available
 */
export function getProductHoverImage(product) {
  if (!product || !product.images || !Array.isArray(product.images) || product.images.length < 2) {
    return null;
  }
  
  const secondImage = product.images[1];
  if (secondImage && secondImage.trim()) {
    return normalizeImageUrl(secondImage);
  }
  
  return null;
}

/**
 * Get all images for a product gallery
 * @param {Object} product - Product object
 * @returns {string[]} - Array of image URLs
 */
export function getProductImages(product) {
  if (!product) return [];
  
  const images = [];
  
  // Add mainImage first if exists
  if (product.mainImage && product.mainImage.trim()) {
    images.push(normalizeImageUrl(product.mainImage));
  }
  
  // Add images array (excluding mainImage if it's the same)
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img) => {
      if (img && img.trim()) {
        const normalizedUrl = normalizeImageUrl(img);
        // Avoid duplicates
        if (!images.includes(normalizedUrl)) {
          images.push(normalizedUrl);
        }
      }
    });
  }
  
  // Legacy support: add image if not already included
  if (product.image && product.image.trim()) {
    const normalizedUrl = normalizeImageUrl(product.image);
    if (!images.includes(normalizedUrl)) {
      images.unshift(normalizedUrl); // Add to beginning
    }
  }
  
  return images;
}

/**
 * Normalize image URL to ensure it's valid for Next.js Image component
 * @param {string} url - Image URL
 * @returns {string} - Normalized URL
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';
  
  // If it's already an absolute URL (http://, https://, //), return as is
  if (/^(https?:\/\/|\/\/)/.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // If it starts with /, it's a relative path from public folder, return as is
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }
  
  // Otherwise, assume it's a relative path and prepend /
  return `/${trimmedUrl}`;
}

/**
 * Check if an image URL is external (requires domain configuration in next.config.js)
 * @param {string} url - Image URL
 * @returns {boolean} - True if external URL
 */
export function isExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/|\/\/)/.test(url.trim());
}

/**
 * Normalize a product object to have consistent image fields
 * @param {Object} product - Product object from database
 * @returns {Object} - Product object with normalized image fields
 */
export function normalizeProductImages(product) {
  if (!product) return product;
  
  const primaryImage = getProductImage(product);
  const hoverImage = getProductHoverImage(product);
  const allImages = getProductImages(product);
  
  return {
    ...product,
    // Ensure mainImage is always set
    mainImage: primaryImage || null,
    // Ensure images array exists and has at least one image
    images: allImages.length > 0 ? allImages : (primaryImage ? [primaryImage] : []),
    // Legacy field for backward compatibility
    image: primaryImage || null,
    // Hover image for ProductCard
    hoverImage: hoverImage || null,
  };
}

