# LIGNOVIA Product Schema Documentation

## Overview

The Product schema is a complete, production-level e-commerce product model designed for the LIGNOVIA brand. It supports all features required for the admin panel, storefront, SEO, shipping, variants, analytics, and product lifecycle management.

## Schema Structure

### 1. Basic Product Information

- **name** (String, required): Product name (max 200 chars, indexed)
- **shortDescription** (String): Brief product description (max 500 chars)
- **description** (String): Full product description (max 10000 chars)
- **slug** (String, required, unique): URL-friendly product identifier (indexed)
- **category** (String): Product category (indexed)
- **subcategory** (String): Product subcategory (indexed)
- **tags** (Array[String]): Product tags for search and filtering
- **brand** (String, default: "LIGNOVIA"): Product brand (indexed)

### 2. Media Fields

- **mainImage** (String): Primary product image
- **images** (Array[String]): Product image gallery
- **thumbnail** (String): Product thumbnail image
- **video** (String): Optional product video URL
- **zoomImage** (String): Optional zoom/high-resolution image
- **image** (String): Legacy image field (backward compatibility)

### 3. Pricing

- **price** (Number, required): Product price (min: 0, indexed)
- **compareAtPrice** (Number): Original price for discount display (must be > price)
- **currency** (String, default: "USD"): Currency code (USD, EUR, GBP, CAD, AUD, JPY, CNY)

### 4. Inventory / Stock

- **inStock** (Boolean, default: true): Product availability status (indexed)
- **stock** (Number, default: 0): Available stock quantity (min: 0, indexed)
- **lowStockThreshold** (Number, default: 10): Threshold for low stock warnings
- **sku** (String, unique, sparse): Stock Keeping Unit (indexed)
- **barcode** (String): Product barcode (EAN/UPC)
- **inventoryLocation** (String): Warehouse/location identifier

### 5. Variants System

- **hasVariants** (Boolean, default: false): Whether product has variants (indexed)
- **variantGroups** (Array): Variant option groups (Color, Size, Material, Finish, Style, Custom)
- **variants** (Array): Individual product variants with:
  - name, optionValues, price, compareAtPrice, stock, sku, barcode, image, inStock, isDefault

### 6. Attributes / Technical Details

- **material** (String): Product material
- **finish** (String): Product finish
- **dimensions** (Object): Product dimensions (width, height, depth, thickness, unit)
- **weight** (Number): Product weight
- **weightUnit** (String): Weight unit (kg, lb, g, oz)
- **careInstructions** (String): Care and maintenance instructions (max 2000 chars)
- **warranty** (String): Warranty information (max 500 chars)

### 7. Shipping & Logistics

- **packageDimensions** (Object): Package dimensions (length, width, height, weight, unit, weightUnit)
- **packageWeight** (Number): Package weight
- **packageWeightUnit** (String): Package weight unit (kg, lb, g, oz)
- **shippingClass** (String, default: "standard"): Shipping class (standard, expedited, overnight, fragile, oversized, free) (indexed)
- **processingTime** (String, default: "1-3 days"): Processing time before shipment

### 8. SEO Fields

- **seoTitle** (String): SEO title (max 60 chars)
- **seoDescription** (String): SEO description (max 160 chars)
- **seoKeywords** (Array[String]): SEO keywords
- **ogImage** (String): Open Graph image for social sharing

### 9. Analytics

- **views** (Number, default: 0): Product view count (indexed)
- **purchases** (Number, default: 0): Product purchase count (indexed)
- **rating** (Number, default: 0): Average rating (0-5, indexed)
- **ratingCount** (Number, default: 0): Number of ratings

### 10. Status & Visibility

- **status** (String, default: "published"): Product status (draft, published, archived) (indexed)
- **visibility** (String, default: "public"): Product visibility (public, private) (indexed)

### 11. Internal Metadata

- **notes** (String): Internal admin notes (max 5000 chars)
- **createdBy** (ObjectId): User who created the product (ref: User, indexed)
- **createdAt** (Date): Product creation timestamp (auto-generated)
- **updatedAt** (Date): Product last update timestamp (auto-generated)

## Indexes

### Single Field Indexes
- name
- slug (unique)
- category
- subcategory
- brand
- price
- inStock
- stock
- sku (unique, sparse)
- status
- visibility
- shippingClass
- views
- purchases
- rating
- createdAt
- createdBy

