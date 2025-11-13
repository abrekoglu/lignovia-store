import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const category = await Category.findById(id).lean();
      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error("Error fetching category:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PUT") {
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

      // Check if category exists
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      // Check for circular reference if parentCategory is being changed
      if (parentCategory && parentCategory !== existingCategory.parentCategory?.toString()) {
        const circularCheck = await Category.checkCircularReference(id, parentCategory);
        if (circularCheck) {
          return res.status(400).json({
            success: false,
            error: "Circular reference detected: Cannot set a category as its own parent or descendant",
          });
        }

        // Verify parent exists
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          return res.status(400).json({
            success: false,
            error: "Parent category not found",
          });
        }
      }

      // Build update object
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (slug !== undefined) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;
      if (image !== undefined) updateData.image = image;
      if (visibility !== undefined) updateData.visibility = visibility;
      if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
      if (parentCategory !== undefined) {
        updateData.parentCategory = parentCategory || null;
      }
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
      if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
      if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;

      // Update category
      const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      console.log("Category updated:", category._id, category.name);

      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error("Error updating category:", error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "Slug already exists",
        });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "DELETE") {
    try {
      // Check if category has children
      const childrenCount = await Category.countDocuments({ parentCategory: id });
      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete category with ${childrenCount} subcategor${childrenCount === 1 ? "y" : "ies"}. Please move or delete subcategories first.`,
        });
      }

      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          error: "Category not found",
        });
      }

      console.log("Category deleted:", category._id, category.name);

      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      console.error("Error deleting category:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

