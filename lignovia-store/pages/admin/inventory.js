import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default function AdminInventory({ products, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stockFilter, setStockFilter] = useState("all");

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

  // Filter products by stock
  const filteredProducts = products?.filter((product) => {
    const stock = product.stock || 0;
    if (stockFilter === "low") {
      return stock > 0 && stock < 10;
    } else if (stockFilter === "out") {
      return stock === 0;
    } else if (stockFilter === "sufficient") {
      return stock >= 10;
    }
    return true;
  }) || [];

  // Calculate statistics
  const totalProducts = products?.length || 0;
  const lowStockCount = products?.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) < 10).length || 0;
  const outOfStockCount = products?.filter((p) => (p.stock || 0) === 0).length || 0;
  const sufficientStockCount = products?.filter((p) => (p.stock || 0) >= 10).length || 0;
  const totalStockValue = products?.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0) || 0;

  const getStockColor = (stock) => {
    if (stock === 0) {
      return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark";
    } else if (stock < 10) {
      return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark";
    } else {
      return "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark";
    }
  };

  const getStockBarWidth = (stock, maxStock = 100) => {
    const percentage = Math.min((stock / maxStock) * 100, 100);
    return `${percentage}%`;
  };

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
          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="min-w-[150px]"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="sufficient">Sufficient Stock</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
          <p className="text-error-light dark:text-error-dark text-sm font-medium">Error loading inventory: {error}</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Total Products
              </div>
              <div className="text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                {totalProducts}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Low Stock
              </div>
              <div className="text-3xl font-semibold text-error-light dark:text-error-dark">
                {lowStockCount}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Out of Stock
              </div>
              <div className="text-3xl font-semibold text-error-light dark:text-error-dark">
                {outOfStockCount}
              </div>
            </div>
            <div className="card p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Total Stock Value
              </div>
              <div className="text-3xl font-semibold text-accent">
                ${totalStockValue.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Restock Alert */}
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <div className="card border-accent bg-accent/10 dark:bg-accent/10 p-4 mb-8">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Restock Needed: {lowStockCount + outOfStockCount} product{lowStockCount + outOfStockCount !== 1 ? "s" : ""} {lowStockCount + outOfStockCount === 1 ? "requires" : "require"} immediate attention
                  </p>
                </div>
                <Link href="/admin/products" className="btn-text text-sm">
                  Manage Products
                </Link>
              </div>
            </div>
          )}

          {/* Inventory List */}
          {filteredProducts.length === 0 ? (
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
                No products match your filter.
              </p>
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
                        Stock Level
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
                    {filteredProducts.map((product) => {
                      const stock = product.stock || 0;
                      const maxStock = Math.max(...(products?.map((p) => p.stock || 0) || [0]), 100);
                      return (
                        <tr
                          key={product._id}
                          className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-soft border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                                  {product.name}
                                </p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                  ${product.price?.toFixed(2) || "0.00"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-text-primary-light dark:text-text-primary-dark font-medium">
                                  {stock} units
                                </span>
                              </div>
                              <div className="w-full bg-border-light dark:bg-border-dark rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    stock === 0
                                      ? "bg-error-light dark:bg-error-dark"
                                      : stock < 10
                                      ? "bg-error-light dark:bg-error-dark"
                                      : "bg-success-light dark:bg-success-dark"
                                  }`}
                                  style={{ width: getStockBarWidth(stock, maxStock) }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`badge border rounded-full px-3 py-1 ${getStockColor(stock)}`}>
                              {stock === 0 ? "Out of Stock" : stock < 10 ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link
                              href="/admin/products"
                              className="btn-text text-sm"
                            >
                              Restock
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
    await connectDB();

    const products = await Product.find({}).lean();

    return {
      props: {
        products: JSON.parse(JSON.stringify(products.map((p) => ({
          _id: p._id.toString(),
          name: p.name,
          price: p.price,
          stock: p.stock || 0,
          image: p.image || null,
        })))),
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

