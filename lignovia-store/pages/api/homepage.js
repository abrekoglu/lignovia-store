import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { normalizeProductImages } from "@/utils/imageUtils";

/**
 * Homepage API Endpoint
 * Returns featured categories, featured products, new arrivals, and best sellers
 */
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Base query for published, public products
    const baseProductQuery = {
      status: "published",
      visibility: "public",
      inStock: true,
    };

    // Get Featured Categories (top-level categories with highest product count, limit 6)
    const allCategories = await Category.find({ visibility: "public" })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Get product counts for categories
    const categoriesWithCounts = await Promise.all(
      allCategories.map(async (category) => {
        const productCount = await Product.countDocuments({
          ...baseProductQuery,
          category: String(category._id),
        });
        return {
          ...category,
          productCount,
        };
      })
    );

    // Get top-level categories (no parent) sorted by product count
    const featuredCategories = categoriesWithCounts
      .filter((cat) => !cat.parentCategory)
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
      .slice(0, 6)
      .map((cat) => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        productCount: cat.productCount || 0,
      }));

    // Get Featured Products (products with highest views, fallback to createdAt, limit 8)
    const featuredProducts = await Product.find(baseProductQuery)
      .sort({ views: -1, createdAt: -1 })
      .limit(8)
      .lean();

    // Get New Arrivals (newest products, limit 8)
    const newArrivals = await Product.find(baseProductQuery)
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    // Get Best Sellers (products with highest purchases, fallback to views, then createdAt, limit 8)
    // If purchases field doesn't exist or is null, it will still work due to index
    const bestSellers = await Product.find(baseProductQuery)
      .sort({ 
        purchases: -1, 
        views: -1, 
        createdAt: -1 
      })
      .limit(8)
      .lean();

    // Normalize images for all products
    const normalizedFeatured = featuredProducts.map((p) => normalizeProductImages(p));
    const normalizedNewArrivals = newArrivals.map((p) => normalizeProductImages(p));
    const normalizedBestSellers = bestSellers.map((p) => normalizeProductImages(p));

    return res.status(200).json({
      success: true,
      data: {
        featuredCategories,
        featuredProducts: normalizedFeatured,
        newArrivals: normalizedNewArrivals,
        bestSellers: normalizedBestSellers,
      },
    });
  } catch (error) {
    console.error("Error in homepage API:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch homepage data",
    });
  }
}

