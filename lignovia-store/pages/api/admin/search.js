import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await connectDB();

    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          products: [],
          orders: [],
          customers: [],
          categories: [],
          inventory: [],
          settings: [],
        },
      });
    }

    const searchQuery = q.trim();
    const searchRegex = new RegExp(searchQuery, "i");

    // Search Products
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { slug: searchRegex },
      ],
    })
      .limit(5)
      .lean()
      .select("_id name description price image slug stock inStock");

    // Search Orders
    const orders = await Order.find({
      $or: [
        { _id: searchQuery },
        { status: searchRegex },
      ],
    })
      .populate("user", "name email")
      .limit(5)
      .lean()
      .select("_id total status createdAt shippingAddress");

    // Search Customers (Users)
    const customers = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
      ],
    })
      .limit(5)
      .lean()
      .select("_id name email");

    // Search Categories (extracted from products)
    const categorySet = new Set();
    products.forEach((product) => {
      // If products have a category field, add it
      // For now, we'll use a placeholder approach
      if (product.category) {
        categorySet.add(product.category);
      }
    });
    const categories = Array.from(categorySet).slice(0, 5).map((cat) => ({
      _id: cat,
      name: cat,
    }));

    // Inventory items (products with stock info)
    const inventory = products
      .filter((p) => p.stock !== undefined && p.stock !== null)
      .slice(0, 5)
      .map((p) => ({
        _id: p._id,
        name: p.name,
        stock: p.stock,
        inStock: p.inStock,
        image: p.image,
      }));

    // Settings (placeholder - can be expanded)
    const settings = [];

    // Format results
    const formattedProducts = products.map((p) => ({
      id: p._id.toString(),
      type: "product",
      title: p.name,
      subtitle: `$${p.price?.toFixed(2) || "0.00"}`,
      description: p.description || "",
      image: p.image || null,
      url: `/admin/products`,
      meta: {
        stock: p.stock || 0,
        inStock: p.inStock || false,
      },
    }));

    const formattedOrders = orders.map((o) => ({
      id: o._id.toString(),
      type: "order",
      title: `Order #${o._id.toString().slice(-6)}`,
      subtitle: o.user?.name || o.user?.email || "Guest",
      description: `$${o.total?.toFixed(2) || "0.00"} - ${o.status || "pending"}`,
      image: null,
      url: `/admin/orders`,
      meta: {
        status: o.status || "pending",
        total: o.total || 0,
        createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
      },
    }));

    const formattedCustomers = customers.map((c) => ({
      id: c._id.toString(),
      type: "customer",
      title: c.name || c.email,
      subtitle: c.email || "",
      description: "Customer",
      image: null,
      url: `/admin/customers`,
      meta: {
        email: c.email,
      },
    }));

    const formattedCategories = categories.map((c, index) => ({
      id: c._id || `category-${index}`,
      type: "category",
      title: c.name,
      subtitle: "Category",
      description: "",
      image: null,
      url: `/admin/products?category=${encodeURIComponent(c.name)}`,
      meta: {},
    }));

    const formattedInventory = inventory.map((i) => ({
      id: i._id.toString(),
      type: "inventory",
      title: i.name,
      subtitle: `Stock: ${i.stock || 0}`,
      description: i.inStock ? "In Stock" : "Out of Stock",
      image: i.image || null,
      url: `/admin/inventory`,
      meta: {
        stock: i.stock || 0,
        inStock: i.inStock || false,
      },
    }));

    const formattedSettings = settings.map((s) => ({
      id: s._id || s.id,
      type: "settings",
      title: s.name || s.title,
      subtitle: s.subtitle || "",
      description: s.description || "",
      image: null,
      url: `/admin/settings`,
      meta: {},
    }));

    return res.status(200).json({
      success: true,
      data: {
        products: formattedProducts,
        orders: formattedOrders,
        customers: formattedCustomers,
        categories: formattedCategories,
        inventory: formattedInventory,
        settings: formattedSettings,
      },
    });
  } catch (error) {
    console.error("Error in admin search:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to perform search",
    });
  }
}

