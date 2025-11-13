import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { normalizeProductImages } from "@/utils/imageUtils";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { id } = req.query;
  const limit = parseInt(req.query.limit) || 8;

  try {
    // Find the current product
    const currentProduct = await Product.findById(id).lean();

    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Get all descendant category IDs (for hierarchical category matching)
    const getAllDescendantIds = async (categoryId) => {
      if (!categoryId) return [];
      
      const descendants = [];
      const findChildren = async (parentId) => {
        const children = await Category.find({ parentCategory: parentId }).select("_id").lean();
        for (const child of children) {
          descendants.push(String(child._id));
          await findChildren(child._id);
        }
      };
      await findChildren(categoryId);
      return descendants;
    };

    // Get category and subcategory info
    let categoryId = null;
    let subcategoryId = null;
    let categoryInfo = null;
    let subcategoryInfo = null;
    let descendantCategoryIds = [];

    if (currentProduct.category) {
      // Try to find category by ID or slug
      categoryInfo = await Category.findOne({
        $or: [{ _id: currentProduct.category }, { slug: currentProduct.category }],
      }).lean();

      if (categoryInfo) {
        categoryId = String(categoryInfo._id);
        descendantCategoryIds = await getAllDescendantIds(categoryInfo._id);
        descendantCategoryIds = [categoryId, ...descendantCategoryIds];
      } else {
        // Fallback: use category string directly
        categoryId = String(currentProduct.category);
      }
    }

    if (currentProduct.subcategory) {
      subcategoryInfo = await Category.findOne({
        $or: [{ _id: currentProduct.subcategory }, { slug: currentProduct.subcategory }],
      }).lean();
      
      if (subcategoryInfo) {
        subcategoryId = String(subcategoryInfo._id);
      } else {
        subcategoryId = String(currentProduct.subcategory);
      }
    }

    // Get product tags (normalize to lowercase)
    const productTags = Array.isArray(currentProduct.tags)
      ? currentProduct.tags.map((tag) => String(tag).toLowerCase()).filter(Boolean)
      : [];

    // Base query: exclude current product and only show published, public, in-stock products
    const baseQuery = {
      _id: { $ne: currentProduct._id },
      status: "published",
      visibility: "public",
      inStock: true,
    };

    // Build ranked query groups with relevance scoring
    const relatedProducts = [];

    // Priority 1: Same category (including subcategories)
    if (descendantCategoryIds.length > 0) {
      const sameCategoryProducts = await Product.find({
        ...baseQuery,
        category: { $in: descendantCategoryIds },
      })
        .select("name slug price mainImage image images shortDescription stock category subcategory tags views purchases description")
        .limit(limit * 2) // Get more to sort by tags
        .lean();

      // Score products: same exact category = 100, same subcategory = 80, descendant = 60
      sameCategoryProducts.forEach((product) => {
        let score = 60; // Base score for being in category tree
        
        if (categoryId && String(product.category) === categoryId) {
          score = 100; // Exact same category
        }
        
        if (subcategoryId && String(product.subcategory) === subcategoryId) {
          score = Math.max(score, 80); // Same subcategory
        }

        // Add tag relevance bonus (up to +20 points)
        if (productTags.length > 0 && product.tags && Array.isArray(product.tags)) {
          const productTagMatches = product.tags.filter((tag) =>
            productTags.includes(String(tag).toLowerCase())
          ).length;
          const tagScore = Math.min((productTagMatches / productTags.length) * 20, 20);
          score += tagScore;
        }

        relatedProducts.push({ ...product, relevanceScore: score });
      });
    }

    // Priority 2: Same tags but different category (if we need more products)
    if (relatedProducts.length < limit && productTags.length > 0) {
      const sameTagProducts = await Product.find({
        ...baseQuery,
        tags: { $in: productTags },
        _id: { $nin: relatedProducts.map((p) => p._id) }, // Exclude already found products
      })
        .select("name slug price mainImage image images shortDescription stock category subcategory tags views purchases description")
        .limit(limit)
        .lean();

      sameTagProducts.forEach((product) => {
        const productTagMatches = product.tags
          ? product.tags.filter((tag) => productTags.includes(String(tag).toLowerCase())).length
          : 0;
        const tagScore = (productTagMatches / productTags.length) * 40; // Max 40 points for tags-only match
        
        relatedProducts.push({ ...product, relevanceScore: tagScore });
      });
    }

    // Priority 3: Fallback to newest products in same main category (if available)
    if (relatedProducts.length < limit && categoryId) {
      const fallbackProducts = await Product.find({
        ...baseQuery,
        category: categoryId,
        _id: { $nin: relatedProducts.map((p) => p._id) },
      })
        .select("name slug price mainImage image images shortDescription stock category subcategory tags views purchases description")
        .sort({ createdAt: -1 })
        .limit(limit - relatedProducts.length)
        .lean();

      fallbackProducts.forEach((product) => {
        relatedProducts.push({ ...product, relevanceScore: 10 }); // Low relevance for fallback
      });
    }

    // Sort by relevance score (highest first), then by views/popularity, then by creation date
    relatedProducts.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      // Secondary sort by popularity (views + purchases)
      const aPopularity = (a.views || 0) + (a.purchases || 0);
      const bPopularity = (b.views || 0) + (b.purchases || 0);
      if (bPopularity !== aPopularity) {
        return bPopularity - aPopularity;
      }
      // Tertiary sort by newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Limit to requested number and normalize images and slug
    const finalProducts = relatedProducts.slice(0, limit).map((product) => {
      // Remove relevanceScore from response
      const { relevanceScore, ...productData } = product;
      
      // Ensure slug exists (critical for navigation) - products should always have slugs
      let finalSlug = productData.slug;
      
      if (!finalSlug || finalSlug.trim() === "") {
        console.warn(`Product ${productData._id} (${productData.name}) missing slug, generating fallback`);
        // If slug is missing, try to generate from name
        if (productData.name) {
          finalSlug = productData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
            .trim();
        }
        
        // If still no slug, use ID as last resort (though this shouldn't happen)
        if (!finalSlug || finalSlug === "") {
          finalSlug = String(productData._id);
        }
      }
      
      // Normalize product images and ensure slug
      const normalizedProduct = normalizeProductImages({
        ...productData,
        slug: String(finalSlug).trim() || String(productData._id),
      });
      
      return normalizedProduct;
    });

    return res.status(200).json({
      success: true,
      data: {
        products: finalProducts,
        count: finalProducts.length,
        currentProductCategory: categoryInfo
          ? {
              _id: categoryInfo._id,
              name: categoryInfo.name,
              slug: categoryInfo.slug,
            }
          : null,
        currentProductSubcategory: subcategoryInfo
          ? {
              _id: subcategoryInfo._id,
              name: subcategoryInfo.name,
              slug: subcategoryInfo.slug,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch related products",
    });
  }
}

