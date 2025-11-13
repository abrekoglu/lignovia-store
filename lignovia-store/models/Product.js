import mongoose from "mongoose";

/**
 * LIGNOVIA Product Schema
 * 
 * Complete, production-level e-commerce product schema supporting:
 * - Basic product information
 * - Media galleries
 * - Pricing & discounts
 * - Inventory management
 * - Variants system
 * - Product attributes
 * - Shipping & logistics
 * - SEO optimization
 * - Analytics tracking
 * - Status & visibility control
 * - Internal metadata
 */

// Variant Option Schema
const VariantOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

// Variant Group Schema
const VariantGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    enum: ['Color', 'Size', 'Material', 'Finish', 'Style', 'Custom'],
  },
  options: [VariantOptionSchema],
}, { _id: false });

// Individual Variant Schema
const VariantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  optionValues: {
    type: Map,
    of: String,
    default: {},
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    default: null,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  sku: {
    type: String,
    trim: true,
    sparse: true,
  },
  barcode: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

// Dimensions Schema
const DimensionsSchema = new mongoose.Schema({
  width: {
    type: Number,
    min: 0,
  },
  height: {
    type: Number,
    min: 0,
  },
  depth: {
    type: Number,
    min: 0,
  },
  thickness: {
    type: Number,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['cm', 'in', 'm', 'ft'],
    default: 'cm',
  },
}, { _id: false });

// Package Dimensions Schema
const PackageDimensionsSchema = new mongoose.Schema({
  length: {
    type: Number,
    min: 0,
  },
  width: {
    type: Number,
    min: 0,
  },
  height: {
    type: Number,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['cm', 'in', 'm', 'ft'],
    default: 'cm',
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lb', 'g', 'oz'],
    default: 'kg',
  },
}, { _id: false });

// Main Product Schema
const ProductSchema = new mongoose.Schema({
  // ============================================
  // 1. BASIC PRODUCT INFORMATION
  // ============================================
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
    index: true,
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [10000, 'Description cannot exceed 10000 characters'],
  },
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be a valid URL-friendly string'],
    index: true,
  },
  category: {
    type: String,
    trim: true,
    index: true,
  },
  subcategory: {
    type: String,
    trim: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  brand: {
    type: String,
    default: 'LIGNOVIA',
    trim: true,
    index: true,
  },

  // ============================================
  // 2. MEDIA FIELDS
  // ============================================
  mainImage: {
    type: String,
    trim: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  thumbnail: {
    type: String,
    trim: true,
  },
  video: {
    type: String,
    trim: true,
  },
  zoomImage: {
    type: String,
    trim: true,
  },
  // Backward compatibility: legacy 'image' field
  image: {
    type: String,
    trim: true,
  },

  // ============================================
  // 3. PRICING
  // ============================================
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    index: true,
  },
  compareAtPrice: {
    type: Number,
    default: null,
    min: [0, 'Compare at price cannot be negative'],
    validate: {
      validator: function(value) {
        return value === null || value === undefined || value > this.price;
      },
      message: 'Compare at price must be greater than regular price',
    },
  },
  currency: {
    type: String,
    default: 'TRY',
    uppercase: true,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'TRY'],
  },

  // ============================================
  // 4. INVENTORY / STOCK
  // ============================================
  inStock: {
    type: Boolean,
    default: true,
    index: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
    index: true,
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Low stock threshold cannot be negative'],
  },
  sku: {
    type: String,
    trim: true,
    sparse: true,
    unique: true,
    index: true,
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true,
  },
  inventoryLocation: {
    type: String,
    trim: true,
  },

  // ============================================
  // 5. VARIANTS SYSTEM
  // ============================================
  hasVariants: {
    type: Boolean,
    default: false,
    index: true,
  },
  variantGroups: [VariantGroupSchema],
  variants: [VariantSchema],

  // ============================================
  // 6. ATTRIBUTES / TECHNICAL DETAILS
  // ============================================
  material: {
    type: String,
    trim: true,
  },
  finish: {
    type: String,
    trim: true,
  },
  dimensions: DimensionsSchema,
  weight: {
    type: Number,
    min: 0,
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'lb', 'g', 'oz'],
    default: 'kg',
  },
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Care instructions cannot exceed 2000 characters'],
  },
  warranty: {
    type: String,
    trim: true,
    maxlength: [500, 'Warranty information cannot exceed 500 characters'],
  },

  // ============================================
  // 7. SHIPPING & LOGISTICS
  // ============================================
  packageDimensions: PackageDimensionsSchema,
  packageWeight: {
    type: Number,
    min: 0,
  },
  packageWeightUnit: {
    type: String,
    enum: ['kg', 'lb', 'g', 'oz'],
    default: 'kg',
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'expedited', 'overnight', 'fragile', 'oversized', 'free'],
    default: 'standard',
    index: true,
  },
  processingTime: {
    type: String,
    trim: true,
    default: '1-3 days',
  },

  // ============================================
  // 8. SEO FIELDS
  // ============================================
  seoTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'SEO title should not exceed 60 characters'],
  },
  seoDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'SEO description should not exceed 160 characters'],
  },
  seoKeywords: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  ogImage: {
    type: String,
    trim: true,
  },

  // ============================================
  // 9. ANALYTICS
  // ============================================
  views: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  purchases: {
    type: Number,
    default: 0,
    min: 0,
    index: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ============================================
  // 10. STATUS & VISIBILITY
  // ============================================
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
    index: true,
  },

  // ============================================
  // 11. INTERNAL METADATA
  // ============================================
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Internal notes cannot exceed 5000 characters'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ============================================
// INDEXES
// ============================================
// Compound indexes for common queries
ProductSchema.index({ status: 1, visibility: 1, inStock: 1 });
ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ price: 1, status: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ purchases: -1 });
ProductSchema.index({ rating: -1 });

