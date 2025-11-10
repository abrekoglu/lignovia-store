import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Connect to MongoDB
    await connectDB();

    // Convert user ID string to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Fetch the most recent order for this user
    const order = await Order.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      return res.status(200).json({
        success: true,
        order: null,
      });
    }

    // Serialize the order
    const serializedOrder = {
      _id: order._id ? order._id.toString() : null,
      shippingAddress: order.shippingAddress || {},
      billingInfo: order.billingInfo || {},
    };

    return res.status(200).json({
      success: true,
      order: serializedOrder,
    });
  } catch (error) {
    console.error("Error fetching latest order:", error);
    return res.status(500).json({
      error: "Failed to fetch latest order",
    });
  }
}


