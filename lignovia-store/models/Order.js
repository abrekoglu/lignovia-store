import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  ],
  total: {
    type: Number,
  },
  status: {
    type: String,
    default: "pending",
  },
  // Shipping Address Reference
  shippingAddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  // Billing Info Reference
  billingInfoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BillingInfo",
  },
  // Shipping Address (embedded for backward compatibility and order snapshot)
  shippingAddress: {
    fullName: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    district: {
      type: String, // Keep for backward compatibility
    },
    zipCode: {
      type: String, // Keep for backward compatibility
    },
    deliveryNote: {
      type: String,
    },
    note: {
      type: String,
    },
  },
  // Billing Information (embedded for backward compatibility and order snapshot)
  billingInfo: {
    requestInvoice: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["individual", "corporate"],
    },
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
    billingType: {
      type: String,
      enum: ["individual", "corporate"],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default (mongoose.models && mongoose.models.Order) || mongoose.model("Order", OrderSchema);
