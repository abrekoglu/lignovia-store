import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import SkeletonProductCard from "@/components/SkeletonProductCard";
import { formatPrice, formatPriceAmount } from "@/utils/priceUtils";

export default function SearchPage({ initialData, error: initialError }) {
  const router = useRouter();
  const { q, page: queryPage, sort: querySort } = router.query;

  // Initialize search query from router query param or empty string
  const initialQuery = q ? String(q).trim() : "";
  
  const [searchData, setSearchData] = useState(initialData);
  // Set loading to false if we have initialData, otherwise true if we have a query
  const [loading, setLoading] = useState(initialData ? false : (initialQuery.length >= 2));
  const [error, setError] = useState(initialError);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  // Filter states
  const [page, setPage] = useState(queryPage ? parseInt(queryPage) : 1);
  const [sort, setSort] = useState(querySort || "relevance");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount detection for SSR
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setShowFilters(true);
    }
  }, []);

  // Update search query from URL when router is ready
  useEffect(() => {
    if (router.isReady && router.query.q) {
      const queryFromUrl = String(router.query.q).trim();
      if (queryFromUrl !== searchQuery) {
        setSearchQuery(queryFromUrl);
      }
    }
    if (router.isReady && router.query.page) {
      const pageNum = parseInt(router.query.page) || 1;
      if (pageNum !== page) {
        setPage(pageNum);
      }
    }
    if (router.isReady && router.query.sort) {
      const sortValue = String(router.query.sort);
      if (sortValue !== sort) {
        setSort(sortValue);
      }
    }
  }, [router.isReady, router.query]);

  // Fetch search results when filters change
  useEffect(() => {
    // Determine the query to use - prioritize router.query.q if available, else use searchQuery state
    // router.query.q should be available even if router.isReady is false (during SSR/hydration)
    const urlQuery = router.query.q ? String(router.query.q).trim() : "";
    const stateQuery = searchQuery?.trim() || "";
    const finalQuery = urlQuery || stateQuery;

    // If no valid query, clear data only if we're certain there's no query
    if (!finalQuery || finalQuery.length < 2) {
      if (router.isReady && !urlQuery && !stateQuery) {
        setSearchData(null);
        setLoading(false);
      }
      return;
    }

    // If we have initialData from SSR and it matches the query, use it initially to avoid unnecessary fetch
    const filtersChanged = page !== 1 || sort !== "relevance" || minPrice || maxPrice || selectedCategory || inStockOnly;
    if (initialData && initialData.products && urlQuery && urlQuery === finalQuery && !filtersChanged && !searchData) {
      setSearchData(initialData);
      setLoading(false);
      return; // Use SSR data, don't fetch again
    }

    // Fetch results - always fetch if we have a query (don't wait for router.isReady)
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          q: finalQuery,
          page: page.toString(),
          limit: "24",
          sort: sort,
        });

        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (selectedCategory) params.append("category", selectedCategory);
        if (inStockOnly) params.append("inStock", "true");

        const response = await fetch(`/api/search?${params.toString()}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSearchData(result.data);
          setError(null);
        } else {
          setError(result.error || "Search failed");
          setSearchData(null);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to load search results");
        setSearchData(null);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch if we have a query - router.query should be available
    fetchSearchResults();
  }, [router.query.q, searchQuery, page, sort, minPrice, maxPrice, selectedCategory, inStockOnly]);

  // Update URL when filters change
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length >= 2) {
      const params = new URLSearchParams({
        q: searchQuery,
      });
      if (page > 1) params.append("page", page.toString());
      if (sort !== "relevance") params.append("sort", sort);

      router.push(`/search?${params}`, undefined, { shallow: true });
    }
  }, [page, sort, searchQuery]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const handlePriceFilter = () => {
    handleFilterChange();
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    handleFilterChange();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    handleFilterChange();
  };

  const handleInStockToggle = () => {
    setInStockOnly(!inStockOnly);
    handleFilterChange();
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
    setInStockOnly(false);
    setSort("relevance");
    setPage(1);
  };

  const hasActiveFilters = minPrice || maxPrice || selectedCategory || inStockOnly;

  if (!mounted) {
    return null;
  }

  // Determine the actual search query from router or state
  // Priority: router.query.q > searchQuery state > initialData query > empty
  const urlQuery = router.query.q ? String(router.query.q).trim() : "";
  const stateQuery = searchQuery?.trim() || "";
  const actualQuery = urlQuery || stateQuery || "";
  
  // No search query provided - show empty state only if:
  // - Query is truly empty (no q in URL and no query in state) AND
  // - We don't have search data AND
  // - We're not loading
  // Don't require router.isReady - router.query should be available during hydration
  const shouldShowEmptyState = (!actualQuery || actualQuery.length < 2) && !searchData && !loading;
  
  if (shouldShowEmptyState) {
    return (
      <Layout containerClassName="py-6 md:py-8 lg:py-12">
        <Head>
          <title>Search - LIGNOVIA</title>
          <meta name="description" content="Search for products on LIGNOVIA" />
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Search Products
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
              Enter a search term to find products.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout containerClassName="py-6 md:py-8 lg:py-12">
      <Head>
        <title>Search: {actualQuery} | LIGNOVIA</title>
        <meta
          name="description"
          content={`Search results for "${actualQuery}" on LIGNOVIA. ${
            searchData?.total || 0
          } products found.`}
        />
        <meta property="og:title" content={`Search: ${actualQuery} | LIGNOVIA`} />
        <meta
          property="og:description"
          content={`Find ${searchData?.total || 0} products matching "${actualQuery}"`}
        />
        <link rel="canonical" href={`${typeof window !== "undefined" ? window.location.origin : ""}/search?q=${encodeURIComponent(actualQuery)}`} />
      </Head>

      {/* Search Header */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">
          Search results for: &quot;{actualQuery}&quot;
        </h1>
        {!loading && searchData && (
          <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark">
            {searchData.total} {searchData.total === 1 ? "product" : "products"} found
            {searchData.matchedCategories && searchData.matchedCategories.length > 0 && (
              <span className="ml-2">
                in {searchData.matchedCategories.length}{" "}
                {searchData.matchedCategories.length === 1 ? "category" : "categories"}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Filters & Sort Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 flex items-center gap-2"
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
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
            />
          </svg>
          Filters
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-4">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark whitespace-nowrap"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={handleSortChange}
            className="px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            <option value="relevance">Relevance</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside
          className={`w-full md:w-64 flex-shrink-0 ${showFilters ? "block" : "hidden"} md:block`}
        >
          <div className="card p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark">
              Filters
            </h3>

            {/* Price Range */}
            <div className="mb-6">
              <label
                htmlFor="minPrice"
                className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
              >
                Price Range
              </label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="number"
                  id="minPrice"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    handlePriceFilter();
                  }}
                  placeholder="Min"
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <span>-</span>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    handlePriceFilter();
                  }}
                  placeholder="Max"
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              {searchData?.priceRange && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  {formatPriceAmount(searchData.priceRange.min)} -{" "}
                  {formatPriceAmount(searchData.priceRange.max)}
                </p>
              )}
            </div>

            {/* Category Filter */}
            {searchData?.matchedCategories && searchData.matchedCategories.length > 0 && (
              <div className="mb-6">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">All Categories</option>
                  {searchData.matchedCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* In Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={handleInStockToggle}
                  className="w-5 h-5 rounded-[6px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-accent focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  In Stock Only
                </span>
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {error ? (
            <div className="card p-6 mb-6 bg-error-light/10 dark:bg-error-dark/10 border border-error-light/30 dark:border-error-dark/30">
              <p className="font-medium text-error-light dark:text-error-dark">
                Error: {error}
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : searchData && searchData.products && searchData.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {searchData.products.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {searchData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>

                  {Array.from({ length: searchData.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first, last, current, and pages around current
                      return (
                        p === 1 ||
                        p === searchData.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                      );
                    })
                    .map((p, index, array) => {
                      // Add ellipsis between non-consecutive pages
                      const prev = array[index - 1];
                      const showEllipsis = prev && p - prev > 1;

                      return (
                        <div key={p} className="flex items-center gap-2">
                          {showEllipsis && (
                            <span className="text-text-secondary-light dark:text-text-secondary-dark">
                              ...
                            </span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark transition-all duration-200 ${
                              page === p
                                ? "bg-accent text-white border-accent"
                                : "bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}

                  <button
                    onClick={() => setPage(Math.min(searchData.totalPages, page + 1))}
                    disabled={page === searchData.totalPages}
                    className="px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 md:p-16 text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <p className="text-body-lg mb-2 text-text-primary-light dark:text-text-primary-dark">
                No products match your search.
              </p>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                Try adjusting your filters or searching for different keywords.
              </p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 rounded-[12px] bg-accent text-white hover:bg-accent/90 transition-all duration-200"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    const { q, page = "1", limit = "24", sort = "relevance", minPrice, maxPrice, category, inStock } = context.query;

    if (!q || q.trim().length < 2) {
      return {
        props: {
          initialData: null,
          error: null,
        },
      };
    }

    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const params = new URLSearchParams({
      q: String(q).trim(),
      page: String(page),
      limit: String(limit),
      sort: String(sort),
    });

    if (minPrice) params.append("minPrice", String(minPrice));
    if (maxPrice) params.append("maxPrice", String(maxPrice));
    if (category) params.append("category", String(category));
    if (inStock === "true") params.append("inStock", "true");

    const response = await fetch(`${baseUrl}/api/search?${params}`);
    const data = await response.json();

    if (!data.success) {
      return {
        props: {
          initialData: null,
          error: data.error || "Search failed",
        },
      };
    }

    return {
      props: {
        initialData: data.data || null,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error in search page SSR:", error);
    return {
      props: {
        initialData: null,
        error: error.message || "An error occurred while searching",
      },
    };
  }
}

