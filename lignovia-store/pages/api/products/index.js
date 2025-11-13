import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      // Filter products for storefront: must be published, public, and in stock
      const products = await Product.find({
        status: "published",
        visibility: "public",
        inStock: true,
      })
        .sort({ createdAt: -1 })
        .lean();

      // Ensure image field is set for backward compatibility
      const productsWithImages = products.map((product) => ({
        ...product,
        image: product.image || product.mainImage || (product.images && product.images[0]) || "",
      }));

      return res.status(200).json({ success: true, data: productsWithImages });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      console.log("Creating product, received data:", req.body);

      const {
        name,
        shortDescription,
        description,
        slug,
        category,
        subcategory,
        tags,
        brand,
        price,
        compareAtPrice,
        currency,
        inStock,
        stock,
        lowStockThreshold,
        sku,
        barcode,
        inventoryLocation,
        mainImage,
        images,
        thumbnail,
        video,
        zoomImage,
        image, // Backward compatibility
        hasVariants,
        variantGroups,
        variants,
        material,
        finish,
        dimensions,
        weight,
        weightUnit,
        careInstructions,
        warranty,
        packageDimensions,
        packageWeight,
        packageWeightUnit,
        shippingClass,
        processingTime,
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        status,
        visibility,
        notes,
      } = req.body;

      // Validate required fields
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Product name is required",
        });
      }

      if (!slug || !slug.trim()) {
        return res.status(400).json({
          success: false,
          error: "Product slug is required",
        });
      }

      if (!price || price === "" || isNaN(Number(price))) {
        return res.status(400).json({
          success: false,
          error: "Product price is required and must be a valid number",
        });
      }

      // Prepare product data
      const productData = {
        name: name.trim(),
        shortDescription: shortDescription || "",
        description: description || "",
        slug: slug.trim().toLowerCase(),
        // Convert category to string (handles ObjectId from request)
        category: category ? String(category) : "",
        subcategory: subcategory ? String(subcategory) : "",
        tags: Array.isArray(tags) ? tags : [],
        brand: brand || "LIGNOVIA",
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        currency: currency || "TRY",
        inStock: inStock !== undefined ? inStock : true,
        stock: Number(stock) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 10,
        sku: sku || "",
        barcode: barcode || "",
        inventoryLocation: inventoryLocation || "",
        mainImage: mainImage || "",
        images: Array.isArray(images) ? images : [],
        thumbnail: thumbnail || "",
        video: video || "",
        zoomImage: zoomImage || "",
        image: mainImage || image || images?.[0] || "", // Backward compatibility
        hasVariants: hasVariants || false,
        variantGroups: Array.isArray(variantGroups) ? variantGroups.map((group) => ({
          name: group.name || "",
          options: Array.isArray(group.options) ? group.options.map((opt) => ({
            name: opt.name || "",
            value: opt.value || "",
          })) : [],
        })) : [],
        variants: Array.isArray(variants) ? variants.map((variant) => ({
          name: variant.name || "",
          optionValues: variant.optionValues || {},
          price: variant.price ? Number(variant.price) : 0,
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          stock: variant.stock ? Number(variant.stock) : 0,
          sku: variant.sku || "",
          barcode: variant.barcode || "",
          image: variant.image || "",
          inStock: variant.inStock !== undefined ? variant.inStock : true,
          isDefault: variant.isDefault || false,
        })) : [],
        material: material || "",
        finish: finish || "",
        dimensions: dimensions || {},
        weight: weight ? Number(weight) : null,
        weightUnit: weightUnit || "kg",
        careInstructions: careInstructions || "",
        warranty: warranty || "",
        packageDimensions: packageDimensions || {},
        packageWeight: packageWeight ? Number(packageWeight) : null,
        packageWeightUnit: packageWeightUnit || "kg",
        shippingClass: shippingClass || "standard",
        processingTime: processingTime || "1-3 days",
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
        ogImage: ogImage || "",
        status: status || "published",
        visibility: visibility || "public",
        notes: notes || "",
      };

      console.log("Creating product with data:", productData);

      const product = await Product.create(productData);

      console.log("Product created successfully:", product._id, product.name);

      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      console.error("Error creating product:", error);
      if (error.code === 11000) {
        // Duplicate key error
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          error: `${field === "slug" ? "Slug" : field === "sku" ? "SKU" : field} already exists`,
        });
      }
      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({
          success: false,
          error: errors.join(", "),
        });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
