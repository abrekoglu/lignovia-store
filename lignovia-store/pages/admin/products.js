import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";

export default function AdminProducts() {
  // All hooks must be called unconditionally at the top level
  const { data: session, status } = useSession();
  const router = useRouter();
  
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");

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

  // Fetch all products function (defined before useEffect so it can be reused)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError("Error fetching products: " + err.message);
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
        setError("");
        setSuccess("");
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

    return true;
  });

  // Early returns after all hooks are declared
  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }


  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      } else if (type === "number") {
        // For number inputs, convert to number or 0 if empty
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
    setError("");
    setSuccess("");

    try {
      // Ensure stock is a number, not a string
      // Explicitly convert stock to number, defaulting to 0 if invalid
      const stockValue = formData.stock !== undefined && formData.stock !== null 
        ? Number(formData.stock) 
        : 0;
      
      // Validate stock is a valid number
      if (isNaN(stockValue) || stockValue < 0) {
        setError("Stock quantity must be a valid number greater than or equal to 0");
        return;
      }

      const submitData = {
        ...formData,
        price: Number(formData.price),
        stock: stockValue,
      };

      // Log for debugging (remove in production)
      console.log("Submitting product data:", submitData);

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
        setSuccess(
          editingProduct ? "Product updated successfully!" : "Product created successfully!"
        );
        setFormData({
          name: "",
          description: "",
          price: "",
          image: "",
          slug: "",
          inStock: true,
          stock: 0,
        });
        setEditingProduct(null);
        setIsModalOpen(false);
        fetchProducts();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to save product");
      }
    } catch (err) {
      setError("Error saving product: " + err.message);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Product deleted successfully!");
        fetchProducts();
      } else {
        setError(data.error || "Failed to delete product");
      }
    } catch (err) {
      setError("Error deleting product: " + err.message);
    }
  };

  // Handle new product button click
  const handleNewProduct = () => {
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
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  // Handle edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price !== undefined ? product.price : "",
      image: product.image || "",
      slug: product.slug || "",
      inStock: product.inStock !== undefined ? product.inStock : true,
      stock: product.stock !== undefined && product.stock !== null ? Number(product.stock) : 0,
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
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
    setError("");
    setSuccess("");
  };

  const getStockColor = (stock) => {
    if (stock === 0) {
      return "text-text-secondary-light dark:text-text-secondary-dark opacity-50";
    } else if (stock < 10) {
      return "text-error-light dark:text-error-dark";
    } else {
      return "text-text-primary-light dark:text-text-primary-dark";
    }
  };

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
            {session?.user && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Manage your product catalog
              </p>
            )}
          </div>
            {/* Search, Filter, and New Product Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="input flex-1 lg:min-w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="min-w-[120px]"
              >
                <option value="all">All Stock</option>
                <option value="in">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="min-w-[120px]"
              >
                <option value="all">All</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
              <button
                onClick={handleNewProduct}
                className="btn-primary whitespace-nowrap"
              >
                + New Product
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="card border-success-light dark:border-success-dark bg-success-light/10 dark:bg-success-dark/10 p-4 mb-6">
            <p className="text-success-light dark:text-success-dark text-sm font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
            <p className="text-error-light dark:text-error-dark text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="card p-12 text-center">
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
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
              {products.length === 0 ? "No products found." : "No products match your filters."}
            </p>
            {products.length === 0 && (
              <button
                onClick={handleNewProduct}
                className="btn-primary"
              >
                Add New Product
              </button>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                <thead className="bg-hover-light dark:bg-hover-dark">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-16 h-16 rounded-soft border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Name and Description */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate mt-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          {product.slug || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-accent">
                          ${product.price?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStockColor(product.stock || 0)}`}>
                          {product.stock !== undefined ? product.stock : 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`badge border rounded-full px-3 py-1 ${
                            product.inStock
                              ? "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border-success-light/30 dark:border-success-dark/30"
                              : "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30"
                          }`}
                        >
                          {product.inStock ? "In Stock" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => window.open(`/product/${product.slug}`, "_blank")}
                            className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
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
                            onClick={() => handleEdit(product)}
                            className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
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
                            onClick={() => handleDelete(product._id)}
                            className="text-error-light dark:text-error-dark hover:opacity-70 transition-opacity duration-200 p-1.5"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
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
              className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto my-auto"
              onClick={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{ overscrollBehavior: 'contain' }}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h2>
                <button
                  onClick={handleCloseModal}
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
              <div className="p-6">
                {/* Success/Error Messages */}
                {success && (
                  <div className="card border-success-light dark:border-success-dark bg-success-light/10 dark:bg-success-dark/10 p-4 mb-6">
                    <p className="text-success-light dark:text-success-dark text-sm font-medium">{success}</p>
                  </div>
                )}
                {error && (
                  <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
                    <p className="text-error-light dark:text-error-dark text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Slug *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Price *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Image URL
                      </label>
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="input resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="inStock"
                        id="inStock"
                        checked={formData.inStock}
                        onChange={handleChange}
                        className="h-4 w-4 text-accent focus:ring-accent border-border-light dark:border-border-dark rounded cursor-pointer"
                      />
                      <label htmlFor="inStock" className="ml-3 text-sm text-text-primary-light dark:text-text-primary-dark cursor-pointer">
                        In Stock
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock !== undefined && formData.stock !== null ? formData.stock : 0}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1"
                        className="input"
                      />
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        Current available inventory
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn-secondary w-full sm:w-auto"
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
