import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

/**
 * Search Suggestions API
 * Returns quick suggestions for live search dropdown
 */
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const query = req.query.q || "";

    if (!query.trim() || query.length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          categories: [],
        },
      });
    }

    const searchQuery = query.trim().toLowerCase();
    const textSearchRegex = new RegExp(
      searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );

    // Limit suggestions
    const limit = 5;

    // Search products
    const products = await Product.find({
      status: "published",
      visibility: "public",
      $or: [
        { name: textSearchRegex },
        { slug: textSearchRegex },
        { tags: { $in: [textSearchRegex] } },
      ],
    })
      .select("name slug mainImage price")
      .limit(limit)
      .lean();

    // Search categories
    const categories = await Category.find({
      visibility: "public",
      $or: [{ name: textSearchRegex }, { slug: textSearchRegex }],
    })
      .select("name slug")
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        products: products.map((p) => ({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          mainImage: p.mainImage,
          price: p.price,
        })),
        categories: categories.map((c) => ({
          _id: c._id,
          name: c.name,
          slug: c.slug,
        })),
      },
    });
  } catch (error) {
    console.error("Error in search suggestions API:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch suggestions",
    });
  }
}