// Text index for search
ProductSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
  category: 'text',
  subcategory: 'text',
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================
// Check if product is on sale
ProductSchema.virtual('isOnSale').get(function() {
  return this.compareAtPrice && this.compareAtPrice > this.price;
});

// Calculate discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Check if product is low stock
ProductSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Check if product is out of stock
ProductSchema.virtual('isOutOfStock').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.every(variant => !variant.inStock || variant.stock === 0);
  }
  return !this.inStock || this.stock === 0;
});

// Get default variant
ProductSchema.virtual('defaultVariant').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const defaultVariant = this.variants.find(v => v.isDefault);
    return defaultVariant || this.variants[0];
  }
  return null;
});

// Get available stock (including variants)
ProductSchema.virtual('availableStock').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    return this.variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  }
  return this.stock || 0;
});

// Get display price (lowest variant price or base price)
ProductSchema.virtual('displayPrice').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const prices = this.variants
      .filter(v => v.inStock && v.stock > 0)
      .map(v => v.price);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }
  return this.price;
});

// Get display compare at price (highest variant compare at price or base compare at price)
ProductSchema.virtual('displayCompareAtPrice').get(function() {
  if (this.hasVariants && this.variants.length > 0) {
    const compareAtPrices = this.variants
      .filter(v => v.compareAtPrice && v.compareAtPrice > v.price)
      .map(v => v.compareAtPrice);
    if (compareAtPrices.length > 0) {
      return Math.max(...compareAtPrices);
    }
  }
  return this.compareAtPrice;
});

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================
// Auto-generate slug from name if not provided
ProductSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set mainImage from image field if mainImage is not set (backward compatibility)
  if (!this.mainImage && this.image) {
    this.mainImage = this.image;
  }

  // Set image from mainImage if image is not set (backward compatibility)
  if (!this.image && this.mainImage) {
    this.image = this.mainImage;
  }

  // Set thumbnail from mainImage if thumbnail is not set
  if (!this.thumbnail && this.mainImage) {
    this.thumbnail = this.mainImage;
  }

  // Update inStock based on stock quantity
  if (!this.hasVariants) {
    this.inStock = this.stock > 0;
  } else if (this.variants.length > 0) {
    // Update inStock based on variant stock
    const hasStock = this.variants.some(v => v.inStock && v.stock > 0);
    this.inStock = hasStock;
  }

  // Auto-generate SEO title from name if not provided
  if (!this.seoTitle && this.name) {
    this.seoTitle = this.name;
  }

  // Auto-generate SEO description from shortDescription if not provided
  if (!this.seoDescription && this.shortDescription) {
    this.seoDescription = this.shortDescription.substring(0, 160);
  }

  // Set OG image from mainImage if not provided
  if (!this.ogImage && this.mainImage) {
    this.ogImage = this.mainImage;
  }

  next();
});

