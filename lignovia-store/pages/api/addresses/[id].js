import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Address from "@/models/Address";
import mongoose from "mongoose";

export default async function handler(req, res) {
  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Connect to MongoDB
    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Address ID is required" });
    }

    if (req.method === "GET") {
      // Get single address
      const address = await Address.findOne({ _id: id, user: userId }).lean();

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      return res.status(200).json({
        success: true,
        data: {
          _id: address._id.toString(),
          fullName: address.fullName,
          phone: address.phone,
          postalCode: address.postalCode,
          address: address.address,
          city: address.city,
          country: address.country,
          note: address.note || "",
          isDefault: address.isDefault || false,
        },
      });
    }

    if (req.method === "PUT") {
      // Update address
      const { fullName, phone, postalCode, address, city, country, note, isDefault } = req.body;

      // Validate required fields
      if (!fullName || !phone || !postalCode || !address || !city || !country) {
        return res.status(400).json({
          error: "All required fields (fullName, phone, postalCode, address, city, country) must be provided",
        });
      }

      // Check if address belongs to user
      const existingAddress = await Address.findOne({ _id: id, user: userId });

      if (!existingAddress) {
        return res.status(404).json({ error: "Address not found" });
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await Address.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
      }

      const updatedAddress = await Address.findByIdAndUpdate(
        id,
        {
          fullName,
          phone,
          postalCode,
          address,
          city,
          country,
          note: note || undefined,
          isDefault: isDefault || false,
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedAddress._id.toString(),
          fullName: updatedAddress.fullName,
          phone: updatedAddress.phone,
          postalCode: updatedAddress.postalCode,
          address: updatedAddress.address,
          city: updatedAddress.city,
          country: updatedAddress.country,
          note: updatedAddress.note || "",
          isDefault: updatedAddress.isDefault,
        },
      });
    }

    if (req.method === "DELETE") {
      // Delete address
      const address = await Address.findOne({ _id: id, user: userId });

      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }

      await Address.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Address deleted successfully",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in address API:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}


