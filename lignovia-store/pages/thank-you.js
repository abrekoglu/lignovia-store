import Head from "next/head";
import Layout from "@/components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function ThankYou() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Thank You - Lignovia Store</title>
        <meta name="description" content="Order confirmation" />
      </Head>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-gray-600 text-lg mb-6">
              Your order has been placed successfully. We'll send you a confirmation email shortly.
            </p>
            {orderId && (
              <p className="text-sm text-gray-500 mb-6">
                Order ID: {orderId}
              </p>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading order details...</p>
            </div>
          )}

          {order && (
            <div className="border-t border-gray-200 pt-8 space-y-6">
              {/* Shipping Address */}
              {order.shippingAddress && order.shippingAddress.fullName && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress.fullName}
                    </p>
                    {order.shippingAddress.phone && (
                      <p>Phone: {order.shippingAddress.phone}</p>
                    )}
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
                        Delivery Note: {order.shippingAddress.deliveryNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Billing Information */}
              {order.billingInfo && order.billingInfo.requestInvoice && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Invoice Information
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
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

              {/* Order Summary */}
              {order.total && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/shop"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200 text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/my-orders"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors duration-200 text-center"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition-colors duration-200 text-center"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

