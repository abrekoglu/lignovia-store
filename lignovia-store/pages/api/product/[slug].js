import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { slug } = req.query;

  try {
    // Find product by slug
    const product = await Product.findOne({ slug: slug.toLowerCase() }).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, {
      $inc: { views: 1 },
    });

    // Get category info if category exists
    let categoryInfo = null;
    if (product.category) {
      try {
        categoryInfo = await Category.findById(product.category).lean();
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    }

    // Get related products (same category, exclude current product)
    let relatedProducts = [];
    if (product.category) {
      relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        inStock: true,
        status: "published",
        visibility: "public",
      })
        .select("name slug price mainImage image shortDescription stock")
        .limit(4)
        .lean();
    }

    // Build image gallery (mainImage + images array)
    const imageGallery = [];
    if (product.mainImage) {
      imageGallery.push(product.mainImage);
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img && !imageGallery.includes(img)) {
          imageGallery.push(img);
        }
      });
    }
    // Fallback to legacy image field if no gallery images
    if (imageGallery.length === 0 && product.image) {
      imageGallery.push(product.image);
    }

    // Build technical specifications object
    const technicalSpecs = {};
    if (product.material) technicalSpecs.Material = product.material;
    if (product.finish) technicalSpecs.Finish = product.finish;
    if (product.dimensions) {
      if (product.dimensions.width) technicalSpecs.Width = `${product.dimensions.width} ${product.dimensions.unit || "cm"}`;
      if (product.dimensions.height) technicalSpecs.Height = `${product.dimensions.height} ${product.dimensions.unit || "cm"}`;
      if (product.dimensions.depth) technicalSpecs.Depth = `${product.dimensions.depth} ${product.dimensions.unit || "cm"}`;
      if (product.dimensions.thickness) technicalSpecs.Thickness = `${product.dimensions.thickness} ${product.dimensions.unit || "cm"}`;
    }
    if (product.weight) technicalSpecs.Weight = `${product.weight} ${product.weightUnit || "kg"}`;
    if (product.careInstructions) technicalSpecs["Care Instructions"] = product.careInstructions;
    if (product.warranty) technicalSpecs.Warranty = product.warranty;
    if (product.sku) technicalSpecs.SKU = product.sku;

    // Build response
    const productData = {
      ...product,
      categoryInfo,
      relatedProducts,
      imageGallery,
      technicalSpecs,
    };

    return res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch product",
    });
  }
}

