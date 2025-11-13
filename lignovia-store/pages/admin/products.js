import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import AdminLayout from "@/components/AdminLayout";
import { Table } from "@/components/table";
import SkeletonTable from "@/components/SkeletonTable";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { FilterChips } from "@/components/filters/FilterChip";
import DateRangePicker from "@/components/filters/DateRangePicker";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const { confirm } = useConfirmDialog();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    slug: "",
    inStock: true,
    stock: 0,
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/products");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch all products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        toastError("Failed to fetch products");
      }
    } catch (err) {
      toastError("Error fetching products: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isModalOpen]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesSlug = product.slug?.toLowerCase().includes(query);
      const matchesDescription = product.description?.toLowerCase().includes(query);
      if (!matchesName && !matchesSlug && !matchesDescription) {
        return false;
      }
    }

    // Stock filter
    if (stockFilter === "low") {
      if ((product.stock || 0) >= 10 || (product.stock || 0) === 0) {
        return false;
      }
    } else if (stockFilter === "out") {
      if ((product.stock || 0) > 0) {
        return false;
      }
    } else if (stockFilter === "in") {
      if ((product.stock || 0) === 0) {
        return false;
      }
    }

    // Visibility filter
    if (visibilityFilter === "visible") {
      if (!product.inStock) {
        return false;
      }
    } else if (visibilityFilter === "hidden") {
      if (product.inStock) {
        return false;
      }
    }

    // Date range filter (skip if products don't have createdAt field)
    if ((dateRange.start || dateRange.end) && product.createdAt) {
      const productDate = new Date(product.createdAt);
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
  });

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
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "stock":
          aValue = a.stock || 0;
          bValue = b.stock || 0;
          break;
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      } else if (type === "number") {
        const numValue = value === "" ? 0 : Number(value);
        return { ...prev, [name]: isNaN(numValue) ? 0 : numValue };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const stockValue = formData.stock !== undefined && formData.stock !== null
        ? Number(formData.stock)
        : 0;

      if (isNaN(stockValue) || stockValue < 0) {
        toastError("Stock quantity must be a valid number greater than or equal to 0");
        return;
      }

      const submitData = {
        ...formData,
        price: Number(formData.price),
        stock: stockValue,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess(
          editingProduct ? "Product updated successfully!" : "Product created successfully!"
        );
        handleCloseModal();
        fetchProducts();
      } else {
        toastError(data.error || "Failed to save product");
      }
    } catch (err) {
      toastError("Error saving product: " + err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Delete Product?",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toastSuccess("Product deleted successfully!");
        fetchProducts();
      } else {
        toastError(data.error || "Failed to delete product");
      }
    } catch (err) {
      toastError("Error deleting product: " + err.message);
    }
  };

  // Handle new product button click
  const handleNewProduct = () => {
    router.push("/admin/products/new");
  };

  // Handle edit
  const handleEdit = (product) => {
    router.push(`/admin/products/${product._id}`);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      slug: "",
      inStock: true,
      stock: 0,
    });
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

  // Get visibility status chip
  const getVisibilityStatusChip = (inStock) => {
    if (inStock) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border border-success-light/30 dark:border-success-dark/30">
          Published
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
          Unpublished
        </span>
      );
    }
  };

  // Active filters for chips
  const activeFilters = [];
  if (stockFilter !== "all") {
    activeFilters.push({
      id: "stock",
      label: `Stock: ${stockFilter === "in" ? "In Stock" : stockFilter === "low" ? "Low Stock" : "Out of Stock"}`,
      onRemove: () => setStockFilter("all"),
    });
  }
  if (visibilityFilter !== "all") {
    activeFilters.push({
      id: "visibility",
      label: `Visibility: ${visibilityFilter === "visible" ? "Published" : "Unpublished"}`,
      onRemove: () => setVisibilityFilter("all"),
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
    setVisibilityFilter("all");
    setDateRange({ start: null, end: null });
    setSearchQuery("");
  };

  // Filter options
  const stockFilterOptions = [
    { value: "all", label: "All Stock" },
    { value: "in", label: "In Stock" },
    { value: "low", label: "Low Stock" },
    { value: "out", label: "Out of Stock" },
  ];

  const visibilityFilterOptions = [
    { value: "all", label: "All" },
    { value: "visible", label: "Published" },
    { value: "hidden", label: "Unpublished" },
  ];

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
          {/* Name and Description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
              {row.name}
            </p>
            {row.description && (
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate mt-0.5 line-clamp-1">
                {row.description}
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
      key: "price",
      label: "Price",
      sortable: true,
      width: 120,
      render: (row) => (
        <span className="text-sm font-semibold text-accent">
          ${row.price?.toFixed(2) || "0.00"}
        </span>
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
      key: "status",
      label: "Status",
      sortable: false,
      width: 140,
      render: (row) => getVisibilityStatusChip(row.inStock),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      width: 140,
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* View Button */}
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
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
            aria-label="Edit product"
            title="Edit product"
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
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row._id);
            }}
            className="p-2 rounded-[10px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/20 transition-all duration-200"
            aria-label="Delete product"
            title="Delete product"
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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
          <title>Products - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Products
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Manage your product catalog
          </p>
        </div>
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
        <title>Products - LIGNOVIA Admin</title>
        <meta name="description" content="Manage products" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Products
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Manage your product catalog
            </p>
          </div>

          {/* Create Product Button */}
          <button
            onClick={handleNewProduct}
            className="px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Product
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
              placeholder="Search products..."
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

          {/* Visibility Filter */}
          <div className="w-full lg:w-auto min-w-[160px]">
            <FilterDropdown
              options={visibilityFilterOptions}
              value={visibilityFilter}
              onChange={setVisibilityFilter}
              placeholder="All"
              label=""
            />
          </div>

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

      {/* Products Table */}
      {loading ? (
        <SkeletonTable rows={8} columns={5} showThumbnail={true} />
      ) : (
        <Table
          columns={columns}
          data={paginatedProducts}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onRowClick={(row) => handleEdit(row)}
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
          emptyStateTitle="No products found"
          emptyStateDescription={
            products.length === 0
              ? "No products have been created yet."
              : "No products match your search criteria or filters."
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
            products.length === 0
              ? {
                  onClick: handleNewProduct,
                  label: "Add New Product",
                }
              : null
          }
        />
      )}

      {/* Product Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div
            className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto"
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
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Image Preview */}
                {formData.image && (
                  <div className="flex justify-center">
                    <div className="w-32 h-32 rounded-[14px] border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark">
                      <Image
                        src={formData.image}
                        alt="Product preview"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Name <span className="text-error-light dark:text-error-dark">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      placeholder="Product name"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Slug <span className="text-error-light dark:text-error-dark">*</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      placeholder="product-slug"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Price <span className="text-error-light dark:text-error-dark">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark">$</span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Stock Quantity <span className="text-error-light dark:text-error-dark">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock !== undefined && formData.stock !== null ? formData.stock : 0}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1"
                      className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      placeholder="0"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
                      placeholder="Product description"
                    />
                  </div>

                  {/* In Stock Toggle */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
                      <input
                        type="checkbox"
                        name="inStock"
                        id="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className=""
                      />
                      <label htmlFor="inStock" className="flex-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark cursor-pointer">
                        Product is published and available for purchase
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
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

  // Access granted - return empty props (page fetches data client-side)
  return {
    props: {},
  };
}