### Compound Indexes
- { status: 1, visibility: 1, inStock: 1 }
- { category: 1, subcategory: 1 }
- { price: 1, status: 1 }

### Text Index
- { name: 'text', description: 'text', shortDescription: 'text', tags: 'text', category: 'text', subcategory: 'text' }

## Virtual Properties

### isOnSale
Returns `true` if product has a compareAtPrice greater than price.

### discountPercentage
Calculates discount percentage: `((compareAtPrice - price) / compareAtPrice) * 100`

### isLowStock
Returns `true` if stock is greater than 0 but less than or equal to lowStockThreshold.

### isOutOfStock
Returns `true` if product has no available stock (including variants).

### defaultVariant
Returns the default variant (marked with `isDefault: true`) or the first variant.

### availableStock
Returns total available stock including all variants.

### displayPrice
Returns the lowest variant price (if variants exist) or base price.

### displayCompareAtPrice
Returns the highest variant compareAtPrice (if variants exist) or base compareAtPrice.

## Instance Methods

### getVariantByOptions(optionValues)
Finds a variant matching the provided option values.

**Parameters:**
- `optionValues` (Object): Key-value pairs of variant options (e.g., { Color: "Brown", Size: "Large" })

**Returns:** Variant object or `null`

### isVariantAvailable(optionValues)
Checks if a variant with the provided option values is available.

**Parameters:**
- `optionValues` (Object): Key-value pairs of variant options

**Returns:** `true` if variant exists and is in stock, `false` otherwise

### incrementViews()
Increments the product view count by 1.

**Returns:** Promise

### incrementPurchases(quantity)
Increments the product purchase count by the specified quantity.

**Parameters:**
- `quantity` (Number, default: 1): Number of purchases to add

**Returns:** Promise

### updateRating(newRating)
Updates the product rating by adding a new rating.

**Parameters:**
- `newRating` (Number): New rating value (0-5)

**Returns:** Promise

## Static Methods

### findPublished(query)
Finds all published, publicly visible products.

**Parameters:**
- `query` (Object, optional): Additional query filters

**Returns:** Query object

### findInStock(query)
Finds all products that are in stock (including variants).

**Parameters:**
- `query` (Object, optional): Additional query filters

**Returns:** Query object

### findLowStock(query)
Finds all products with low stock (stock <= lowStockThreshold).

**Parameters:**
- `query` (Object, optional): Additional query filters

**Returns:** Query object

### findOnSale(query)
Finds all products with compareAtPrice set (indicating a sale).

**Parameters:**
- `query` (Object, optional): Additional query filters

**Returns:** Query object

**Note:** Use the `isOnSale` virtual property to verify actual sale status.

### search(searchQuery, options)
Searches products by text and applies filters.

**Parameters:**
- `searchQuery` (String): Text search query
- `options` (Object, optional):
  - `category` (String): Filter by category
  - `subcategory` (String): Filter by subcategory
  - `minPrice` (Number): Minimum price filter
  - `maxPrice` (Number): Maximum price filter
  - `inStock` (Boolean): Filter by stock availability
  - `status` (String): Filter by status
  - `visibility` (String): Filter by visibility
  - `sortBy` (String, default: "createdAt"): Sort field
  - `sortOrder` (String, default: "desc"): Sort order ("asc" or "desc")
  - `limit` (Number, default: 50): Result limit
  - `skip` (Number, default: 0): Result skip

**Returns:** Query object

## Pre-Save Middleware

The schema includes pre-save middleware that:

1. **Auto-generates slug** from name if not provided
2. **Syncs image fields** for backward compatibility (mainImage ↔ image)
3. **Sets thumbnail** from mainImage if not provided
4. **Updates inStock** based on stock quantity or variant availability
5. **Auto-generates SEO fields** from name and shortDescription if not provided
6. **Sets OG image** from mainImage if not provided

## Backward Compatibility

The schema maintains backward compatibility with the old minimal model:

- Legacy `image` field is preserved and synced with `mainImage`
- All existing fields (name, description, price, inStock, stock, slug) are maintained
- Existing API routes will continue to work without modification
- New fields have sensible defaults

## Usage Examples

### Create a Simple Product

```javascript
const product = await Product.create({
  name: "Handcrafted Wooden Bowl",
  shortDescription: "Beautiful handcrafted wooden bowl",
  description: "Full description here...",
  price: 49.99,
  category: "Bowls",
  stock: 10,
  slug: "handcrafted-wooden-bowl",
});
```

