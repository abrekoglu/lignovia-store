import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { Table } from "@/components/table";
import SkeletonTable from "@/components/SkeletonTable";
import SkeletonCard from "@/components/SkeletonCard";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { FilterChips } from "@/components/filters/FilterChip";
import DateRangePicker from "@/components/filters/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default function AdminInventory({ products, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const { confirm } = useConfirmDialog();

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustStockData, setAdjustStockData] = useState({
    adjustment: "",
    reason: "",
    notes: "",
  });

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/inventory");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Filter products
  const filteredProducts = products?.filter((product) => {
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesSlug = product.slug?.toLowerCase().includes(query);
      const matchesSKU = product.sku?.toLowerCase().includes(query);
      if (!matchesName && !matchesSlug && !matchesSKU) {
        return false;
      }
    }

    // Stock filter
    const stock = product.stock || 0;
    if (stockFilter === "low") {
      if (stock === 0 || stock >= 10) return false;
    } else if (stockFilter === "out") {
      if (stock > 0) return false;
    } else if (stockFilter === "sufficient") {
      if (stock < 10) return false;
    }

    // Category filter (if products have category field)
    if (categoryFilter !== "all" && product.category) {
      if (product.category !== categoryFilter) return false;
    }

    // Date range filter (if products have updatedAt field)
    if ((dateRange.start || dateRange.end) && product.updatedAt) {
      const productDate = new Date(product.updatedAt);
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (productDate < startDate) return false;
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (productDate > endDate) return false;
      }
    }

    return true;
  }) || [];

  // Sort products
  let sortedProducts = [...filteredProducts];
  if (sortColumn) {
    sortedProducts.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "stock":
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "updatedAt":
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
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
  const totalProducts = sortedProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

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

  // Get stock status chip
  const getStockStatusChip = (stock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border border-error-light/30 dark:border-error-dark/30">
          Out of Stock
        </span>
      );
    } else if (stock < 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 dark:bg-accent/30 text-accent border border-accent/30">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border border-success-light/30 dark:border-success-dark/30">
          In Stock
        </span>
      );
    }
  };

  // Calculate statistics
  const totalProductsCount = products?.length || 0;
  const lowStockCount = products?.filter((p) => {
    const stock = p.stock || 0;
    return stock > 0 && stock < 10;
  }).length || 0;
  const outOfStockCount = products?.filter((p) => (p.stock || 0) === 0).length || 0;
  const sufficientStockCount = products?.filter((p) => (p.stock || 0) >= 10).length || 0;
  const totalStockValue = products?.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0) || 0;

  // Handle adjust stock
  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setAdjustStockData({
      adjustment: "",
      reason: "",
      notes: "",
    });
    setIsAdjustStockModalOpen(true);
  };

  // Handle adjust stock submit
  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) return;

    const adjustment = Number(adjustStockData.adjustment);
    if (isNaN(adjustment) || adjustment === 0) {
      toastError("Please enter a valid stock adjustment");
      return;
    }

    const newStock = (selectedProduct.stock || 0) + adjustment;
    if (newStock < 0) {
      toastError("Stock cannot be negative");
      return;
    }

    try {
      const response = await fetch(`/api/products/${selectedProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: newStock,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess(`Stock adjusted successfully. New stock: ${newStock}`);
        setIsAdjustStockModalOpen(false);
        setSelectedProduct(null);
        setAdjustStockData({
          adjustment: "",
          reason: "",
          notes: "",
        });
        // Reload page to refresh data (using getServerSideProps)
        window.location.reload();
      } else {
        toastError(data.error || "Failed to adjust stock");
      }
    } catch (err) {
      toastError("Error adjusting stock: " + err.message);
    }
  };

  // Handle close adjust stock modal
  const handleCloseAdjustStockModal = () => {
    setIsAdjustStockModalOpen(false);
    setSelectedProduct(null);
    setAdjustStockData({
      adjustment: "",
      reason: "",
      notes: "",
    });
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isAdjustStockModalOpen) {
        handleCloseAdjustStockModal();
      }
    };
    if (isAdjustStockModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isAdjustStockModalOpen]);

  // Active filters for chips
  const activeFilters = [];
  if (stockFilter !== "all") {
    activeFilters.push({
      id: "stock",
      label: `Stock: ${stockFilter === "sufficient" ? "Sufficient" : stockFilter === "low" ? "Low Stock" : "Out of Stock"}`,
      onRemove: () => setStockFilter("all"),
    });
  }
  if (categoryFilter !== "all") {
    activeFilters.push({
      id: "category",
      label: `Category: ${categoryFilter}`,
      onRemove: () => setCategoryFilter("all"),
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

  // Clear all filters
  const handleClearAllFilters = () => {
    setStockFilter("all");
    setCategoryFilter("all");
    setDateRange({ start: null, end: null });
    setSearchQuery("");
  };

  // Filter options
  const stockFilterOptions = [
    { value: "all", label: "All Stock" },
    { value: "sufficient", label: "Sufficient Stock" },
    { value: "low", label: "Low Stock" },
    { value: "out", label: "Out of Stock" },
  ];

  // Get unique categories from products
  const categories = products
    ? Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    : [];
  const categoryFilterOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ];

  // Format date
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
      key: "product",
      label: "Product",
      sortable: false,
      width: 300,
      render: (row) => (
        <div className="flex items-center gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-14 h-14 rounded-[12px] border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark">
            {row.image ? (
              <Image
                src={row.image}
                alt={row.name}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark"
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
            )}
          </div>
          {/* Name and SKU */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
              {row.name}
            </p>
            {row.sku && (
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                SKU: {row.sku}
              </p>
            )}
            {row.slug && (
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                /{row.slug}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      width: 150,
      render: (row) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {row.stock !== undefined ? row.stock : 0}
          </span>
          {getStockStatusChip(row.stock || 0)}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: false,
      width: 150,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {row.category || "—"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      width: 150,
      render: (row) => (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {formatDate(row.updatedAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      width: 180,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Adjust Stock Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdjustStock(row);
            }}
            className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
            aria-label="Adjust stock"
            title="Adjust stock"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>
          {/* View Product Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/product/${row.slug}`, "_blank");
            }}
            className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
            aria-label="View product"
            title="View product"
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
          <title>Inventory - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Inventory
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Monitor stock levels and manage inventory
          </p>
        </div>
        {/* Loading State - Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* Loading State - Table */}
        <SkeletonTable rows={8} columns={5} showThumbnail={true} />
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Inventory - LIGNOVIA Admin</title>
        <meta name="description" content="Manage inventory" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Inventory
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Monitor stock levels and manage inventory
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
              placeholder="Search by name, SKU, or code..."
              className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Stock Filter */}
          <div className="w-full lg:w-auto min-w-[160px]">
            <FilterDropdown
              options={stockFilterOptions}
              value={stockFilter}
              onChange={setStockFilter}
              placeholder="All Stock"
              label=""
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="w-full lg:w-auto min-w-[160px]">
              <FilterDropdown
                options={categoryFilterOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="All Categories"
                label=""
              />
            </div>
          )}

          {/* Date Range Picker */}
          <div className="w-full lg:w-auto">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Last updated"
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
            Error loading inventory: {error}
          </p>
        </div>
      )}

      {/* Statistics Cards */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Total Products
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark">
              {totalProductsCount}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Low Stock
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-semibold text-error-light dark:text-error-dark">
              {lowStockCount}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Out of Stock
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-error-light/20 dark:bg-error-dark/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-error-light dark:text-error-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-semibold text-error-light dark:text-error-dark">
              {outOfStockCount}
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Total Stock Value
              </div>
              <div className="w-10 h-10 rounded-[10px] bg-success-light/20 dark:bg-success-dark/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-success-light dark:text-success-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-semibold text-accent">
              {(() => {
                const { formatPrice } = require("@/utils/priceUtils");
                return formatPrice(totalStockValue);
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Restock Alert */}
      {!error && (lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="card border-accent/50 bg-accent/10 dark:bg-accent/10 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
                Restock Needed
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {lowStockCount + outOfStockCount} product{lowStockCount + outOfStockCount !== 1 ? "s" : ""} {lowStockCount + outOfStockCount === 1 ? "requires" : "require"} immediate attention
              </p>
            </div>
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-accent text-white rounded-[10px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 whitespace-nowrap"
            >
              Manage Products
            </Link>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      {!error && (
        <Table
          columns={columns}
          data={paginatedProducts}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={(row) => handleAdjustStock(row)}
          pagination={true}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalProducts}
          onPageChange={handlePageChange}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          sortable={true}
          resizable={true}
          stickyHeader={true}
          loading={false}
          emptyStateTitle="No inventory items found"
          emptyStateDescription={
            products?.length === 0
              ? "No products have been added to inventory yet."
              : "No inventory items match your search criteria or filters."
          }
          emptyStateIcon={
            <svg className="w-16 h-16 text-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          }
          emptyStateAction={
            products?.length === 0
              ? {
                  onClick: () => router.push("/admin/products"),
                  label: "Add Products",
                }
              : null
          }
        />
      )}

      {/* Adjust Stock Modal */}
      {isAdjustStockModalOpen && selectedProduct && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseAdjustStockModal}
        >
          <div
            className="card max-w-lg w-full max-h-[90vh] overflow-y-auto my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-5 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  Adjust Stock
                </h2>
              </div>
              <button
                onClick={handleCloseAdjustStockModal}
                className="p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-all duration-200"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Product Info */}
              <div className="mb-6 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-4">
                  {selectedProduct.image && (
                    <div className="w-16 h-16 rounded-[10px] border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark">
                      <Image
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      Current Stock: <span className="font-medium">{selectedProduct.stock || 0}</span>
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAdjustStockSubmit} className="space-y-6">
                {/* Stock Adjustment */}
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Stock Adjustment <span className="text-error-light dark:text-error-dark">*</span>
                  </label>
                  <div className="relative">
                    {adjustStockData.adjustment && !isNaN(Number(adjustStockData.adjustment)) && Number(adjustStockData.adjustment) !== 0 && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark font-medium">
                        {Number(adjustStockData.adjustment) > 0 ? "+" : ""}
                      </span>
                    )}
                    <input
                      type="number"
                      required
                      value={adjustStockData.adjustment}
                      onChange={(e) =>
                        setAdjustStockData({
                          ...adjustStockData,
                          adjustment: e.target.value,
                        })
                      }
                      className={`w-full ${adjustStockData.adjustment && !isNaN(Number(adjustStockData.adjustment)) && Number(adjustStockData.adjustment) !== 0 ? "pl-8" : "pl-4"} pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200`}
                      placeholder="Enter adjustment amount"
                    />
                  </div>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                    Enter a positive number to add stock, or a negative number to remove stock.
                  </p>
                  {adjustStockData.adjustment && !isNaN(Number(adjustStockData.adjustment)) && Number(adjustStockData.adjustment) !== 0 && (
                    <div className="mt-3 p-3 bg-hover-light dark:bg-hover-dark rounded-[10px] border border-border-light dark:border-border-dark">
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        New Stock:{" "}
                        <span className="text-accent font-semibold">
                          {Math.max(0, (selectedProduct.stock || 0) + Number(adjustStockData.adjustment))}
                        </span>
                      </p>
                      {(selectedProduct.stock || 0) + Number(adjustStockData.adjustment) < 0 && (
                        <p className="text-xs text-error-light dark:text-error-dark mt-1">
                          Warning: Stock cannot be negative
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={adjustStockData.reason}
                    onChange={(e) =>
                      setAdjustStockData({
                        ...adjustStockData,
                        reason: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                    placeholder="e.g., Restock, Return, Damage"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={adjustStockData.notes}
                    onChange={(e) =>
                      setAdjustStockData({
                        ...adjustStockData,
                        notes: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
                    placeholder="Additional notes about this adjustment"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Adjust Stock
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseAdjustStockModal}
                    className="flex-1 sm:flex-initial px-6 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[12px] text-sm font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
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

  try {
    await connectDB();

    const products = await Product.find({}).lean();

    return {
      props: {
        products: JSON.parse(
          JSON.stringify(
            products.map((p) => ({
              _id: p._id.toString(),
              name: p.name,
              price: p.price,
              stock: p.stock || 0,
              image: p.image || null,
              slug: p.slug || null,
              sku: p.sku || null,
              category: p.category || null,
              updatedAt: p.updatedAt
                ? new Date(p.updatedAt).toISOString()
                : p.createdAt
                ? new Date(p.createdAt).toISOString()
                : null,
            }))
          )
        ),
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return {
      props: {
        products: [],
        error: error.message || "Failed to fetch inventory",
      },
    };
  }
}
