import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const product = await Product.findById(id).lean();
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      console.log("Updating product:", id, "received data:", req.body);

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
      if (name !== undefined && (!name || !name.trim())) {
        return res.status(400).json({
          success: false,
          error: "Product name cannot be empty",
        });
      }

      if (slug !== undefined && (!slug || !slug.trim())) {
        return res.status(400).json({
          success: false,
          error: "Product slug cannot be empty",
        });
      }

      // Check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      // Build update object - only include fields that are provided
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (shortDescription !== undefined) updateData.shortDescription = shortDescription || "";
      if (description !== undefined) updateData.description = description || "";
      if (slug !== undefined) updateData.slug = slug.trim().toLowerCase();
      // Convert category to string (handles ObjectId from request)
      if (category !== undefined) updateData.category = category ? String(category) : "";
      if (subcategory !== undefined) updateData.subcategory = subcategory ? String(subcategory) : "";
      if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
      if (brand !== undefined) updateData.brand = brand || "LIGNOVIA";
      if (price !== undefined) updateData.price = Number(price);
      if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
      if (currency !== undefined) updateData.currency = currency || "TRY";
      if (inStock !== undefined) updateData.inStock = inStock;
      if (stock !== undefined) updateData.stock = Number(stock) || 0;
      if (lowStockThreshold !== undefined) updateData.lowStockThreshold = Number(lowStockThreshold) || 10;
      if (sku !== undefined) updateData.sku = sku || "";
      if (barcode !== undefined) updateData.barcode = barcode || "";
      if (inventoryLocation !== undefined) updateData.inventoryLocation = inventoryLocation || "";
      if (mainImage !== undefined) updateData.mainImage = mainImage || "";
      if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail || "";
      if (video !== undefined) updateData.video = video || "";
      if (zoomImage !== undefined) updateData.zoomImage = zoomImage || "";
      if (image !== undefined || mainImage !== undefined || images !== undefined) {
        updateData.image = mainImage || image || images?.[0] || ""; // Backward compatibility
      }
      if (hasVariants !== undefined) updateData.hasVariants = hasVariants;
      if (variantGroups !== undefined) {
        updateData.variantGroups = Array.isArray(variantGroups) ? variantGroups.map((group) => ({
          name: group.name || "",
          options: Array.isArray(group.options) ? group.options.map((opt) => ({
            name: opt.name || "",
            value: opt.value || "",
          })) : [],
        })) : [];
      }
      if (variants !== undefined) {
        updateData.variants = Array.isArray(variants) ? variants.map((variant) => ({
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
        })) : [];
      }
      if (material !== undefined) updateData.material = material || "";
      if (finish !== undefined) updateData.finish = finish || "";
      if (dimensions !== undefined) updateData.dimensions = dimensions || {};
      if (weight !== undefined) updateData.weight = weight ? Number(weight) : null;
      if (weightUnit !== undefined) updateData.weightUnit = weightUnit || "kg";
      if (careInstructions !== undefined) updateData.careInstructions = careInstructions || "";
      if (warranty !== undefined) updateData.warranty = warranty || "";
      if (packageDimensions !== undefined) updateData.packageDimensions = packageDimensions || {};
      if (packageWeight !== undefined) updateData.packageWeight = packageWeight ? Number(packageWeight) : null;
      if (packageWeightUnit !== undefined) updateData.packageWeightUnit = packageWeightUnit || "kg";
      if (shippingClass !== undefined) updateData.shippingClass = shippingClass || "standard";
      if (processingTime !== undefined) updateData.processingTime = processingTime || "1-3 days";
      if (seoTitle !== undefined) updateData.seoTitle = seoTitle || "";
      if (seoDescription !== undefined) updateData.seoDescription = seoDescription || "";
      if (seoKeywords !== undefined) updateData.seoKeywords = Array.isArray(seoKeywords) ? seoKeywords : [];
      if (ogImage !== undefined) updateData.ogImage = ogImage || "";
      if (status !== undefined) updateData.status = status || "published";
      if (visibility !== undefined) updateData.visibility = visibility || "public";
      if (notes !== undefined) updateData.notes = notes || "";

      console.log("Updating product with data:", updateData);

      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }

      console.log("Product updated successfully:", product._id, product.name);

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error updating product:", error);
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

  if (req.method === "DELETE") {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: "Product not found",
        });
      }
      console.log("Product deleted successfully:", product._id, product.name);
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}
