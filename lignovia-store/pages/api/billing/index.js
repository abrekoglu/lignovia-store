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

    if (req.method === "GET") {
      // Fetch all billing profiles for the user
      const billingProfiles = await BillingInfo.find({ user: userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();

      const serializedProfiles = billingProfiles.map((profile) => ({
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
        createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : null,
      }));

      return res.status(200).json({
        success: true,
        data: serializedProfiles,
      });
    }

    if (req.method === "POST") {
      // Create new billing profile
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
      } else {
        return res.status(400).json({
          error: "Type must be either 'individual' or 'corporate'",
        });
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await BillingInfo.updateMany({ user: userId }, { isDefault: false });
      }

      const newBillingInfo = await BillingInfo.create({
        user: userId,
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
      });

      return res.status(201).json({
        success: true,
        data: {
          _id: newBillingInfo._id.toString(),
          type: newBillingInfo.type,
          fullName: newBillingInfo.fullName || "",
          phone: newBillingInfo.phone || "",
          postalCode: newBillingInfo.postalCode || "",
          address: newBillingInfo.address || "",
          city: newBillingInfo.city || "",
          country: newBillingInfo.country || "",
          companyName: newBillingInfo.companyName || "",
          taxNumber: newBillingInfo.taxNumber || "",
          taxOffice: newBillingInfo.taxOffice || "",
          email: newBillingInfo.email || "",
          billingAddress: newBillingInfo.billingAddress || "",
          isDefault: newBillingInfo.isDefault,
        },
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


