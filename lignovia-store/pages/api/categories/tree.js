import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

/**
 * API endpoint to fetch categories as a hierarchical tree
 * Returns categories organized with parent-child relationships
 */
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get all public categories
    const categories = await Category.find({ visibility: "public" })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Helper function to build hierarchical tree
    const buildTree = (parentId = null, level = 0) => {
      return categories
        .filter((cat) => {
          if (parentId === null) {
            return !cat.parentCategory;
          }
          return cat.parentCategory && String(cat.parentCategory) === String(parentId);
        })
        .map((category) => {
          const children = buildTree(category._id, level + 1);
          return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image: category.image,
            parent: category.parentCategory ? String(category.parentCategory) : null,
            level: level,
            children: children,
            productCount: category.productCount || 0,
          };
        });
    };

    // Build the tree starting from root categories
    const categoryTree = buildTree(null, 0);

    return res.status(200).json({
      success: true,
      data: {
        categories: categoryTree,
        flatCategories: categories.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          parent: cat.parentCategory ? String(cat.parentCategory) : null,
          level: 0, // Will be calculated on frontend if needed
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch categories",
    });
  }
}

