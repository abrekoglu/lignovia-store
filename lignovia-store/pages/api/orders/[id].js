import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default async function handler(req, res) {
  // Accept GET and PUT requests
  if (req.method !== "GET" && req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    const { id } = req.query;

    // Validate order ID
    if (!id) {
      return res.status(400).json({
        error: "Order ID is required",
      });
    }

    // Handle GET request - fetch order details
    if (req.method === "GET") {
      const order = await Order.findById(id).lean();

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      // Serialize order
      const serializedOrder = {
        _id: order._id ? order._id.toString() : null,
        user: order.user ? order.user.toString() : null,
        total: order.total || 0,
        status: order.status || "pending",
        createdAt: order.createdAt
          ? new Date(order.createdAt).toISOString()
          : null,
        shippingAddress: order.shippingAddress || {},
        billingInfo: order.billingInfo || {},
        products: (order.products || []).map((product) => ({
          quantity: product.quantity || 0,
          price: product.price || 0,
          product: product.product ? product.product.toString() : null,
        })),
      };

      return res.status(200).json({
        success: true,
        order: serializedOrder,
      });
    }

    // Handle PUT request - update order status
    if (req.method === "PUT") {
      const { status } = req.body;

      // Validate status
      const validStatuses = ["pending", "processing", "shipped", "completed"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Status must be one of: ${validStatuses.join(", ")}`,
        });
      }

      // Find and update the order
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          error: "Order not found",
        });
      }

      // Return success message
      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        order: {
          _id: order._id.toString(),
          status: order.status,
        },
      });
    }
  } catch (error) {
    console.error("Error handling order request:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "Invalid order ID",
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
}

