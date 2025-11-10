import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, description, price, image, slug, inStock, stock } = req.body;

      if (!name || !price || !slug) {
        return res
          .status(400)
          .json({ success: false, error: "Name, price, and slug are required" });
      }

      // Parse and validate stock
      let stockValue = 0;
      if (stock !== undefined && stock !== null) {
        stockValue = Number(stock);
        if (isNaN(stockValue) || stockValue < 0) {
          return res.status(400).json({
            success: false,
            error: "Stock must be a valid number greater than or equal to 0",
          });
        }
      }

      const product = await Product.create({
        name,
        description: description || "",
        price: Number(price),
        image: image || "",
        slug,
        inStock: inStock !== undefined ? inStock : true,
        stock: stockValue,
      });

      console.log("Product created with stock:", product.stock);

      return res.status(201).json({ success: true, data: product });
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

