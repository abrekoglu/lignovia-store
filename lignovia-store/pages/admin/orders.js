import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export default function AdminOrders({ orders: initialOrders, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders || []);
  const [updating, setUpdating] = useState({});
  const [updateError, setUpdateError] = useState("");

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/orders");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
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
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [orderId]: true }));
    setUpdateError("");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setUpdateError(data.error || "Failed to update order status");
        setUpdating((prev) => ({ ...prev, [orderId]: false }));
        return;
      }

      // Update the order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    } catch (err) {
      setUpdateError("An error occurred while updating the order status");
      setUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <Layout>
      <Head>
        <title>Admin Orders - Lignovia Store</title>
        <meta name="description" content="Manage orders" />
      </Head>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Order Management</h1>
          {session?.user && (
            <div className="text-sm text-gray-600">
              Logged in as: {session.user.email}
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error loading orders: {error}</p>
          </div>
        ) : updateError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{updateError}</p>
          </div>
        ) : null}

        {orders && orders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order._id ? order._id.substring(0, 8) + "..." : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {order._id || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status || "pending"}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={updating[order._id]}
                              className={`text-xs font-semibold rounded px-3 py-1 border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                                updating[order._id]
                                  ? "opacity-50 cursor-not-allowed bg-gray-100"
                                  : "cursor-pointer bg-white border-gray-300"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                            </select>
                            {updating[order._id] && (
                              <span className="text-xs text-gray-500">
                                Updating...
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                order.status || "pending"
                              )}`}
                            >
                              {order.status || "pending"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${order.total?.toFixed(2) || "0.00"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {order.products && order.products.length > 0 ? (
                              <div className="space-y-1">
                                {order.products.map((product, index) => (
                                  <div
                                    key={index}
                                    className="text-xs bg-gray-50 p-2 rounded"
                                  >
                                    <div className="font-medium">
                                      Product ID:{" "}
                                      {product.product
                                        ? typeof product.product === "string"
                                          ? product.product.substring(0, 8)
                                          : product.product.toString().substring(0, 8)
                                        : "N/A"}
                                    </div>
                                    <div className="text-gray-600">
                                      Qty: {product.quantity} × $
                                      {product.price?.toFixed(2) || "0.00"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No products</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Shipping and Billing Details Row */}
                      {(order.shippingAddress?.fullName || order.billingInfo?.requestInvoice) && (
                        <tr className="bg-gray-50">
                          <td colSpan="5" className="px-6 py-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {/* Shipping Address */}
                              {order.shippingAddress?.fullName && (
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-2">Shipping Address</h5>
                                  <div className="text-gray-600 space-y-1">
                                    <p>
                                      <span className="font-medium">{order.shippingAddress.fullName}</span>
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
                                      <p className="text-xs text-gray-500 italic">
                                        Note: {order.shippingAddress.deliveryNote}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                              {/* Billing Information */}
                              {order.billingInfo?.requestInvoice && (
                                <div>
                                  <h5 className="font-semibold text-gray-700 mb-2">Invoice Information</h5>
                                  <div className="text-gray-600 space-y-1">
                                    {order.billingInfo.companyName && (
                                      <p>
                                        <span className="font-medium">Company:</span> {order.billingInfo.companyName}
                                      </p>
                                    )}
                                    {order.billingInfo.taxNumber && (
                                      <p>
                                        <span className="font-medium">Tax Number:</span> {order.billingInfo.taxNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No orders yet</p>
            <p className="text-gray-500 mt-2">
              Orders will appear here once customers start placing orders.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // Check admin access using helper function
  const adminCheck = await import("@/lib/checkAdmin");
  const result = await adminCheck.checkAdmin(context);

  // If result contains redirect, return it (user is not authorized)
  if (result.redirect) {
    return result;
  }

  // Access granted - session is available in result.session
  const { session } = result;

  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch all orders, sorted by creation date (newest first)
    // Use .lean() to get plain JavaScript objects instead of Mongoose documents
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB ObjectIds and Dates to strings for JSON serialization
    const serializedOrders = orders.map((order) => {
      // Convert order-level ObjectIds and Dates
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
        // Convert products array
        products: (order.products || []).map((product) => {
          const serializedProduct = {
            quantity: product.quantity || 0,
            price: product.price || 0,
          };

          // Convert product ObjectId
          if (product.product) {
            serializedProduct.product =
              typeof product.product === "object" &&
              product.product.toString
                ? product.product.toString()
                : String(product.product);
          } else {
            serializedProduct.product = null;
          }

          // Convert _id if it exists in the product object
          if (product._id) {
            serializedProduct._id =
              typeof product._id === "object" && product._id.toString
                ? product._id.toString()
                : String(product._id);
          }

          return serializedProduct;
        }),
      };

      return serializedOrder;
    });

    return {
      props: {
        orders: serializedOrders,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      props: {
        orders: [],
        error: error.message || "Failed to fetch orders",
      },
    };
  }
}
