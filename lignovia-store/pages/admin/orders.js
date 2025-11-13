import Head from "next/head";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import AdminLayout from "@/components/AdminLayout";
import SkeletonTable from "@/components/SkeletonTable";
import { Table } from "@/components/table";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { FilterChips } from "@/components/filters/FilterChip";
import DateRangePicker from "@/components/filters/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

export default function AdminOrders({ orders: initialOrders, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const { confirm } = useConfirmDialog();
  const [orders, setOrders] = useState(initialOrders || []);
  const [updating, setUpdating] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [shouldRenderOrderDetails, setShouldRenderOrderDetails] = useState(false);
  const [shouldRenderStatusUpdate, setShouldRenderStatusUpdate] = useState(false);
  const [isOrderDetailsAnimating, setIsOrderDetailsAnimating] = useState(false);
  const [isStatusUpdateAnimating, setIsStatusUpdateAnimating] = useState(false);

  // Handle sorting
  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

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
  }, [pageSize, statusFilter, paymentFilter, deliveryFilter, countryFilter, searchQuery, dateRange]);

  // Handle ESC key to close modals (only closes topmost modal)
  useEffect(() => {
    if (!selectedOrder && !isUpdateStatusModalOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        // Only close the topmost modal (Status Update modal if open, otherwise Order Details)
        if (isUpdateStatusModalOpen) {
          closeUpdateStatusModal();
        } else if (selectedOrder) {
          closeOrderDetails();
        }
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedOrder, isUpdateStatusModalOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedOrder || isUpdateStatusModalOpen) {
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
  }, [selectedOrder, isUpdateStatusModalOpen]);

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Orders - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">Orders Management</h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Manage and track all orders</p>
        </div>
        <SkeletonTable rows={8} columns={5} />
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

  // Format date for display (with optional time)
  const formatDateShort = (date, includeTime = false) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = d.getFullYear();
    
    if (includeTime) {
      const hours = d.getHours().toString().padStart(2, "0");
      const minutes = d.getMinutes().toString().padStart(2, "0");
      return `${month} ${day}, ${year} at ${hours}:${minutes}`;
    }
    
    return `${month} ${day}, ${year}`;
  };

  const getPaymentStatus = (order) => {
    // Check if order has paymentStatus field, otherwise default to "Paid"
    return order.paymentStatus || "Paid";
  };

  // Generate timeline steps based on order status and payment status
  const getOrderTimeline = (order) => {
    const steps = [];
    const status = (order.status || "pending").toLowerCase();
    const paymentStatus = getPaymentStatus(order).toLowerCase();
    const isCancelled = status === "cancelled";
    const isPaymentFailed = paymentStatus === "failed";
    const isPaymentRefunded = paymentStatus === "refunded";
    
    // Step 1: Order Created (always shown)
    steps.push({
      id: "order-created",
      label: "Order Created",
      status: "completed",
      timestamp: formatDateShort(order.createdAt, true),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    });

    // Step 2: Payment Status
    if (paymentStatus === "paid") {
      steps.push({
        id: "payment-confirmed",
        label: "Payment Confirmed",
        status: "completed",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ),
      });
    } else if (paymentStatus === "pending") {
      steps.push({
        id: "payment-pending",
        label: "Payment Pending",
        status: "pending",
        timestamp: "Pending",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      });
    } else if (isPaymentFailed) {
      steps.push({
        id: "payment-failed",
        label: "Payment Failed",
        status: "error",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      });
      // If payment failed, stop timeline here
      return steps;
    }

    // If order is cancelled, show cancellation and stop
    if (isCancelled) {
      steps.push({
        id: "cancelled",
        label: "Order Cancelled",
        status: "error",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      });
      return steps;
    }

    // Step 3: Processing (only if payment is successful and not cancelled)
    if (status === "processing" || status === "shipped" || status === "delivered" || status === "completed") {
      steps.push({
        id: "processing",
        label: "Processing",
        status: status === "processing" ? "active" : "completed",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ),
      });
    } else if (status === "pending") {
      steps.push({
        id: "processing",
        label: "Processing",
        status: "pending",
        timestamp: "Pending",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        ),
      });
    }

    // Step 4: Shipped
    if (status === "shipped" || status === "delivered" || status === "completed") {
      steps.push({
        id: "shipped",
        label: "Shipped",
        status: "completed",
        timestamp: formatDateShort(order.createdAt, true),
        note: order.trackingId ? `Tracking: ${order.trackingId}` : order.deliveryMethod ? `Method: ${order.deliveryMethod}` : null,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      });
    } else {
      steps.push({
        id: "shipped",
        label: "Shipped",
        status: "pending",
        timestamp: "Pending",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        ),
      });
    }

    // Step 5: Delivered
    if (status === "delivered" || status === "completed") {
      steps.push({
        id: "delivered",
        label: "Delivered",
        status: "completed",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        ),
      });
    } else {
      steps.push({
        id: "delivered",
        label: "Delivered",
        status: "pending",
        timestamp: "Pending",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        ),
      });
    }

    // Step 6: Refunded (if applicable, shown after delivery)
    if (isPaymentRefunded) {
      steps.push({
        id: "refunded",
        label: "Payment Refunded",
        status: "error",
        timestamp: formatDateShort(order.createdAt, true),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        ),
      });
    }

    return steps;
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30";
      case "pending":
        return "bg-accent/20 dark:bg-accent/30 text-accent border-accent/30";
      case "failed":
        return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
      case "refunded":
        return "bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark";
      default:
        return "bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark";
    }
  };

  const getFulfillmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark border-border-light dark:border-border-dark";
      case "shipped":
        return "bg-accent/30 dark:bg-accent/40 text-accent border-accent/50";
      case "delivered":
      case "completed":
        return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30";
      case "cancelled":
        return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
      case "pending":
      default:
        return "bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border-border-light dark:border-border-dark";
    }
  };

  const openUpdateStatusModal = (order) => {
    setShouldRenderStatusUpdate(true);
    setIsStatusUpdateAnimating(true);
    setOrderToUpdate(order);
    setNewStatus(order.status || "pending");
    setIsUpdateStatusModalOpen(true);
  };

  const closeUpdateStatusModal = () => {
    // Start exit animation
    setIsStatusUpdateAnimating(false);
    // Wait for exit animation before unmounting
    setTimeout(() => {
      setIsUpdateStatusModalOpen(false);
      setOrderToUpdate(null);
      setNewStatus("");
      setShouldRenderStatusUpdate(false);
    }, 220);
  };

  const handleStatusChange = async () => {
    if (!orderToUpdate || !newStatus) return;

    const confirmed = await confirm({
      title: "Update Order Status?",
      message: `Are you sure you want to change this order status from "${orderToUpdate.status || "pending"}" to "${newStatus}"?`,
      confirmText: "Update Status",
      cancelText: "Cancel",
      iconType: "info",
      variant: "normal",
    });

    if (!confirmed) {
      return;
    }

    setUpdating((prev) => ({ ...prev, [orderToUpdate._id]: true }));

    try {
      const response = await fetch(`/api/orders/${orderToUpdate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        toastError(data.error || "Failed to update order status");
        setUpdating((prev) => ({ ...prev, [orderToUpdate._id]: false }));
        return;
      }

      // Update the order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderToUpdate._id ? { ...order, status: newStatus } : order
        )
      );

      toastSuccess(`Order status updated to ${newStatus}`);
      setUpdating((prev) => ({ ...prev, [orderToUpdate._id]: false }));
      
      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder._id === orderToUpdate._id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      closeUpdateStatusModal();
    } catch (err) {
      toastError("An error occurred while updating the order status");
      setUpdating((prev) => ({ ...prev, [orderToUpdate._id]: false }));
    }
  };


  const openOrderDetails = (order) => {
    setShouldRenderOrderDetails(true);
    setIsOrderDetailsAnimating(true);
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    // Start exit animation
    setIsOrderDetailsAnimating(false);
    // Wait for exit animation before unmounting
    setTimeout(() => {
      setSelectedOrder(null);
      setShouldRenderOrderDetails(false);
    }, 220);
  };

  // Clear all filters
  const handleClearAllFilters = () => {
    setStatusFilter("all");
    setPaymentFilter("all");
    setDeliveryFilter("all");
    setCountryFilter("all");
    setSearchQuery("");
    setDateRange({ start: null, end: null });
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => (o.status || "pending").toLowerCase() === "pending").length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Active filters for chips
  const activeFilters = [];
  if (statusFilter !== "all") {
    activeFilters.push({
      id: "status",
      label: `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`,
      onRemove: () => setStatusFilter("all"),
    });
  }
  if (paymentFilter !== "all") {
    activeFilters.push({
      id: "payment",
      label: `Payment: ${paymentFilter.charAt(0).toUpperCase() + paymentFilter.slice(1)}`,
      onRemove: () => setPaymentFilter("all"),
    });
  }
  if (deliveryFilter !== "all") {
    activeFilters.push({
      id: "delivery",
      label: `Delivery: ${deliveryFilter.charAt(0).toUpperCase() + deliveryFilter.slice(1)}`,
      onRemove: () => setDeliveryFilter("all"),
    });
  }
  if (countryFilter !== "all") {
    activeFilters.push({
      id: "country",
      label: `Country: ${countryFilter}`,
      onRemove: () => setCountryFilter("all"),
    });
  }
  if (dateRange.start || dateRange.end) {
    const startLabel = dateRange.start
      ? new Date(dateRange.start).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Start";
    const endLabel = dateRange.end
      ? new Date(dateRange.end).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "End";
    activeFilters.push({
      id: "date",
      label: `Date: ${startLabel} - ${endLabel}`,
      onRemove: () => setDateRange({ start: null, end: null }),
    });
  }
  if (searchQuery.trim() !== "") {
    activeFilters.push({
      id: "search",
      label: `Search: ${searchQuery}`,
      onRemove: () => setSearchQuery(""),
    });
  }

  // Get unique countries from orders
  const uniqueCountries = [...new Set(orders.map((o) => o.shippingAddress?.country).filter(Boolean))].sort();

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

    // Delivery filter (if order has deliveryMethod field)
    if (deliveryFilter !== "all" && order.deliveryMethod && order.deliveryMethod.toLowerCase() !== deliveryFilter.toLowerCase()) {
      return false;
    }

    // Country filter
    if (countryFilter !== "all" && order.shippingAddress?.country !== countryFilter) {
      return false;
    }

    // Search filter (Order ID, Email, Customer Name)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      const orderId = order._id?.toLowerCase() || "";
      const customerEmail = order.userInfo?.email?.toLowerCase() || "";
      const customerName = (order.userInfo?.name || order.shippingAddress?.fullName || "").toLowerCase();
      
      if (!orderId.includes(query) && !customerEmail.includes(query) && !customerName.includes(query)) {
        return false;
      }
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      if (!orderDate) return false;

      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (orderDate < startDate) {
          return false;
        }
      }

      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (orderDate > endDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort filtered orders
  let sortedOrders = [...filteredOrders];
  if (sortColumn) {
    sortedOrders.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case "orderId":
          aValue = a._id || "";
          bValue = b._id || "";
          break;
        case "customer":
          aValue = a.userInfo?.name || a.shippingAddress?.fullName || "";
          bValue = b.userInfo?.name || b.shippingAddress?.fullName || "";
          break;
        case "date":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "status":
        case "fulfillmentStatus":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "total":
          aValue = a.total || 0;
          bValue = b.total || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }

  // Pagination calculations (using sorted orders)
  const filteredOrdersCount = sortedOrders.length;
  const totalPages = Math.ceil(filteredOrdersCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedOrder(null); // Close modal when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter options
  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentFilterOptions = [
    { value: "all", label: "All Payment" },
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
  ];

  const deliveryFilterOptions = [
    { value: "all", label: "All Delivery" },
    { value: "standard", label: "Standard" },
    { value: "express", label: "Express" },
    { value: "overnight", label: "Overnight" },
  ];

  const countryFilterOptions = [
    { value: "all", label: "All Countries" },
    ...uniqueCountries.map((country) => ({ value: country, label: country })),
  ];

  // Export orders function
  const handleExportOrders = () => {
    // Create CSV content - export all filtered orders, not just paginated
    const headers = ["Order ID", "Customer", "Email", "Date", "Status", "Payment Status", "Payment Method", "Total", "Items"];
    const rows = sortedOrders.map((order) => {
      const itemsCount = order.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
      return [
        order._id || "",
        order.userInfo?.name || order.shippingAddress?.fullName || "Guest",
        order.userInfo?.email || "",
        order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "",
        order.status || "pending",
        getPaymentStatus(order),
        order.paymentMethod || "N/A",
        `$${(order.total || 0).toFixed(2)}`,
        itemsCount.toString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toastSuccess(`Exported ${sortedOrders.length} order${sortedOrders.length !== 1 ? "s" : ""} successfully`);
  };

  // Table columns configuration - responsive widths
  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      sortable: true,
      minWidth: 120,
      maxWidth: 180,
      render: (row) => (
        <span className="text-sm font-semibold text-accent font-mono">
          {row._id?.substring(0, 12) || "N/A"}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      minWidth: 150,
      maxWidth: 220,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.userInfo?.name || row.shippingAddress?.fullName || "Guest"}
          </p>
          {row.userInfo?.email && (
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[200px]">
              {row.userInfo.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "date",
      label: "Order Date",
      sortable: true,
      minWidth: 100,
      maxWidth: 140,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
          {formatDateShort(row.createdAt)}
        </span>
      ),
    },
    {
      key: "total",
      label: "Total Amount",
      sortable: true,
      minWidth: 100,
      maxWidth: 130,
      align: "right",
      render: (row) => (
        <span className="text-sm font-semibold text-accent whitespace-nowrap">
          ${row.total?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
      sortable: false,
      minWidth: 100,
      maxWidth: 150,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
          {row.paymentMethod || "N/A"}
        </span>
      ),
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      sortable: false,
      minWidth: 110,
      maxWidth: 140,
      render: (row) => {
        const paymentStatus = getPaymentStatus(row);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getPaymentStatusColor(paymentStatus)}`}>
            {paymentStatus}
          </span>
        );
      },
    },
    {
      key: "fulfillmentStatus",
      label: "Fulfillment Status",
      sortable: true,
      minWidth: 120,
      maxWidth: 160,
      render: (row) => {
        const status = row.status || "pending";
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getFulfillmentStatusColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: "itemsCount",
      label: "Items",
      sortable: false,
      minWidth: 60,
      maxWidth: 90,
      align: "center",
      render: (row) => {
        const itemsCount = row.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0;
        return (
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {itemsCount}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      minWidth: 100,
      maxWidth: 130,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openOrderDetails(row);
            }}
            className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              openUpdateStatusModal(row);
            }}
            className="p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-accent transition-all duration-200"
            aria-label="Update order status"
            title="Update Status"
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

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
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={handleExportOrders}
            className="px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export Orders
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          {/* Search Bar */}
          <div className="relative flex-1 lg:flex-initial lg:min-w-[300px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by order ID, email, or name..."
              className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-auto min-w-[160px]">
            <FilterDropdown
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              label=""
            />
          </div>

          {/* Payment Filter */}
          <div className="w-full lg:w-auto min-w-[160px]">
            <FilterDropdown
              options={paymentFilterOptions}
              value={paymentFilter}
              onChange={setPaymentFilter}
              placeholder="All Payment"
              label=""
            />
          </div>

          {/* Delivery Filter */}
          <div className="w-full lg:w-auto min-w-[160px]">
            <FilterDropdown
              options={deliveryFilterOptions}
              value={deliveryFilter}
              onChange={setDeliveryFilter}
              placeholder="All Delivery"
              label=""
            />
          </div>

          {/* Country Filter */}
          {uniqueCountries.length > 0 && (
            <div className="w-full lg:w-auto min-w-[160px]">
              <FilterDropdown
                options={countryFilterOptions}
                value={countryFilter}
                onChange={setCountryFilter}
                placeholder="All Countries"
                label=""
              />
            </div>
          )}

          {/* Date Range Picker */}
          <div className="w-full lg:w-auto">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Date range"
              label=""
            />
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <FilterChips
              chips={activeFilters}
              onClearAll={handleClearAllFilters}
            />
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
          <p className="text-error-light dark:text-error-dark text-sm font-medium">
            Error loading orders: {error}
          </p>
        </div>
      )}

      {/* Summary Cards */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Orders Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Total Orders
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h1.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v2.25zm6 0a.75.75 0 01-.75-.75V8.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 01.75-.75z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              {totalOrders}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">All time</span>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Pending Orders
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              {pendingOrders}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Requires attention</span>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-success-light/20 dark:bg-success-dark/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-success-light dark:text-success-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              ${totalRevenue.toFixed(2)}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">All time</span>
            </div>
          </div>

          {/* Average Order Value Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Average Order Value
              </span>
              <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
              ${averageOrderValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Per order</span>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {!error && (
        <Table
          columns={columns}
          data={paginatedOrders}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={(row) => openOrderDetails(row)}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredOrdersCount}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          sortable={true}
          resizable={true}
          stickyHeader={true}
          loading={false}
          emptyStateTitle="No orders found"
          emptyStateDescription={
            orders?.length === 0
              ? "No orders have been placed yet. Orders will appear here once customers start placing orders."
              : "No orders match your search criteria or filters. Try adjusting your filters or search query."
          }
          emptyStateIcon={
            <svg className="w-16 h-16 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h1.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v2.25zm6 0a.75.75 0 01-.75-.75V8.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 01.75-.75z"
              />
            </svg>
          }
          emptyStateAction={
            orders?.length === 0
              ? null
              : {
                  onClick: handleClearAllFilters,
                  label: "Clear All Filters",
                }
          }
        />
      )}

        {/* Order Details Modal - Base layer when Status Update modal is open */}
        {(selectedOrder || shouldRenderOrderDetails) && (
          <div
            className={`fixed inset-0 flex items-center justify-center p-4 ${
              isUpdateStatusModalOpen 
                ? "bg-black/20 backdrop-blur-[2px] z-40 transition-all duration-300 ease-out" 
                : selectedOrder && isOrderDetailsAnimating
                ? "bg-black/30 backdrop-blur-sm z-50 modal-backdrop-enter"
                : "bg-black/30 backdrop-blur-sm z-50 modal-backdrop-exit"
            }`}
            onClick={(e) => {
              // Only close Order Details if Status Update modal is not open and click is on backdrop
              if (!isUpdateStatusModalOpen && e.target === e.currentTarget) {
                closeOrderDetails();
              }
            }}
            onTouchMove={(e) => {
              if (e.target === e.currentTarget && !isUpdateStatusModalOpen) {
                e.preventDefault();
              }
            }}
            style={{ 
              overscrollBehavior: 'contain',
              overflow: 'hidden'
            }}
          >
            <div
              className={`card max-w-4xl w-full max-h-[90vh] overflow-y-auto my-auto ${
                isUpdateStatusModalOpen 
                  ? "opacity-60 scale-[0.98] pointer-events-none transition-all duration-300 ease-out" 
                  : selectedOrder && isOrderDetailsAnimating
                  ? "modal-content-enter pointer-events-auto"
                  : "modal-content-exit pointer-events-auto"
              }`}
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">Order Details</h2>
                <button
                  onClick={() => {
                    // Only close if Status Update modal is not open
                    if (!isUpdateStatusModalOpen) {
                      closeOrderDetails();
                    }
                  }}
                  className={`text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors duration-200 ${
                    isUpdateStatusModalOpen ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  aria-label="Close modal"
                  disabled={isUpdateStatusModalOpen}
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
                <div className="bg-hover-light dark:bg-hover-dark rounded-[14px] p-5 border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Total Price</span>
                      <p className="text-lg font-semibold text-accent">
                        ${selectedOrder.total?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Payment Method</span>
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.paymentMethod || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Payment Status</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(getPaymentStatus(selectedOrder))}`}>
                          {getPaymentStatus(selectedOrder)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Fulfillment Status</span>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getFulfillmentStatusColor(selectedOrder.status || "pending")}`}>
                          {(selectedOrder.status || "pending").charAt(0).toUpperCase() + (selectedOrder.status || "pending").slice(1)}
                        </span>
                      </div>
                    </div>
                    {selectedOrder.trackingId && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Tracking ID</span>
                        <p className="text-sm font-mono font-semibold text-accent">
                          {selectedOrder.trackingId}
                        </p>
                      </div>
                    )}
                    {selectedOrder.deliveryMethod && (
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Delivery Method</span>
                        <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                          {selectedOrder.deliveryMethod}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">Number of Items</span>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {selectedOrder.products?.reduce((sum, p) => sum + (p.quantity || 0), 0) || 0} items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Info Section */}
                <div className="bg-hover-light dark:bg-hover-dark rounded-[14px] p-5 border border-border-light dark:border-border-dark">
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
                      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-[12px] border border-border-light dark:border-border-dark text-sm">
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
                      <div className="bg-surface-light dark:bg-surface-dark p-3 rounded-[12px] border border-border-light dark:border-border-dark text-sm">
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
                                    <div className="flex-shrink-0 w-12 h-12 bg-hover-light dark:bg-hover-dark rounded-[12px] flex items-center justify-center mr-3 border border-border-light dark:border-border-dark">
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

                {/* Order Timeline Section */}
                <div className="bg-hover-light dark:bg-hover-dark rounded-[14px] p-5 md:p-6 border border-border-light dark:border-border-dark">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">Order Timeline</h3>
                  <div className="relative">
                    {(() => {
                      const timelineSteps = getOrderTimeline(selectedOrder);
                      return timelineSteps.map((step, index) => {
                        const isLast = index === timelineSteps.length - 1;
                        const isCompleted = step.status === "completed";
                        const isActive = step.status === "active";
                        const isPending = step.status === "pending";
                        const isError = step.status === "error";

                        return (
                          <div key={step.id} className="relative flex gap-3 md:gap-4 pb-5 md:pb-6">
                            {/* Vertical Line */}
                            {!isLast && (
                              <div
                                className={`absolute left-[19px] top-10 w-0.5 transition-colors duration-200 ${
                                  isCompleted
                                    ? "bg-accent/40 dark:bg-accent/50"
                                    : isActive
                                    ? "bg-accent/30 dark:bg-accent/40"
                                    : isError
                                    ? "bg-error-light/30 dark:bg-error-dark/30"
                                    : "bg-border-light dark:bg-border-dark"
                                }`}
                                style={{ height: "calc(100% - 0.75rem)" }}
                              />
                            )}

                            {/* Icon Circle */}
                            <div className="relative z-10 flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  isCompleted
                                    ? "bg-accent text-white shadow-soft dark:shadow-soft-dark"
                                    : isActive
                                    ? "bg-accent/80 text-white shadow-soft dark:shadow-soft-dark ring-2 ring-accent/30"
                                    : isError
                                    ? "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-2 border-error-light/50 dark:border-error-dark/50"
                                    : "bg-surface-light dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark"
                                }`}
                              >
                                {step.icon}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className={`text-sm font-semibold ${
                                      isCompleted || isActive
                                        ? "text-text-primary-light dark:text-text-primary-dark"
                                        : isError
                                        ? "text-error-light dark:text-error-dark"
                                        : "text-text-secondary-light dark:text-text-secondary-dark"
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  {step.note && (
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 font-mono break-words">
                                      {step.note}
                                    </p>
                                  )}
                                </div>
                                <p
                                  className={`text-xs whitespace-nowrap sm:ml-4 ${
                                    isPending
                                      ? "text-text-secondary-light dark:text-text-secondary-dark italic"
                                      : "text-text-secondary-light dark:text-text-secondary-dark"
                                  }`}
                                >
                                  {step.timestamp}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Action Controls */}
                <div className="border-t border-border-light dark:border-border-dark pt-6">
                  <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        // Open Status Update modal on top of Order Details modal (stacked)
                        openUpdateStatusModal(selectedOrder);
                      }}
                      className="px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 flex items-center gap-2"
                      disabled={updating[selectedOrder._id]}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        // Print order functionality
                        window.print();
                      }}
                      className="px-6 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[12px] text-sm font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m0 0a2.25 2.25 0 01-2.25-2.25V9.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v2.019m-15 0a48.108 48.108 0 00-3.478-.397m7 0c5.031 0 9.194-3.935 9.919-9M15 13.829a48.108 48.108 0 003.478-.397m0 0a48.108 48.108 0 013.478-.397m-3.478.397a2.25 2.25 0 012.25-2.25V9.75a2.25 2.25 0 00-2.25-2.25h-13.5a2.25 2.25 0 00-2.25 2.25v2.019m15 0v-2.019c0-1.244-.8-2.303-1.94-2.68a48.108 48.108 0 00-3.478-.397m-7 0c5.031 0 9.194 3.935 9.919 9M6.72 13.829v-2.019c0-1.244.8-2.303 1.94-2.68a48.108 48.108 0 013.478-.397m7 0v2.019c0 1.244-.8 2.303-1.94 2.68a48.108 48.108 0 00-3.478.397" />
                      </svg>
                      Print Order
                    </button>
                    <button
                      onClick={() => {
                        // Only close if Status Update modal is not open
                        if (!isUpdateStatusModalOpen) {
                          closeOrderDetails();
                        }
                      }}
                      className={`px-6 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[12px] text-sm font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 ${
                        isUpdateStatusModalOpen ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isUpdateStatusModalOpen}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Status Update Modal - Stacked on top of Order Details modal */}
      {(isUpdateStatusModalOpen || shouldRenderStatusUpdate) && orderToUpdate && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 ${
            isStatusUpdateAnimating ? "modal-backdrop-enter" : "modal-backdrop-exit"
          }`}
          onClick={closeUpdateStatusModal}
          style={{ overscrollBehavior: 'contain', overflow: 'hidden' }}
        >
          <div
            className={`card max-w-md w-full ${
              isStatusUpdateAnimating ? "modal-content-enter" : "modal-content-exit"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Modal Header */}
            <div className="border-b border-border-light dark:border-border-dark px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  Update Order Status
                </h2>
              </div>
              <button
                onClick={closeUpdateStatusModal}
                className="p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-all duration-200"
                aria-label="Close modal"
                disabled={updating[orderToUpdate._id]}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                  Order ID: <span className="font-mono font-semibold text-accent">{orderToUpdate._id?.substring(0, 12) || "N/A"}</span>
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                  Current Status: <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ml-2 ${getFulfillmentStatusColor(orderToUpdate.status || "pending")}`}>
                    {(orderToUpdate.status || "pending").charAt(0).toUpperCase() + (orderToUpdate.status || "pending").slice(1)}
                  </span>
                </p>
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    New Status
                  </label>
                  <FilterDropdown
                    options={statusFilterOptions.filter((opt) => opt.value !== "all")}
                    value={newStatus}
                    onChange={setNewStatus}
                    placeholder="Select Status"
                    label=""
                    disabled={updating[orderToUpdate._id]}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-border-light dark:border-border-dark px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeUpdateStatusModal}
                className="px-6 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[12px] text-sm font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                disabled={updating[orderToUpdate._id]}
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 flex items-center gap-2"
                disabled={updating[orderToUpdate._id] || !newStatus || newStatus === orderToUpdate.status}
              >
                {updating[orderToUpdate._id] ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </button>
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
