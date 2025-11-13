import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { normalizeProductImages } from "@/utils/imageUtils";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { slug } = req.query;

  try {
    // Find category by slug
    const category = await Category.findOne({ slug: slug.toLowerCase(), visibility: "public" }).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Get all subcategories (children)
    const subcategories = await Category.find({
      parentCategory: category._id,
      visibility: "public",
    })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Get parent category if exists
    let parentCategory = null;
    if (category.parentCategory) {
      parentCategory = await Category.findById(category.parentCategory).lean();
    }

    // Build breadcrumb path
    const breadcrumb = [];
    let currentParentId = category.parentCategory;
    while (currentParentId) {
      const parent = await Category.findById(currentParentId).lean();
      if (parent) {
        breadcrumb.unshift({
          _id: parent._id,
          name: parent.name,
          slug: parent.slug,
        });
        currentParentId = parent.parentCategory;
      } else {
        break;
      }
    }

    // Get all descendant category IDs (for product filtering)
    const getAllDescendantIds = async (categoryId) => {
      const descendants = [];
      const findChildren = async (parentId) => {
        const children = await Category.find({ parentCategory: parentId }).select("_id").lean();
        for (const child of children) {
          descendants.push(child._id);
          await findChildren(child._id);
        }
      };
      await findChildren(categoryId);
      return descendants;
    };

    const descendantIds = await getAllDescendantIds(category._id);
    const categoryIdsForProducts = [category._id, ...descendantIds].map((id) => String(id));

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || "newest";
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
    const subcategory = req.query.subcategory ? String(req.query.subcategory) : null;
    const inStockOnly = req.query.inStock === "true";

    // Build product query
    const productQuery = {
      category: { $in: categoryIdsForProducts },
      status: "published",
      visibility: "public",
    };

    if (subcategory) {
      const subcategoryIds = [subcategory];
      const subDescendants = await getAllDescendantIds(subcategory);
      subcategoryIds.push(...subDescendants.map((id) => String(id)));
      productQuery.category = { $in: subcategoryIds };
    }

    if (inStockOnly) {
      productQuery.inStock = true;
    }

    if (minPrice !== null || maxPrice !== null) {
      productQuery.price = {};
      if (minPrice !== null) productQuery.price.$gte = minPrice;
      if (maxPrice !== null) productQuery.price.$lte = maxPrice;
    }

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case "price-low":
        sortObject = { price: 1 };
        break;
      case "price-high":
        sortObject = { price: -1 };
        break;
      case "newest":
        sortObject = { createdAt: -1 };
        break;
      case "popular":
        sortObject = { views: -1, purchases: -1 };
        break;
      case "name":
        sortObject = { name: 1 };
        break;
      default:
        sortObject = { createdAt: -1 };
    }

    // Get total count and products
    const totalProducts = await Product.countDocuments(productQuery);
    const products = await Product.find(productQuery)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get price range for filters
    const priceRange = await Product.aggregate([
      { $match: { category: { $in: categoryIdsForProducts }, status: "published", visibility: "public" } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const minPriceAvailable = priceRange.length > 0 ? priceRange[0].minPrice : 0;
    const maxPriceAvailable = priceRange.length > 0 ? priceRange[0].maxPrice : 0;

    // Normalize images for all products
    const productsWithImages = products.map((product) => normalizeProductImages(product));

    // Build response
    const categoryData = {
      ...category,
      parentCategory: parentCategory,
      subcategories: subcategories,
      breadcrumb: breadcrumb,
      products: productsWithImages,
      pagination: {
        page,
        limit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
      },
      filters: {
        priceRange: {
          min: minPriceAvailable,
          max: maxPriceAvailable,
        },
        sortOptions: [
          { value: "newest", label: "Newest" },
          { value: "price-low", label: "Price: Low to High" },
          { value: "price-high", label: "Price: High to Low" },
          { value: "popular", label: "Most Popular" },
          { value: "name", label: "Name A-Z" },
        ],
      },
    };

    return res.status(200).json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch category",
    });
  }
}