// ============================================
// INSTANCE METHODS
// ============================================
// Get variant by option values
ProductSchema.methods.getVariantByOptions = function(optionValues) {
  if (!this.hasVariants || !this.variants || this.variants.length === 0) {
    return null;
  }

  return this.variants.find(variant => {
    const variantOptionValues = Object.entries(variant.optionValues || {});
    const searchOptionValues = Object.entries(optionValues || {});

    if (variantOptionValues.length !== searchOptionValues.length) {
      return false;
    }

    return variantOptionValues.every(([key, value]) => {
      return searchOptionValues.some(([searchKey, searchValue]) => {
        return key === searchKey && value === searchValue;
      });
    });
  });
};

// Check if variant is available
ProductSchema.methods.isVariantAvailable = function(optionValues) {
  const variant = this.getVariantByOptions(optionValues);
  if (!variant) {
    return false;
  }
  return variant.inStock && variant.stock > 0;
};

// Increment view count
ProductSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
};

// Increment purchase count
ProductSchema.methods.incrementPurchases = async function(quantity = 1) {
  this.purchases = (this.purchases || 0) + quantity;
  await this.save();
};

// Update rating
ProductSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating || 0) * (this.ratingCount || 0) + newRating;
  this.ratingCount = (this.ratingCount || 0) + 1;
  this.rating = totalRating / this.ratingCount;
  await this.save();
};

// ============================================
// STATIC METHODS
// ============================================
// Find published products
ProductSchema.statics.findPublished = function(query = {}) {
  return this.find({
    ...query,
    status: 'published',
    visibility: 'public',
  });
};

// Find products in stock
ProductSchema.statics.findInStock = function(query = {}) {
  return this.find({
    ...query,
    inStock: true,
    $or: [
      { stock: { $gt: 0 } },
      { hasVariants: true, 'variants.stock': { $gt: 0 } },
    ],
  });
};

// Find low stock products
ProductSchema.statics.findLowStock = function(query = {}) {
  const lowStockThreshold = 10; // Default threshold
  return this.find({
    ...query,
    $or: [
      {
        hasVariants: false,
        stock: { $gt: 0, $lte: lowStockThreshold },
      },
      {
        hasVariants: true,
        'variants.stock': { $gt: 0, $lte: lowStockThreshold },
      },
    ],
  });
};

// Find products on sale
// Note: This returns products with compareAtPrice set. 
// Actual sale validation should be done in application logic using the isOnSale virtual.
ProductSchema.statics.findOnSale = function(query = {}) {
  return this.find({
    ...query,
    $or: [
      { compareAtPrice: { $exists: true, $ne: null, $gt: 0 } },
      { 'variants.compareAtPrice': { $exists: true, $ne: null, $gt: 0 } },
    ],
  });
};

// Search products
ProductSchema.statics.search = function(searchQuery, options = {}) {
  const {
    category,
    subcategory,
    minPrice,
    maxPrice,
    inStock,
    status,
    visibility,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 50,
    skip = 0,
  } = options;

  const query = {};

  // Text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Filters
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (minPrice !== undefined) query.price = { ...query.price, $gte: minPrice };
  if (maxPrice !== undefined) query.price = { ...query.price, ...query.price, $lte: maxPrice };
  if (inStock !== undefined) query.inStock = inStock;
  if (status) query.status = status;
  if (visibility) query.visibility = visibility;

  return this.find(query)
    .sort(sortBy === 'relevance' && searchQuery ? { score: { $meta: 'textScore' } } : { [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .limit(limit)
    .skip(skip);
};

// ============================================
// EXPORT
// ============================================
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