### Create a Product with Variants

```javascript
const product = await Product.create({
  name: "Wooden Cutting Board",
  price: 39.99,
  hasVariants: true,
  variantGroups: [
    {
      name: "Size",
      options: [
        { name: "Small", value: "small" },
        { name: "Large", value: "large" },
      ],
    },
    {
      name: "Material",
      options: [
        { name: "Oak", value: "oak" },
        { name: "Maple", value: "maple" },
      ],
    },
  ],
  variants: [
    {
      name: "Small Oak",
      optionValues: { Size: "small", Material: "oak" },
      price: 39.99,
      stock: 5,
      sku: "WCB-SM-OAK",
      isDefault: true,
    },
    {
      name: "Large Maple",
      optionValues: { Size: "large", Material: "maple" },
      price: 59.99,
      stock: 3,
      sku: "WCB-LG-MAP",
    },
  ],
});
```

### Find Products

```javascript
// Find published products
const products = await Product.findPublished();

// Find products in stock
const inStock = await Product.findInStock();

// Search products
const results = await Product.search("wooden bowl", {
  category: "Bowls",
  minPrice: 20,
  maxPrice: 100,
  inStock: true,
  sortBy: "price",
  sortOrder: "asc",
});
```

### Use Virtual Properties

```javascript
const product = await Product.findOne({ slug: "wooden-bowl" });

console.log(product.isOnSale); // true/false
console.log(product.discountPercentage); // 0-100
console.log(product.isLowStock); // true/false
console.log(product.displayPrice); // lowest price
```

### Use Instance Methods

```javascript
const product = await Product.findOne({ slug: "wooden-bowl" });

// Get variant by options
const variant = product.getVariantByOptions({ Size: "large", Material: "oak" });

// Check variant availability
const isAvailable = product.isVariantAvailable({ Size: "large", Material: "oak" });

// Increment views
await product.incrementViews();

// Update rating
await product.updateRating(4.5);
```

## Migration Guide

### From Old Schema to New Schema

The new schema is backward compatible, so existing products will continue to work. However, to take advantage of new features:

1. **Update existing products** to include new fields (shortDescription, category, etc.)
2. **Migrate image field** to mainImage (handled automatically by pre-save middleware)
3. **Add SEO fields** for better search engine optimization
4. **Set up variants** for products with multiple options
5. **Configure shipping** fields for accurate shipping calculations

### Example Migration Script

```javascript
// Migrate existing products
const products = await Product.find({});

for (const product of products) {
  // Set mainImage from image if not set
  if (!product.mainImage && product.image) {
    product.mainImage = product.image;
  }
  
  // Set thumbnail
  if (!product.thumbnail && product.mainImage) {
    product.thumbnail = product.mainImage;
  }
  
  // Set SEO fields
  if (!product.seoTitle && product.name) {
    product.seoTitle = product.name;
  }
  
  // Set status and visibility
  if (!product.status) {
    product.status = "published";
  }
  if (!product.visibility) {
    product.visibility = "public";
  }
  
  await product.save();
}
```

## Best Practices

1. **Always provide a slug** or let the pre-save middleware generate it
2. **Set shortDescription** for better storefront display
3. **Use variants** for products with multiple options (color, size, etc.)
4. **Set SEO fields** for better search engine visibility
5. **Configure shipping fields** for accurate shipping calculations
6. **Use status and visibility** to control product availability
7. **Track analytics** using incrementViews() and incrementPurchases()
8. **Use indexes** for frequently queried fields
9. **Validate data** before saving (handled by schema validators)
10. **Use virtual properties** for computed values (isOnSale, discountPercentage, etc.)

## Notes

- The schema uses Mongoose timestamps (createdAt, updatedAt) automatically
- Virtual properties are included in JSON output by default
- Text search requires a text index (already configured)
- Variants support nested option values for complex product configurations
- All prices are stored as numbers (use currency field for display)
- Stock management works for both simple products and variants
- SEO fields are auto-generated from name and shortDescription if not provided
- The schema is designed to be scalable and future-proof

## Support

For questions or issues with the Product schema, refer to:
- Schema source code: `models/Product.js`
- API routes: `pages/api/products/`
- Admin panel: `pages/admin/products.js`
- Storefront: `pages/shop.js`, `pages/product/[slug].js`


