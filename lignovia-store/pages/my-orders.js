import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { formatPrice } from "@/utils/priceUtils";

export default function MyOrders({ orders, error }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark border-border-light dark:border-border-dark";
      case "shipped":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30";
      case "delivered":
      case "completed":
        return "bg-accent/20 text-accent border-accent/30";
      case "cancelled":
        return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
      case "pending":
      default:
        return "bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark";
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusMap[status?.toLowerCase()] || "Pending";
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };
    if (selectedOrder) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedOrder]);

  return (
    <Layout>
      <Head>
        <title>My Orders - LIGNOVIA</title>
        <meta name="description" content="View your order history" />
      </Head>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8 lg:mb-12 text-text-primary-light dark:text-text-primary-dark tracking-tight">
          My Orders
        </h1>

        {error ? (
          <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
            <p className="text-error-light dark:text-error-dark text-sm font-medium">Error loading orders: {error}</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead className="bg-hover-light dark:bg-hover-dark">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Order Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Items
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Total
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-accent">
                            #{order._id?.substring(0, 12) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge border ${getStatusColor(order.status || "pending")}`}>
                            {getStatusLabel(order.status || "pending")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                            {order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0} items
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className="text-lg font-semibold text-accent">
                            {formatPrice(order.total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="btn-text text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="card p-5 lg:p-6"
                >
                  {/* Order Header */}
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-accent mb-2">
                          Order #{order._id?.substring(0, 12) || "N/A"}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`badge border ${getStatusColor(order.status || "pending")}`}>
                        {getStatusLabel(order.status || "pending")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0} items
                      </span>
                      <span className="text-xl font-semibold text-accent">
                        ${order.total?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn-primary w-full text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="card p-12 lg:p-16 text-center">
            <div className="mb-6 flex justify-center">
              <svg
                className="w-16 h-16 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">
              You haven't placed any orders yet.
            </p>
            <Link href="/shop" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
              }
            }}
            style={{ 
              overscrollBehavior: 'contain',
              overflow: 'hidden'
            }}
          >
            <div
              className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="bg-hover-light dark:bg-hover-dark rounded-softer p-5 border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                    Order Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                        Order Number
                      </span>
                      <p className="text-sm font-mono font-semibold text-accent">
                        {selectedOrder._id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                        Date & Time
                      </span>
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                        Status
                      </span>
                      <span className={`badge border ${getStatusColor(selectedOrder.status || "pending")}`}>
                        {getStatusLabel(selectedOrder.status || "pending")}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                        Total Amount
                      </span>
                      <p className="text-lg font-semibold text-accent">
                        {formatPrice(selectedOrder.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                    Products
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.products && selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((product, index) => {
                        const subtotal = (product.quantity || 0) * (product.price || 0);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 border-b border-border-light dark:border-border-dark last:border-0"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                                Product ID: {product.product?.substring(0, 12) || "N/A"}
                              </p>
                              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                Quantity: {product.quantity || 0} × {formatPrice(product.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {formatPrice(subtotal)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">No products in this order</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && selectedOrder.shippingAddress.fullName && (
                  <div className="bg-hover-light dark:bg-hover-dark rounded-softer p-5 border border-border-light dark:border-border-dark">
                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                      Shipping Address
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.shippingAddress.fullName}
                      </p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                          Phone: {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                      {selectedOrder.shippingAddress.address && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {selectedOrder.shippingAddress.address}
                        </p>
                      )}
                      <p className="text-text-secondary-light dark:text-text-secondary-dark">
                        {selectedOrder.shippingAddress.city}
                        {selectedOrder.shippingAddress.postalCode && `, ${selectedOrder.shippingAddress.postalCode}`}
                        {selectedOrder.shippingAddress.country && `, ${selectedOrder.shippingAddress.country}`}
                        {!selectedOrder.shippingAddress.country && selectedOrder.shippingAddress.district && `, ${selectedOrder.shippingAddress.district}`}
                        {!selectedOrder.shippingAddress.postalCode && selectedOrder.shippingAddress.zipCode && ` ${selectedOrder.shippingAddress.zipCode}`}
                      </p>
                      {selectedOrder.shippingAddress.deliveryNote && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                          Note: {selectedOrder.shippingAddress.deliveryNote}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Information */}
                {selectedOrder.billingInfo && selectedOrder.billingInfo.requestInvoice && (
                  <div className="bg-hover-light dark:bg-hover-dark rounded-softer p-5 border border-border-light dark:border-border-dark">
                    <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                      Invoice Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.billingInfo.companyName && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Company:</span> {selectedOrder.billingInfo.companyName}
                        </p>
                      )}
                      {selectedOrder.billingInfo.taxNumber && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Tax Number:</span> {selectedOrder.billingInfo.taxNumber}
                        </p>
                      )}
                      {selectedOrder.billingInfo.taxOffice && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Tax Office:</span> {selectedOrder.billingInfo.taxOffice}
                        </p>
                      )}
                      {selectedOrder.billingInfo.email && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">
                          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Email:</span> {selectedOrder.billingInfo.email}
                        </p>
                      )}
                      {selectedOrder.billingInfo.billingAddress && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Address:</span> {selectedOrder.billingInfo.billingAddress}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
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

