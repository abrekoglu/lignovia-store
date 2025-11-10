import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session to get user ID
    const session = await getServerSession(req, res, authOptions);
    
    // Connect to MongoDB
    await connectDB();

    // Extract payload from request body
    const { shippingAddress, shippingAddressId, billingInfo, billingInfoId, items } = req.body;

    // Validate shipping address
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        error:
          "Shipping address with fullName, phone, address, city, postalCode, and country are required",
      });
    }

    // Validate billing info if provided (should be from a saved billing profile)
    // Billing info is optional - only validate if it's provided
    if (billingInfo) {
      // If it's a corporate profile, ensure required fields are present
      if (billingInfo.type === "corporate") {
        if (!billingInfo.companyName || !billingInfo.taxNumber) {
          return res.status(400).json({
            error:
              "Corporate billing profile must have company name and tax number",
          });
        }
      }
    }

    // Validate items array exists and has at least one item
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "At least one item is required",
      });
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.id && !item._id) {
        return res.status(400).json({
          error: "Each item must have an id",
        });
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return res.status(400).json({
          error: "Each item must have a valid quantity",
        });
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return res.status(400).json({
          error: "Each item must have a valid price",
        });
      }
    }

    // Map items array to products field format
    // Ensure each item has a unique product ID and convert to ObjectId
    const products = items.map((item, index) => {
      const productId = item.id || item._id;
      
      if (!productId) {
        throw new Error(`Item at index ${index} is missing a product ID`);
      }
      
      // Convert string ID to MongoDB ObjectId
      let productObjectId;
      try {
        productObjectId = mongoose.Types.ObjectId.isValid(productId)
          ? new mongoose.Types.ObjectId(productId)
          : productId;
      } catch (err) {
        console.error(`Invalid product ID at index ${index}:`, productId);
        throw new Error(`Invalid product ID format at index ${index}`);
      }
      
      return {
        product: productObjectId,
        quantity: item.quantity,
        price: item.price,
      };
    });
    
    // Validate that all products have unique IDs
    const productIds = products.map(p => p.product.toString());
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
      console.error("Duplicate product IDs detected:", productIds);
      console.error("Items received:", items);
      return res.status(400).json({
        error: "Duplicate products detected in order. Please ensure each product has a unique ID.",
      });
    }

    // Check stock availability and reserve stock atomically
    // Use findOneAndUpdate with conditions to ensure atomicity and prevent race conditions
    const stockChecks = [];
    const rollbackOperations = [];
    
    try {
      for (const productItem of products) {
        const productId = productItem.product;
        const requestedQuantity = productItem.quantity;

        // First, check if product exists and get its name
        const product = await Product.findById(productId);
        if (!product) {
          // Rollback any previous stock updates
          for (const rollback of rollbackOperations) {
            await Product.findByIdAndUpdate(rollback.productId, {
              $inc: { stock: rollback.quantity }
            });
          }
          return res.status(400).json({
            error: `Product with ID ${productId} not found`,
          });
        }

        // Atomically decrement stock only if stock is sufficient
        // This prevents race conditions by checking and updating in a single atomic operation
        const updatedProduct = await Product.findOneAndUpdate(
          { 
            _id: productId,
            stock: { $gte: requestedQuantity } // Only update if stock is sufficient
          },
          { $inc: { stock: -requestedQuantity } },
          { new: true }
        );

        if (!updatedProduct) {
          // Get current stock for error message
          const currentProduct = await Product.findById(productId);
          const currentStock = currentProduct?.stock !== undefined ? currentProduct.stock : 0;
          
          // Rollback any previous stock updates
          for (const rollback of rollbackOperations) {
            await Product.findByIdAndUpdate(rollback.productId, {
              $inc: { stock: rollback.quantity }
            });
          }
          
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Available: ${currentStock}, Requested: ${requestedQuantity}`,
          });
        }

        // Track for potential rollback
        rollbackOperations.push({
          productId,
          quantity: requestedQuantity,
        });

        stockChecks.push({
          productId,
          productName: product.name,
          quantity: requestedQuantity,
          remainingStock: updatedProduct.stock,
        });
      }
    } catch (error) {
      // Rollback all stock updates on error
      for (const rollback of rollbackOperations) {
        try {
          await Product.findByIdAndUpdate(rollback.productId, {
            $inc: { stock: rollback.quantity }
          });
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
        }
      }
      throw error;
    }

    // Calculate total price
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Get user ID from session if user is logged in
    let userId = null;
    if (session && session.user && session.user.id) {
      userId = new mongoose.Types.ObjectId(session.user.id);
    }

    // Convert address IDs to ObjectIds if provided
    let shippingAddressObjectId = null;
    if (shippingAddressId) {
      try {
        shippingAddressObjectId = mongoose.Types.ObjectId.isValid(shippingAddressId)
          ? new mongoose.Types.ObjectId(shippingAddressId)
          : null;
      } catch (err) {
        console.error("Invalid shippingAddressId:", shippingAddressId);
      }
    }

    let billingInfoObjectId = null;
    if (billingInfoId) {
      try {
        billingInfoObjectId = mongoose.Types.ObjectId.isValid(billingInfoId)
          ? new mongoose.Types.ObjectId(billingInfoId)
          : null;
      } catch (err) {
        console.error("Invalid billingInfoId:", billingInfoId);
      }
    }

    // Create and save order
    const order = await Order.create({
      user: userId, // Set user ID if logged in, null for guest checkout
      products,
      total,
      status: "pending",
      shippingAddressId: shippingAddressObjectId,
      billingInfoId: billingInfoObjectId,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        deliveryNote: shippingAddress.deliveryNote || undefined,
        note: shippingAddress.note || shippingAddress.deliveryNote || undefined,
        // Keep backward compatibility
        zipCode: shippingAddress.postalCode || shippingAddress.zipCode,
        district: shippingAddress.district,
      },
      billingInfo: {
        requestInvoice: billingInfo?.requestInvoice || false,
        type: billingInfo?.type || (billingInfo?.requestInvoice ? "corporate" : undefined),
        companyName: billingInfo?.requestInvoice ? billingInfo.companyName : undefined,
        taxNumber: billingInfo?.requestInvoice ? billingInfo.taxNumber : undefined,
        taxOffice: billingInfo?.taxOffice,
        email: billingInfo?.email,
        billingAddress: billingInfo?.billingAddress,
        // Keep backward compatibility
        billingType: billingInfo?.billingType || billingInfo?.type,
      },
      // createdAt will be set automatically by the schema default
    });

    // Return success message with order ID
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: error.message,
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
}
