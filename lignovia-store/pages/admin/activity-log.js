import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import { Table } from "@/components/table";
import ActivityLogDetailPanel from "@/components/activity-log/ActivityLogDetailPanel";
import ActivityLogEmptyState from "@/components/activity-log/ActivityLogEmptyState";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { useToast } from "@/contexts/ToastContext";

export default function AdminActivityLog() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, product, order, user, security, inventory
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/activity-log");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch activities
  useEffect(() => {
    fetchActivities();
  }, [filter, searchQuery, dateRange, sortColumn, sortDirection, currentPage, pageSize]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch activities
      // const response = await fetch(`/api/admin/activity-log?filter=${filter}&search=${searchQuery}&startDate=${dateRange.start}&endDate=${dateRange.end}&sort=${sortColumn}&direction=${sortDirection}&page=${currentPage}&pageSize=${pageSize}`);
      // const data = await response.json();

      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock activities data
      const mockActivities = [
        {
          id: "1",
          timestamp: new Date(),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "product_edit",
          actionLabel: "Updated Product",
          details: "Product 'Wooden Table' - Price: $199.99 → $179.99",
          category: "product",
          ipAddress: "192.168.1.1",
          deviceInfo: "Chrome on Windows",
          metadata: {
            productId: "123",
            productName: "Wooden Table",
            changes: {
              price: { old: 199.99, new: 179.99 },
            },
          },
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 3600000),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "order_update",
          actionLabel: "Updated Order Status",
          details: "Order #12345 - Status: Pending → Shipped",
          category: "order",
          ipAddress: "192.168.1.1",
          deviceInfo: "Chrome on Windows",
          metadata: {
            orderId: "12345",
            changes: {
              status: { old: "pending", new: "shipped" },
            },
          },
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 7200000),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "product_delete",
          actionLabel: "Deleted Product",
          details: "Product 'Old Chair' was permanently deleted",
          category: "product",
          ipAddress: "192.168.1.1",
          deviceInfo: "Chrome on Windows",
          metadata: {
            productId: "456",
            productName: "Old Chair",
          },
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 86400000),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "user_edit",
          actionLabel: "Updated User",
          details: "User 'john@example.com' - Role: Customer → Admin",
          category: "user",
          ipAddress: "192.168.1.1",
          deviceInfo: "Chrome on Windows",
          metadata: {
            userId: "789",
            changes: {
              role: { old: "customer", new: "admin" },
            },
          },
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 172800000),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "security_login",
          actionLabel: "Admin Login",
          details: "Successful login from new device",
          category: "security",
          ipAddress: "192.168.1.100",
          deviceInfo: "Safari on macOS",
          metadata: {
            loginType: "credentials",
            success: true,
          },
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 259200000),
          adminUser: {
            name: "Admin User",
            email: "admin@example.com",
            avatar: null,
          },
          actionType: "inventory_adjust",
          actionLabel: "Adjusted Inventory",
          details: "Product 'Wooden Table' - Stock: 10 → 15",
          category: "inventory",
          ipAddress: "192.168.1.1",
          deviceInfo: "Chrome on Windows",
          metadata: {
            productId: "123",
            productName: "Wooden Table",
            changes: {
              stock: { old: 10, new: 15 },
            },
          },
        },
      ];

      // Filter activities
      let filtered = mockActivities;
      if (filter !== "all") {
        filtered = mockActivities.filter((a) => a.category === filter);
      }

      // Search activities
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.actionLabel.toLowerCase().includes(query) ||
            a.details.toLowerCase().includes(query) ||
            a.adminUser.name.toLowerCase().includes(query) ||
            a.adminUser.email.toLowerCase().includes(query)
        );
      }

      // Date range filter
      if (dateRange.start || dateRange.end) {
        filtered = filtered.filter((a) => {
          const activityDate = new Date(a.timestamp);
          if (dateRange.start) {
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            if (activityDate < startDate) return false;
          }
          if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (activityDate > endDate) return false;
          }
          return true;
        });
      }

      // Sort activities
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (sortColumn) {
          case "timestamp":
            aValue = new Date(a.timestamp).getTime();
            bValue = new Date(b.timestamp).getTime();
            break;
          case "adminUser":
            aValue = a.adminUser.name || a.adminUser.email || "";
            bValue = b.adminUser.name || b.adminUser.email || "";
            break;
          case "actionType":
            aValue = a.actionLabel || "";
            bValue = b.actionLabel || "";
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

      setActivities(filtered);
    } catch (error) {
      toastError("Failed to load activity log: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort
  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Handle row click
  const handleRowClick = (activity) => {
    setSelectedActivity(activity);
    setIsDetailPanelOpen(true);
  };

  // Get action type color
  const getActionTypeColor = (actionType) => {
    if (actionType.includes("delete")) {
      return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark";
    }
    if (actionType.includes("security")) {
      return "bg-accent/20 dark:bg-accent/30 text-accent";
    }
    if (actionType.includes("product")) {
      return "bg-accent/20 dark:bg-accent/30 text-accent";
    }
    return "bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark";
  };

  // Get action type icon
  const getActionTypeIcon = (actionType) => {
    const iconClass = "w-4 h-4";
    if (actionType.includes("delete")) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    }
    if (actionType.includes("security")) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    }
    if (actionType.includes("product")) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      );
    }
    if (actionType.includes("order")) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h1.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H7.5a.75.75 0 00-.75.75v2.25zm6 0a.75.75 0 01-.75-.75V8.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 01.75-.75z" />
        </svg>
      );
    }
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Table columns configuration
  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      sortable: true,
      width: 180,
      render: (row) => {
        const date = new Date(row.timestamp);
        return (
          <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {date.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        );
      },
    },
    {
      key: "adminUser",
      label: "Admin User",
      sortable: true,
      width: 200,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.adminUser.avatar ? (
            <img
              src={row.adminUser.avatar}
              alt={row.adminUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-accent">
                {row.adminUser.name?.charAt(0).toUpperCase() || "A"}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              {row.adminUser.name || "Admin"}
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {row.adminUser.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "actionType",
      label: "Action Type",
      sortable: true,
      width: 200,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-[8px] ${getActionTypeColor(row.actionType)}`}>
            {getActionTypeIcon(row.actionType)}
          </div>
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.actionLabel}
          </span>
        </div>
      ),
    },
    {
      key: "details",
      label: "Details",
      sortable: false,
      width: 300,
      render: (row) => (
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
          {row.details}
        </p>
      ),
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: false,
      width: 150,
      render: (row) => (
        <span className="text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark">
          {row.ipAddress}
        </span>
      ),
    },
    {
      key: "deviceInfo",
      label: "Device",
      sortable: false,
      width: 180,
      render: (row) => (
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {row.deviceInfo}
        </span>
      ),
    },
  ];

  // Filter options
  const filterOptions = [
    { value: "all", label: "All Activities" },
    { value: "product", label: "Products" },
    { value: "order", label: "Orders" },
    { value: "user", label: "Users" },
    { value: "security", label: "Security" },
    { value: "inventory", label: "Inventory" },
  ];

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Activity Log - LIGNOVIA Admin</title>
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
        <title>Activity Log - LIGNOVIA Admin</title>
        <meta name="description" content="View admin activity and audit log" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Activity Log
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              View and track all admin activities and changes
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
                placeholder="Search activities..."
                className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-auto min-w-[180px]">
              <FilterDropdown
                options={filterOptions}
                value={filter}
                onChange={setFilter}
                placeholder="All Activities"
                label=""
              />
            </div>

            {/* Date Range Picker - Simplified */}
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateRange.start || ""}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                className="px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.end || ""}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                min={dateRange.start || undefined}
                className="px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Table */}
      <Table
        columns={columns}
        data={activities}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onRowClick={handleRowClick}
        pagination={true}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={activities.length}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        sortable={true}
        resizable={true}
        stickyHeader={true}
        loading={loading}
        emptyStateTitle="No activity recorded"
        emptyStateDescription="Try adjusting your filters or check back later."
        emptyStateIcon={
          <svg className="w-16 h-16 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        }
      />

      {/* Activity Detail Panel */}
      <ActivityLogDetailPanel
        isOpen={isDetailPanelOpen}
        onClose={() => setIsDetailPanelOpen(false)}
        activity={selectedActivity}
      />
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

