import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import NotificationItem from "@/components/notifications/NotificationItem";
import NotificationEmptyState from "@/components/notifications/NotificationEmptyState";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { useToast } from "@/contexts/ToastContext";

export default function AdminNotifications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, system, orders, inventory, users
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(false);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/notifications");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [filter, searchQuery, currentPage]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch notifications
      // const response = await fetch(`/api/admin/notifications?filter=${filter}&search=${searchQuery}&page=${currentPage}&pageSize=${pageSize}`);
      // const data = await response.json();

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock notifications data
      const mockNotifications = [
        {
          id: "1",
          type: "order",
          title: "New Order Received",
          message: "Order #12345 has been placed by John Doe",
          timestamp: new Date(),
          read: false,
          category: "orders",
        },
        {
          id: "2",
          type: "inventory",
          title: "Low Stock Alert",
          message: "Product 'Wooden Table' is running low (5 items remaining)",
          timestamp: new Date(Date.now() - 3600000),
          read: false,
          category: "inventory",
        },
        {
          id: "3",
          type: "system",
          title: "System Update",
          message: "Your admin panel has been updated to version 2.0",
          timestamp: new Date(Date.now() - 7200000),
          read: true,
          category: "system",
        },
        {
          id: "4",
          type: "customer",
          title: "New Customer Registered",
          message: "Jane Smith has created a new account",
          timestamp: new Date(Date.now() - 86400000),
          read: true,
          category: "users",
        },
        {
          id: "5",
          type: "security",
          title: "Security Alert",
          message: "Unusual login activity detected from a new device",
          timestamp: new Date(Date.now() - 172800000),
          read: false,
          category: "system",
        },
      ];

      // Filter notifications
      let filtered = mockNotifications;
      if (filter !== "all") {
        if (filter === "unread") {
          filtered = mockNotifications.filter((n) => !n.read);
        } else {
          filtered = mockNotifications.filter((n) => n.category === filter);
        }
      }

      // Search notifications
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.title.toLowerCase().includes(query) ||
            n.message.toLowerCase().includes(query)
        );
      }

      setNotifications(filtered);
      setHasMore(false); // Set based on actual API response
    } catch (error) {
      toastError("Failed to load notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      // TODO: Implement API call to mark as read
      // const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
      //   method: "PUT",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      toastSuccess("Notification marked as read");
    } catch (error) {
      toastError("Failed to mark notification as read: " + error.message);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // TODO: Implement API call to mark all as read
      // const response = await fetch("/api/admin/notifications/mark-all-read", {
      //   method: "PUT",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toastSuccess("All notifications marked as read");
    } catch (error) {
      toastError("Failed to mark all notifications as read: " + error.message);
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    try {
      // TODO: Implement API call to delete notification
      // const response = await fetch(`/api/admin/notifications/${notificationId}`, {
      //   method: "DELETE",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 200));

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toastSuccess("Notification deleted");
    } catch (error) {
      toastError("Failed to delete notification: " + error.message);
    }
  };

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Notifications" },
    { value: "unread", label: "Unread" },
    { value: "system", label: "System" },
    { value: "orders", label: "Orders" },
    { value: "inventory", label: "Inventory" },
    { value: "users", label: "Users" },
  ];

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Notifications - LIGNOVIA Admin</title>
        </Head>
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

  return (
    <AdminLayout>
      <Head>
        <title>Notifications Center - LIGNOVIA Admin</title>
        <meta name="description" content="Manage and view all notifications" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Notifications Center
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              View and manage all your notifications
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:flex-initial lg:min-w-[250px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="w-full sm:w-auto min-w-[180px]">
              <FilterDropdown
                options={filterOptions}
                value={filter}
                onChange={setFilter}
                placeholder="All Notifications"
                label=""
              />
            </div>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2.5 bg-accent text-white rounded-[12px] text-sm font-medium hover:bg-accent/90 transition-colors duration-200 whitespace-nowrap"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="card p-5 animate-shimmer"
              style={{ height: "100px" }}
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}

          {/* Load More / Pagination */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-6 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[12px] font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
              >
                Load More
              </button>
            </div>
          )}
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

  // Access granted - session is handled by useSession hook
  return {
    props: {},
  };
}

