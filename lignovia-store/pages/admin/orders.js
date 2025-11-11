import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export default function AdminOrders({ orders: initialOrders, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders || []);
  const [updating, setUpdating] = useState({});
  const [updateError, setUpdateError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Reset to page 1 when filters or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, statusFilter, paymentFilter, emailSearch, orderIdSearch, dateFrom, dateTo]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!selectedOrder) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedOrder]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedOrder) {
      // Store the original overflow value
      const originalOverflow = document.body.style.overflow;
      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      // Also prevent scrolling on html element for better mobile support
      document.documentElement.style.overflow = 'hidden';
      
      // Cleanup: restore scroll when modal closes or component unmounts
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = '';
      };
    } else {
      // Ensure scroll is restored when modal is closed
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }, [selectedOrder]);

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year}, ${hours}:${minutes}`;
  };

  const getPaymentStatus = (order) => {
    // For now, assume all orders are paid. In a real app, this would come from a payment field
    // You can add a paymentStatus field to the Order model later
    return "Paid";
  };

  const getPaymentStatusColor = (status) => {
    return status === "Paid" 
      ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30" 
      : "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
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

  const handleMarkAsShipped = async (orderId) => {
    await handleStatusChange(orderId, "shipped");
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setEmailSearch("");
    setOrderIdSearch("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    statusFilter !== "all" || 
    paymentFilter !== "all" || 
    emailSearch.trim() !== "" || 
    orderIdSearch.trim() !== "" || 
    dateFrom !== "" || 
    dateTo !== "";

  // Filter orders based on selected filters
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }

    // Payment filter
    const paymentStatus = getPaymentStatus(order);
    if (paymentFilter !== "all" && paymentStatus.toLowerCase() !== paymentFilter.toLowerCase()) {
      return false;
    }

    // Email search filter
    if (emailSearch.trim() !== "") {
      const customerEmail = order.userInfo?.email || "";
      const searchLower = emailSearch.toLowerCase().trim();
      if (!customerEmail.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Order ID search filter
    if (orderIdSearch.trim() !== "") {
      const orderId = order._id || "";
      const searchLower = orderIdSearch.toLowerCase().trim();
      if (!orderId.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      if (!orderDate) return false;

      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) {
          return false;
        }
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (orderDate > toDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Pagination calculations (using filtered orders)
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedOrder(null); // Close modal when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    return pages;
  };

  return (
    <AdminLayout>
      <Head>
        <title>Orders - LIGNOVIA Admin</title>
        <meta name="description" content="Manage orders" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Orders
            </h1>
            {session?.user && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Manage and track all customer orders
              </p>
            )}
          </div>
          {/* Search and Export */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search orders..."
              className="input flex-1 lg:min-w-[250px]"
              value={orderIdSearch}
              onChange={(e) => setOrderIdSearch(e.target.value)}
            />
            <button className="btn-secondary whitespace-nowrap">
              Export CSV
            </button>
          </div>
        </div>
      </div>

        {error ? (
          <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
            <p className="text-error-light dark:text-error-dark text-sm font-medium">Error loading orders: {error}</p>
          </div>
        ) : updateError ? (
          <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
            <p className="text-error-light dark:text-error-dark text-sm font-medium">{updateError}</p>
          </div>
        ) : null}

        {/* Filters Section */}
        {orders && orders.length > 0 && (
          <div className="card p-4 lg:p-6 mb-6 sticky top-0 z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div className="min-w-0">
                <label htmlFor="statusFilter" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Shipping Status:
                </label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Payment Filter */}
              <div className="min-w-0">
                <label htmlFor="paymentFilter" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Payment Status:
                </label>
                <select
                  id="paymentFilter"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Email Search */}
              <div className="min-w-0">
                <label htmlFor="emailSearch" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Search by Customer Email:
                </label>
                <input
                  id="emailSearch"
                  type="text"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Search by customer email..."
                  className="input"
                />
              </div>

              {/* Order ID Search */}
              <div className="min-w-0">
                <label htmlFor="orderIdSearch" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Search by Order ID:
                </label>
                <input
                  id="orderIdSearch"
                  type="text"
                  value={orderIdSearch}
                  onChange={(e) => setOrderIdSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Search by Order ID..."
                  className="input font-mono"
                />
              </div>

              {/* Date From */}
              <div className="min-w-0">
                <label htmlFor="dateFrom" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  From:
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className="input"
                />
              </div>

              {/* Date To */}
              <div className="min-w-0">
                <label htmlFor="dateTo" className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  To:
                </label>
                <input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="input"
                />
              </div>
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="btn-text text-sm whitespace-nowrap"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {orders && orders.length > 0 ? (
          filteredOrders.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto mb-6">
              <div className="card overflow-hidden">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead className="bg-hover-light dark:bg-hover-dark">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Order ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        Payment
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
                    {paginatedOrders.map((order) => {
                      const paymentStatus = getPaymentStatus(order);
                      return (
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge border rounded-full px-3 py-1 ${getPaymentStatusColor(paymentStatus)}`}>
                              {paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-semibold text-accent">
                              ${order.total?.toFixed(2) || "0.00"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openOrderDetails(order)}
                                className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
                                aria-label="View order details"
                                title="View Details"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {paginatedOrders.map((order) => {
                const paymentStatus = getPaymentStatus(order);
                const itemCount = order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
                return (
                  <div
                    key={order._id}
                    className="card p-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-accent font-mono mb-1">
                            {order._id?.substring(0, 12) || "N/A"}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <span className={`badge border rounded-full px-3 py-1 ${getStatusColor(order.status || "pending")}`}>
                            {(order.status || "pending").charAt(0).toUpperCase() + (order.status || "pending").slice(1)}
                          </span>
                          <span className={`badge border rounded-full px-3 py-1 ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border-light dark:border-border-dark">
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                          {order.userInfo?.name || order.shippingAddress?.fullName || "Guest"}
                        </p>
                        {order.userInfo?.email && (
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
                            {order.userInfo.email}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            {itemCount} {itemCount === 1 ? "item" : "items"}
                          </span>
                          <span className="text-lg font-semibold text-accent">
                            ${order.total?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="btn-primary w-full text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Orders Count */}
                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Showing {startIndex + 1}–{Math.min(endIndex, totalOrders)} of {totalOrders} {totalOrders === 1 ? "order" : "orders"}
                  {hasActiveFilters && (
                    <span className="ml-2">
                      (filtered from {orders.length} total)
                    </span>
                  )}
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                      Orders per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="min-w-[80px]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                        currentPage === 1
                          ? "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed opacity-50"
                          : "bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                      }`}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 text-sm font-medium rounded-full transition-all duration-200 ${
                            currentPage === pageNum
                              ? "bg-accent text-white"
                              : "bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                          }`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? "page" : undefined}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                        currentPage === totalPages
                          ? "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed opacity-50"
                          : "bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                      }`}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-medium mb-2">No orders match your filters.</p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Try adjusting your search criteria or{" "}
                <button
                  onClick={clearAllFilters}
                  className="text-accent hover:opacity-70 underline transition-opacity duration-200"
                >
                  clear all filters
                </button>
                .
              </p>
            </div>
          )
        ) : (
          <div className="card p-12 text-center">
            <p className="text-text-primary-light dark:text-text-primary-dark text-lg font-medium mb-2">No orders yet.</p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Orders will appear here once customers start placing orders.
            </p>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeOrderDetails}
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
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">Order Details</h2>
                <button
                  onClick={closeOrderDetails}
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
                {/* Basic Info Section */}
                <div className="bg-hover-light dark:bg-hover-dark rounded-softer p-5 border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Order ID</span>
                      <p className="text-sm font-mono font-semibold text-accent">
                        {selectedOrder._id || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Order Date & Time</span>
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {formatDate(selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Payment Status</span>
                      <div className="mt-1">
                        <span className={`badge border rounded-full px-3 py-1 ${getPaymentStatusColor(getPaymentStatus(selectedOrder))}`}>
                          {getPaymentStatus(selectedOrder)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Shipping Status</span>
                      <div className="mt-1">
                        <span className={`badge border rounded-full px-3 py-1 ${getStatusColor(selectedOrder.status || "pending")}`}>
                          {(selectedOrder.status || "pending").charAt(0).toUpperCase() + (selectedOrder.status || "pending").slice(1)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Total Price</span>
                      <p className="text-lg font-semibold text-accent">
                        ${selectedOrder.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Number of Items</span>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0} items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info Section */}
                <div className="bg-hover-light dark:bg-hover-dark rounded-softer p-5 border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Customer Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Full Name</span>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.userInfo?.name || selectedOrder.shippingAddress?.fullName || "Guest"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Email</span>
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.userInfo?.email || selectedOrder.billingInfo?.email || "N/A"}
                      </p>
                    </div>
                    {selectedOrder.shippingAddress?.phone && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Phone</span>
                        <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress?.fullName && (
                    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-2">Shipping Address</span>
                      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-soft border border-border-light dark:border-border-dark text-sm">
                        <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{selectedOrder.shippingAddress.fullName}</p>
                        {selectedOrder.shippingAddress.phone && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">Phone: {selectedOrder.shippingAddress.phone}</p>
                        )}
                        {selectedOrder.shippingAddress.address && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">{selectedOrder.shippingAddress.address}</p>
                        )}
                        <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">
                          {selectedOrder.shippingAddress.city}
                          {selectedOrder.shippingAddress.postalCode && `, ${selectedOrder.shippingAddress.postalCode}`}
                          {selectedOrder.shippingAddress.country && `, ${selectedOrder.shippingAddress.country}`}
                          {!selectedOrder.shippingAddress.country && selectedOrder.shippingAddress.district && `, ${selectedOrder.shippingAddress.district}`}
                          {!selectedOrder.shippingAddress.postalCode && selectedOrder.shippingAddress.zipCode && ` ${selectedOrder.shippingAddress.zipCode}`}
                        </p>
                        {selectedOrder.shippingAddress.deliveryNote && (
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic mt-2 pt-2 border-t border-border-light dark:border-border-dark">
                            Note: {selectedOrder.shippingAddress.deliveryNote}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Billing Address */}
                  {selectedOrder.billingInfo?.requestInvoice && (
                    <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-2">Billing Address</span>
                      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-soft border border-border-light dark:border-border-dark text-sm">
                        {selectedOrder.billingInfo.companyName && (
                          <p className="font-medium text-text-primary-light dark:text-text-primary-dark">{selectedOrder.billingInfo.companyName}</p>
                        )}
                        {selectedOrder.billingInfo.billingAddress && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">{selectedOrder.billingInfo.billingAddress}</p>
                        )}
                        {selectedOrder.billingInfo.taxNumber && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">Tax Number: {selectedOrder.billingInfo.taxNumber}</p>
                        )}
                        {selectedOrder.billingInfo.taxOffice && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">Tax Office: {selectedOrder.billingInfo.taxOffice}</p>
                        )}
                        {selectedOrder.billingInfo.email && (
                          <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">Email: {selectedOrder.billingInfo.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ordered Items Table */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Ordered Items</h3>
                  <div className="overflow-x-auto">
                    <div className="card overflow-hidden">
                      <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                        <thead className="bg-hover-light dark:bg-hover-dark">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                              Product
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                              Price
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                              Quantity
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                        {selectedOrder.products && selectedOrder.products.length > 0 ? (
                          selectedOrder.products.map((product, index) => {
                            const productId = product.product
                              ? typeof product.product === "string"
                                ? product.product
                                : product.product.toString()
                              : "N/A";
                            const subtotal = (product.quantity || 0) * (product.price || 0);

                            return (
                              <tr key={index} className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 w-12 h-12 bg-hover-light dark:bg-hover-dark rounded-soft flex items-center justify-center mr-3 border border-border-light dark:border-border-dark">
                                      <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-mono">
                                        {productId.substring(0, 6)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                                        Product ID: {productId.substring(0, 12)}...
                                      </p>
                                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-mono">
                                        {productId}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">
                                  ${product.price?.toFixed(2) || "0.00"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary-light dark:text-text-primary-dark">
                                  {product.quantity || 0}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-text-primary-light dark:text-text-primary-dark text-right">
                                  ${subtotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              No products in this order
                            </td>
                          </tr>
                        )}
                        <tr className="bg-hover-light dark:bg-hover-dark">
                          <td colSpan="3" className="px-4 py-3 text-right text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            Total:
                          </td>
                          <td className="px-4 py-3 text-right text-lg font-semibold text-accent">
                            ${selectedOrder.total?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="border-t border-border-light dark:border-border-dark pt-4">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <select
                      value={selectedOrder.status || "pending"}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder._id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      disabled={updating[selectedOrder._id]}
                      className={updating[selectedOrder._id] ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={closeOrderDetails}
                      className="btn-secondary text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

  // Access granted - session is available in result.session
  const { session } = result;

  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch all orders, sorted by creation date (newest first)
    // Populate user information
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Convert MongoDB ObjectIds and Dates to strings for JSON serialization
    const serializedOrders = orders.map((order) => {
      // Convert order-level ObjectIds and Dates
      const serializedOrder = {
        _id: order._id ? order._id.toString() : null,
        user: order.user ? order.user.toString() : null,
        userInfo: order.user
          ? {
              name: order.user.name || null,
              email: order.user.email || null,
            }
          : null,
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
