import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, description, price, image, slug, inStock, stock } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = Number(price);
      if (image !== undefined) updateData.image = image;
      if (slug) updateData.slug = slug;
      if (inStock !== undefined) updateData.inStock = inStock;
      
      // Handle stock - allow 0 as a valid value, but ensure it's a number
      if (stock !== undefined && stock !== null) {
        const stockValue = Number(stock);
        if (isNaN(stockValue) || stockValue < 0) {
          return res.status(400).json({
            success: false,
            error: "Stock must be a valid number greater than or equal to 0",
          });
        }
        updateData.stock = stockValue;
      }

      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!product) {
        return res
          .status(404)
          .json({ success: false, error: "Product not found" });
      }

      console.log("Product updated with stock:", product.stock);

      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ success: false, error: "Slug already exists" });
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

