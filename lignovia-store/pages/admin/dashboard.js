import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import SkeletonCard from "@/components/SkeletonCard";
import SkeletonTable from "@/components/SkeletonTable";
import SkeletonChart from "@/components/SkeletonChart";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export default function AdminDashboard({ 
  stats, 
  recentOrders, 
  lowStockProducts, 
  error 
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/dashboard");
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
      <AdminLayout>
        <Head>
          <title>Dashboard - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Welcome back
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard count={4} />
        </div>
        <div className="mb-8">
          <SkeletonTable rows={5} columns={5} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SkeletonChart type="line" height="300px" />
          <SkeletonChart type="bar" height="300px" />
        </div>
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark border-border-light dark:border-border-dark";
      case "processing":
        return "bg-accent text-white border-accent";
      case "shipped":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30";
      case "completed":
      case "delivered":
        return "bg-accent/20 text-accent border-accent/30";
      case "cancelled":
        return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
      default:
        return "bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark";
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Dashboard - LIGNOVIA Admin</title>
        <meta name="description" content="Admin dashboard" />
      </Head>

      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Welcome back, {session?.user?.name || session?.user?.email || "Admin"}
        </p>
      </div>

      {error ? (
        <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
          <p className="text-error-light dark:text-error-dark text-sm font-medium">Error loading dashboard: {error}</p>
        </div>
      ) : !stats ? (
        <>
          {/* Loading State - Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonCard count={4} />
          </div>

          {/* Loading State - Recent Orders */}
          <div className="mb-8">
            <SkeletonTable rows={5} columns={5} />
          </div>

          {/* Loading State - Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SkeletonChart type="line" height="300px" />
            <SkeletonChart type="bar" height="300px" />
          </div>
        </>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales Card */}
            <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Total Sales
                      </span>
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                      ${stats?.totalSales?.toFixed(2) || "0.00"}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-success-light dark:text-success-dark">
                        +{stats?.salesChange || 0}%
                      </span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">vs last month</span>
                    </div>
            </div>

            {/* Orders Today Card */}
            <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Orders Today
                      </span>
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h1.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v2.25zm6 0a.75.75 0 01-.75-.75V8.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 01.75-.75z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                      {stats?.ordersToday || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-success-light dark:text-success-dark">
                        +{stats?.ordersChange || 0}%
                      </span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">vs yesterday</span>
                    </div>
            </div>

            {/* Active Products Card */}
            <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Active Products
                      </span>
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                      {stats?.activeProducts || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">In stock</span>
                    </div>
            </div>

            {/* Returning Customers Card */}
            <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Returning Customers
                      </span>
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                      {stats?.returningCustomers || 0}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-success-light dark:text-success-dark">
                        +{stats?.customersChange || 0}%
                      </span>
                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">vs last month</span>
                    </div>
            </div>
          </div>

          {/* Inventory Alert Banner */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-8">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-error-light dark:text-error-dark flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-error-light dark:text-error-dark">
                          {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} {lowStockProducts.length === 1 ? "has" : "have"} low stock or are out of stock
                        </p>
                      </div>
                      <Link href="/admin/inventory" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors duration-200">
                        View Inventory
                      </Link>
                    </div>
            </div>
          )}

          {/* Recent Orders Section */}
          <div className="card mb-8">
                  <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                      Recent Orders
                    </h2>
                    <Link href="/admin/orders" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors duration-200">
                      View All Orders
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                      <thead className="bg-hover-light dark:bg-hover-dark">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                        {recentOrders && recentOrders.length > 0 ? (
                          recentOrders.slice(0, 10).map((order) => (
                            <tr
                              key={order._id}
                              className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-semibold text-accent font-mono">
                                  {order._id?.substring(0, 12) || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                                    {order.userInfo?.name || order.shippingAddress?.fullName || "Guest"}
                                  </p>
                                  {order.userInfo?.email && (
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                      {order.userInfo.email}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                  {formatDate(order.createdAt)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`badge border rounded-full px-3 py-1 ${getStatusColor(order.status || "pending")}`}>
                                  {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-semibold text-accent">
                                  ${order.total?.toFixed(2) || "0.00"}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              No recent orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
            </div>
          </div>

          {/* Inventory & Alerts Section */}
          {lowStockProducts && lowStockProducts.length > 0 && (
            <div className="card mb-8">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark">
                      <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                        Stock Status
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockProducts.slice(0, 6).map((product) => (
                          <div
                            key={product._id}
                            className="bg-hover-light dark:bg-hover-dark rounded-[14px] p-4 border border-border-light dark:border-border-dark"
                          >
                            <div className="flex items-start gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 rounded-[12px] border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate mb-1">
                                  {product.name}
                                </p>
                                <p className={`text-sm font-medium mb-3 ${
                                  (product.stock || 0) === 0
                                    ? "text-error-light dark:text-error-dark"
                                    : "text-text-secondary-light dark:text-text-secondary-dark"
                                }`}>
                                  Stock: {product.stock !== undefined ? product.stock : 0}
                                </p>
                                <Link
                                  href={`/admin/products`}
                                  className="text-xs font-medium text-accent hover:text-accent/80 transition-colors duration-200"
                                >
                                  View Product
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
          )}

          {/* Analytics Section - Placeholder Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Sales Over Time */}
                  <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                        Sales Over Time
                      </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          Chart visualization coming soon
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="card p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25l3 3m0 0l3-3m-3 3v6" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                        Top Categories
                      </h3>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25l3 3m0 0l3-3m-3 3v6" />
                        </svg>
                        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                          Chart visualization coming soon
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-border-light dark:border-border-dark">
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              LIGNOVIA Admin Panel © {new Date().getFullYear()} — Crafted with precision.
            </p>
          </div>
        </>
      )}
    </AdminLayout>
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

  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch orders for stats
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch products for stats
    const products = await Product.find({}).lean();

    // Calculate stats
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = orders.filter(
      (order) => order.createdAt && new Date(order.createdAt) >= today
    ).length;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const ordersYesterday = orders.filter(
      (order) => order.createdAt && new Date(order.createdAt) >= yesterday && new Date(order.createdAt) < today
    ).length;

    const ordersChange = ordersYesterday > 0 
      ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100)
      : ordersToday > 0 ? 100 : 0;

    const activeProducts = products.filter((p) => p.inStock && (p.stock || 0) > 0).length;
    
    // Get unique customers (users who have placed orders)
    const uniqueCustomers = new Set(
      orders
        .filter((order) => order.user)
        .map((order) => order.user.toString())
    );
    const returningCustomers = uniqueCustomers.size;

    // Calculate sales change (placeholder - would need historical data)
    const salesChange = 5; // Placeholder
    const customersChange = 3; // Placeholder

    // Get low stock products (stock < 10 or stock === 0)
    const lowStockProducts = products
      .filter((p) => (p.stock || 0) < 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 10)
      .map((p) => ({
        _id: p._id.toString(),
        name: p.name,
        stock: p.stock || 0,
        image: p.image || null,
      }));

    // Get recent orders (last 10)
    const recentOrders = orders.slice(0, 10).map((order) => ({
      _id: order._id.toString(),
      user: order.user ? order.user.toString() : null,
      userInfo: order.user
        ? {
            name: order.user.name || null,
            email: order.user.email || null,
          }
        : null,
      total: order.total || 0,
      status: order.status || "pending",
      createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
      shippingAddress: order.shippingAddress || {},
    }));

    return {
      props: {
        stats: {
          totalSales,
          salesChange,
          ordersToday,
          ordersChange,
          activeProducts,
          returningCustomers,
          customersChange,
        },
        recentOrders: JSON.parse(JSON.stringify(recentOrders)),
        lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      props: {
        stats: {
          totalSales: 0,
          salesChange: 0,
          ordersToday: 0,
          ordersChange: 0,
          activeProducts: 0,
          returningCustomers: 0,
          customersChange: 0,
        },
        recentOrders: [],
        lowStockProducts: [],
        error: error.message || "Failed to fetch dashboard data",
      },
    };
  }
}
