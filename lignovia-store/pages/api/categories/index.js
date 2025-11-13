import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Get all categories and populate children if needed
      const categories = await Category.find({})
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

      // Helper function to get all descendant category IDs recursively
      const getDescendantIds = (categoryId, categoriesList) => {
        const descendants = [];
        const findChildren = (parentId) => {
          categoriesList.forEach((cat) => {
            if (cat.parentCategory && String(cat.parentCategory) === String(parentId)) {
              descendants.push(cat._id);
              findChildren(cat._id); // Recursive call for nested children
            }
          });
        };
        findChildren(categoryId);
        return descendants;
      };

      // Calculate product count for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const categoryIdString = String(category._id);

          // Count direct products in this category
          const directCount = await Product.countDocuments({
            category: categoryIdString,
          });

          // Get all descendant category IDs (children, grandchildren, etc.)
          const descendantIds = getDescendantIds(category._id, categories);

          // Count products in all descendant categories
          let descendantCount = 0;
          if (descendantIds.length > 0) {
            const descendantIdStrings = descendantIds.map((id) => String(id));
            descendantCount = await Product.countDocuments({
              category: { $in: descendantIdStrings },
            });
          }

          // Total product count = direct + descendants
          const productCount = directCount + descendantCount;

          return {
            ...category,
            productCount,
          };
        })
      );

      return res.status(200).json({ success: true, data: categoriesWithCounts });
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const {
        name,
        slug,
        description,
        image,
        visibility,
        sortOrder,
        parentCategory,
        seoTitle,
        seoDescription,
        seoKeywords,
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: "Category name is required",
        });
      }

      // Check if parentCategory is provided and valid
      if (parentCategory) {
        try {
          const parentExists = await Category.findById(parentCategory);
          if (!parentExists) {
            return res.status(400).json({
              success: false,
              error: "Parent category not found",
            });
          }
          // Note: For new categories, we can't have a circular reference yet
          // Circular reference check is only needed when updating existing categories
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: "Invalid parent category ID",
          });
        }
      }

      // Create category
      const category = await Category.create({
        name,
        slug: slug || undefined, // Will be auto-generated if not provided
        description: description || "",
        image: image || "",
        visibility: visibility || "public",
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        parentCategory: parentCategory || null,
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        seoKeywords: seoKeywords || [],
      });

      console.log("Category created:", category._id, category.name);

      return res.status(201).json({ success: true, data: category });
    } catch (error) {
      console.error("Error creating category:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "Slug already exists",
        });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
