import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { normalizeProductImages } from "@/utils/imageUtils";

/**
 * Search API Endpoint
 * Supports full-text search with relevance ranking, filters, sorting, and pagination
 */
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Parse query parameters
    const query = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "relevance";
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const inStockOnly = req.query.inStock === "true";
    const categoryFilter = req.query.category ? String(req.query.category) : null;
    const subcategoryFilter = req.query.subcategory ? String(req.query.subcategory) : null;

    if (!query.trim()) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
          matchedCategories: [],
          priceRange: { min: 0, max: 0 },
        },
      });
    }

    const searchQuery = query.trim().toLowerCase();

    // Build base query for published, public products
    const baseQuery = {
      status: "published",
      visibility: "public",
    };

    // Add stock filter if requested
    if (inStockOnly) {
      baseQuery.inStock = true;
    }

    // Add price filters
    if (minPrice !== null || maxPrice !== null) {
      baseQuery.price = {};
      if (minPrice !== null) baseQuery.price.$gte = minPrice;
      if (maxPrice !== null) baseQuery.price.$lte = maxPrice;
    }

    // Add category filter
    if (categoryFilter) {
      // Get all descendant categories for the selected category
      const getAllDescendantIds = async (categoryId) => {
        const descendants = [];
        const findChildren = async (parentId) => {
          const children = await Category.find({ parentCategory: parentId })
            .select("_id")
            .lean();
          for (const child of children) {
            descendants.push(child._id);
            await findChildren(child._id);
          }
        };
        await findChildren(categoryId);
        return descendants;
      };

      const descendantIds = await getAllDescendantIds(categoryFilter);
      const categoryIdsForFilter = [categoryFilter, ...descendantIds].map((id) =>
        String(id)
      );
      baseQuery.category = { $in: categoryIdsForFilter };
    }

    // Add subcategory filter
    if (subcategoryFilter) {
      baseQuery.category = subcategoryFilter;
    }

    // Build text search query using regex for case-insensitive matching
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const textSearchRegex = new RegExp(escapedQuery, "i");

    // Find all products that match the base query and text search
    // Use flexible matching - search in multiple fields
    const allMatchingProducts = await Product.find({
      ...baseQuery,
      $or: [
        { name: textSearchRegex },
        { description: textSearchRegex },
        { shortDescription: textSearchRegex },
        { tags: { $in: [textSearchRegex] } },
        { slug: textSearchRegex },
      ],
    }).lean();

    // Also search in categories and match products by category
    const matchingCategories = await Category.find({
      visibility: "public",
      $or: [
        { name: textSearchRegex },
        { slug: textSearchRegex },
        { description: textSearchRegex },
      ],
    }).lean();

    const categoryIds = matchingCategories.map((cat) => String(cat._id));
    const alreadyMatchedIds = new Set(allMatchingProducts.map((p) => String(p._id)));

    // Get products matching categories
    let categoryMatchedProducts = [];
    if (categoryIds.length > 0) {
      categoryMatchedProducts = await Product.find({
        ...baseQuery,
        category: { $in: categoryIds },
        _id: { $nin: Array.from(alreadyMatchedIds) }, // Exclude already matched products
      }).lean();
    }

    // Combine all products
    const allProducts = [...allMatchingProducts, ...categoryMatchedProducts];

    // Calculate relevance score for each product
    const productsWithRelevance = allProducts.map((product) => {
      let relevanceScore = 0;
      const productNameLower = (product.name || "").toLowerCase();
      const productDescLower = (product.description || "").toLowerCase();
      const productShortDescLower = (product.shortDescription || "").toLowerCase();
      const productSlugLower = (product.slug || "").toLowerCase();
      const productTags = (product.tags || []).map((t) => t.toLowerCase());

      // Exact name match (highest priority)
      if (productNameLower === searchQuery) {
        relevanceScore += 1000;
      } else if (productNameLower.startsWith(searchQuery)) {
        relevanceScore += 800;
      } else if (productNameLower.includes(searchQuery)) {
        relevanceScore += 600;
      }

      // Category match
      if (categoryIds.includes(String(product.category))) {
        relevanceScore += 400;
      }

      // Tags match
      if (productTags.some((tag) => tag.includes(searchQuery))) {
        relevanceScore += 300;
      }

      // Description match
      if (productDescLower.includes(searchQuery)) {
        relevanceScore += 200;
      } else if (productShortDescLower.includes(searchQuery)) {
        relevanceScore += 150;
      }

      // Slug match (lower priority)
      if (productSlugLower.includes(searchQuery)) {
        relevanceScore += 100;
      }

      // Add bonus for exact word matches
      const searchWords = searchQuery.split(/\s+/);
      searchWords.forEach((word) => {
        if (word.length > 2) {
          if (productNameLower.includes(word)) {
            relevanceScore += 50;
          }
          if (productTags.some((tag) => tag.includes(word))) {
            relevanceScore += 25;
          }
        }
      });

      return {
        ...product,
        relevanceScore,
      };
    });

    // Remove duplicates by _id
    const uniqueProducts = [];
    const seenIds = new Set();
    productsWithRelevance.forEach((product) => {
      if (!seenIds.has(String(product._id))) {
        seenIds.add(String(product._id));
        uniqueProducts.push(product);
      }
    });

    // Sort by relevance score (if sort is "relevance")
    if (sort === "relevance") {
      uniqueProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Apply other sorting options
    let sortedProducts = [...uniqueProducts];
    if (sort === "price-low") {
      sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === "price-high") {
      sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === "newest") {
      sortedProducts.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    } else if (sort === "alphabetical") {
      sortedProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    // Calculate total count and pagination
    const total = sortedProducts.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedProducts = sortedProducts.slice(skip, skip + limit);

    // Normalize images for products
    const productsWithImages = paginatedProducts.map((product) =>
      normalizeProductImages(product)
    );

    // Remove relevanceScore from final output
    const finalProducts = productsWithImages.map(({ relevanceScore, ...rest }) => rest);

    // Calculate price range
    const prices = allProducts.map((p) => p.price || 0).filter((p) => p > 0);
    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        products: finalProducts,
        total,
        page,
        totalPages,
        limit,
        matchedCategories: matchingCategories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
        })),
        priceRange,
      },
    });
  } catch (error) {
    console.error("Error in search API:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to perform search",
    });
  }
}

