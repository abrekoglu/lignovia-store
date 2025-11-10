import Head from "next/head";
import Layout from "@/components/Layout";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";

export default function MyOrders({ orders, error }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Orders - Lignovia Store</title>
        <meta name="description" content="View your order history" />
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error loading orders: {error}</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Order #{order._id?.substring(0, 8) || "N/A"}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status || "pending"
                          )}`}
                        >
                          {(order.status || "pending").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${order.total?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500">Total Amount</p>
                    </div>
                  </div>
                </div>

                {/* Order Products */}
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Products
                  </h3>
                  <div className="space-y-3">
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              Product ID: {product.product?.substring(0, 8) || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {product.quantity || 0} × ${product.price?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${((product.quantity || 0) * (product.price || 0)).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">Subtotal</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No products in this order</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address (if available) */}
                {order.shippingAddress && order.shippingAddress.fullName && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Shipping Address
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium text-gray-900">{order.shippingAddress.fullName}</span>
                        {order.shippingAddress.phone && ` • ${order.shippingAddress.phone}`}
                      </p>
                      {order.shippingAddress.address && (
                        <p>{order.shippingAddress.address}</p>
                      )}
                      <p>
                        {order.shippingAddress.city}
                        {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
                        {order.shippingAddress.country && `, ${order.shippingAddress.country}`}
                        {/* Backward compatibility */}
                        {!order.shippingAddress.country && order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                        {!order.shippingAddress.postalCode && order.shippingAddress.zipCode && ` ${order.shippingAddress.zipCode}`}
                      </p>
                      {order.shippingAddress.deliveryNote && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Note: {order.shippingAddress.deliveryNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Information (if invoice requested) */}
                {order.billingInfo && order.billingInfo.requestInvoice && (
                  <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Invoice Information
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {order.billingInfo.companyName && (
                        <p>
                          <span className="font-medium text-gray-900">Company:</span> {order.billingInfo.companyName}
                        </p>
                      )}
                      {order.billingInfo.taxNumber && (
                        <p>
                          <span className="font-medium text-gray-900">Tax Number:</span> {order.billingInfo.taxNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No orders yet</p>
            <p className="text-gray-500">
              You haven't placed any orders. Start shopping to see your orders here!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    // Get session using getServerSession
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    // Debug: Log session info
    console.log("Session in getServerSideProps:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
    });

    // If user is not logged in, redirect to login
    if (!session || !session.user || !session.user.id) {
      return {
        redirect: {
          destination: "/login?callbackUrl=/my-orders",
          permanent: false,
        },
      };
    }

    // Connect to MongoDB
    await connectDB();

    // Convert user ID string to ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    // Debug: Log query details
    console.log("Querying orders for user ID:", userId.toString());

    // Fetch all orders for this user, sorted by creation date (newest first)
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Debug: Log query results
    console.log(`Found ${orders.length} orders for user ${userId.toString()}`);
    if (orders.length > 0) {
      console.log("Sample order user field:", orders[0].user?.toString());
    }

    // Use JSON.parse(JSON.stringify()) for proper serialization
    const serializedOrders = JSON.parse(
      JSON.stringify(
        orders.map((order) => ({
          _id: order._id ? order._id.toString() : null,
          user: order.user ? order.user.toString() : null,
          total: order.total || 0,
          status: order.status || "pending",
          createdAt: order.createdAt
            ? new Date(order.createdAt).toISOString()
            : null,
          shippingAddress: order.shippingAddress || {},
          billingInfo: order.billingInfo || {},
          // Convert products array
          products: (order.products || []).map((product) => ({
            quantity: product.quantity || 0,
            price: product.price || 0,
            product: product.product
              ? product.product.toString()
              : null,
            _id: product._id ? product._id.toString() : undefined,
          })),
        }))
      )
    );

    return {
      props: {
        orders: serializedOrders,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return {
      props: {
        orders: [],
        error: error.message || "Failed to fetch orders",
      },
    };
  }
}

