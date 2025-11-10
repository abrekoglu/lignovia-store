import mongoose from "mongoose";

const BillingInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["individual", "corporate"],
    required: true,
    default: "individual",
  },
  // Individual fields
  fullName: {
    type: String,
  },
  phone: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  // Corporate fields
  companyName: {
    type: String,
  },
  taxNumber: {
    type: String,
  },
  taxOffice: {
    type: String,
  },
  email: {
    type: String,
  },
  billingAddress: {
    type: String,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.BillingInfo || mongoose.model("BillingInfo", BillingInfoSchema);


