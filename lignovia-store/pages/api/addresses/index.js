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

    if (req.method === "GET") {
      // Fetch all addresses for the user
      const addresses = await Address.find({ user: userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();

      const serializedAddresses = addresses.map((address) => ({
        _id: address._id.toString(),
        fullName: address.fullName,
        phone: address.phone,
        postalCode: address.postalCode,
        address: address.address,
        city: address.city,
        country: address.country,
        note: address.note || "",
        isDefault: address.isDefault || false,
        createdAt: address.createdAt ? new Date(address.createdAt).toISOString() : null,
      }));

      return res.status(200).json({
        success: true,
        data: serializedAddresses,
      });
    }

    if (req.method === "POST") {
      // Create new address
      const { fullName, phone, postalCode, address, city, country, note, isDefault } = req.body;

      // Validate required fields
      if (!fullName || !phone || !postalCode || !address || !city || !country) {
        return res.status(400).json({
          error: "All required fields (fullName, phone, postalCode, address, city, country) must be provided",
        });
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await Address.updateMany({ user: userId }, { isDefault: false });
      }

      const newAddress = await Address.create({
        user: userId,
        fullName,
        phone,
        postalCode,
        address,
        city,
        country,
        note: note || undefined,
        isDefault: isDefault || false,
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: newAddress._id.toString(),
          fullName: newAddress.fullName,
          phone: newAddress.phone,
          postalCode: newAddress.postalCode,
          address: newAddress.address,
          city: newAddress.city,
          country: newAddress.country,
          note: newAddress.note || "",
          isDefault: newAddress.isDefault,
        },
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in addresses API:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}


