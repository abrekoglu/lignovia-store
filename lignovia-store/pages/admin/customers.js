import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import { Table } from "@/components/table";
import SkeletonTable from "@/components/SkeletonTable";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { FilterChips } from "@/components/filters/FilterChip";
import DateRangePicker from "@/components/filters/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export default function AdminCustomers({ customers, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastError } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/customers");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Filter customers
  const filteredCustomers = customers?.filter((customer) => {
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesName = customer.name?.toLowerCase().includes(query);
      const matchesEmail = customer.email?.toLowerCase().includes(query);
      if (!matchesName && !matchesEmail) {
        return false;
      }
    }

    // Date range filter (registration date)
    if (dateRange.start || dateRange.end) {
      const customerDate = customer.createdAt ? new Date(customer.createdAt) : null;
      if (!customerDate) return false;

      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (customerDate < startDate) {
          return false;
        }
      }

      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (customerDate > endDate) {
          return false;
        }
      }
    }

    return true;
  }) || [];

  // Sort customers
  let sortedCustomers = [...filteredCustomers];
  if (sortColumn) {
    sortedCustomers.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        case "totalOrders":
          aValue = a.totalOrders || 0;
          bValue = b.totalOrders || 0;
          break;
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        case "lastOrderDate":
          aValue = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
          bValue = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
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

  // Pagination
  const totalCustomers = sortedCustomers.length;
  const totalPages = Math.ceil(totalCustomers / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active filters for chips
  const activeFilters = [];
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

  // Clear all filters
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setDateRange({ start: null, end: null });
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      width: 200,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
            <span className="text-xs font-semibold text-accent">
              {(row.name || row.email || "A").charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      width: 250,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.email || "N/A"}
        </span>
      ),
    },
    {
      key: "totalOrders",
      label: "Total Orders",
      sortable: true,
      width: 150,
      render: (row) => (
        <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {row.totalOrders || 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registration Date",
      sortable: true,
      width: 180,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "lastOrderDate",
      label: "Last Activity",
      sortable: true,
      width: 180,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {formatDate(row.lastOrderDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      width: 120,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
            aria-label="View profile"
            title="View Profile"
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
      ),
    },
  ];

  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Customers - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Customers
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Manage your customer base
          </p>
        </div>
        <SkeletonTable rows={8} columns={5} />
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Customers - LIGNOVIA Admin</title>
        <meta name="description" content="Manage customers" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Customers
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              View and manage customer accounts
            </p>
          </div>
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
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Range Picker */}
          <div className="w-full lg:w-auto">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Registration date"
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
            Error loading customers: {error}
          </p>
        </div>
      )}

      {/* Customers Table */}
      {!error && (
        <Table
          columns={columns}
          data={paginatedCustomers}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={(row) => {
            // TODO: Navigate to customer detail page
            console.log("View customer:", row);
          }}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalCustomers}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          sortable={true}
          resizable={true}
          stickyHeader={true}
          loading={false}
          emptyStateTitle="No customers found"
          emptyStateDescription={
            customers?.length === 0
              ? "No customers have registered yet."
              : "No customers match your search criteria."
          }
          emptyStateIcon={
            <svg className="w-16 h-16 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
        />
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
    await connectDB();

    // Get all users
    const users = await User.find({}).lean();

    // Get order counts and last order dates for each user
    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: user._id.toString(),
          name: user.name || null,
          email: user.email || null,
          totalOrders: orders.length,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
          lastOrderDate: orders.length > 0 && orders[0].createdAt
            ? new Date(orders[0].createdAt).toISOString()
            : null,
        };
      })
    );

    return {
      props: {
        customers: JSON.parse(JSON.stringify(customers)),
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      props: {
        customers: [],
        error: error.message || "Failed to fetch customers",
      },
    };
  }
}
