import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import BillingInfo from "@/models/BillingInfo";
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
      return res.status(400).json({ error: "Billing profile ID is required" });
    }

    if (req.method === "GET") {
      // Get single billing profile
      const profile = await BillingInfo.findOne({ _id: id, user: userId }).lean();

      if (!profile) {
        return res.status(404).json({ error: "Billing profile not found" });
      }

      return res.status(200).json({
        success: true,
        data: {
          _id: profile._id.toString(),
          type: profile.type || "individual",
          fullName: profile.fullName || "",
          phone: profile.phone || "",
          postalCode: profile.postalCode || "",
          address: profile.address || "",
          city: profile.city || "",
          country: profile.country || "",
          companyName: profile.companyName || "",
          taxNumber: profile.taxNumber || "",
          taxOffice: profile.taxOffice || "",
          email: profile.email || "",
          billingAddress: profile.billingAddress || "",
          isDefault: profile.isDefault || false,
        },
      });
    }

    if (req.method === "PUT") {
      // Update billing profile
      const {
        type,
        fullName,
        phone,
        postalCode,
        address,
        city,
        country,
        companyName,
        taxNumber,
        taxOffice,
        email,
        billingAddress,
        isDefault,
      } = req.body;

      // Check if profile belongs to user
      const existingProfile = await BillingInfo.findOne({ _id: id, user: userId });

      if (!existingProfile) {
        return res.status(404).json({ error: "Billing profile not found" });
      }

      // Validate based on type
      if (type === "individual") {
        if (!fullName || !phone || !postalCode || !address || !city || !country) {
          return res.status(400).json({
            error: "Individual billing requires: fullName, phone, postalCode, address, city, country",
          });
        }
      } else if (type === "corporate") {
        if (!companyName || !taxNumber || !taxOffice || !email || !billingAddress) {
          return res.status(400).json({
            error: "Corporate billing requires: companyName, taxNumber, taxOffice, email, billingAddress",
          });
        }
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await BillingInfo.updateMany({ user: userId, _id: { $ne: id } }, { isDefault: false });
      }

      const updatedProfile = await BillingInfo.findByIdAndUpdate(
        id,
        {
          type,
          fullName: type === "individual" ? fullName : undefined,
          phone: type === "individual" ? phone : undefined,
          postalCode: type === "individual" ? postalCode : undefined,
          address: type === "individual" ? address : undefined,
          city: type === "individual" ? city : undefined,
          country: type === "individual" ? country : undefined,
          companyName: type === "corporate" ? companyName : undefined,
          taxNumber: type === "corporate" ? taxNumber : undefined,
          taxOffice: type === "corporate" ? taxOffice : undefined,
          email: type === "corporate" ? email : undefined,
          billingAddress: type === "corporate" ? billingAddress : undefined,
          isDefault: isDefault || false,
        },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedProfile._id.toString(),
          type: updatedProfile.type,
          fullName: updatedProfile.fullName || "",
          phone: updatedProfile.phone || "",
          postalCode: updatedProfile.postalCode || "",
          address: updatedProfile.address || "",
          city: updatedProfile.city || "",
          country: updatedProfile.country || "",
          companyName: updatedProfile.companyName || "",
          taxNumber: updatedProfile.taxNumber || "",
          taxOffice: updatedProfile.taxOffice || "",
          email: updatedProfile.email || "",
          billingAddress: updatedProfile.billingAddress || "",
          isDefault: updatedProfile.isDefault,
        },
      });
    }

    if (req.method === "DELETE") {
      // Delete billing profile
      const profile = await BillingInfo.findOne({ _id: id, user: userId });

      if (!profile) {
        return res.status(404).json({ error: "Billing profile not found" });
      }

      await BillingInfo.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Billing profile deleted successfully",
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error in billing API:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}


