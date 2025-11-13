import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import SkeletonProductCard from "@/components/SkeletonProductCard";
import { formatPrice, formatPriceAmount } from "@/utils/priceUtils";

export default function CategoryPage({ category: initialCategory, error: initialError }) {
  const router = useRouter();
  const { slug } = router.query;

  const [category, setCategory] = useState(initialCategory);
  const [loading, setLoading] = useState(!initialCategory);
  const [error, setError] = useState(initialError);

  // Filter states
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mount detection for SSR
  useEffect(() => {
    setMounted(true);
    // Show filters on desktop by default
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setShowFilters(true);
    }
  }, []);

  // Fetch category data if not provided via SSR
  useEffect(() => {
    if (!initialCategory && slug) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            page: page.toString(),
            limit: "24",
            sort: sort,
          });
          if (minPrice) params.append("minPrice", minPrice);
          if (maxPrice) params.append("maxPrice", maxPrice);
          if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
          if (inStockOnly) params.append("inStock", "true");

          const response = await fetch(`/api/category/${slug}?${params}`);
          const result = await response.json();

          if (result.success) {
            setCategory(result.data);
            setError(null);
          } else {
            setError(result.error || "Category not found");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          setError("Failed to load category");
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [slug, initialCategory]);

  // Fetch category when filters change
  useEffect(() => {
    if (!slug || !initialCategory) return;

    const fetchCategoryWithFilters = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "24",
          sort: sort,
        });
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (selectedSubcategory) params.append("subcategory", selectedSubcategory);
        if (inStockOnly) params.append("inStock", "true");

        const response = await fetch(`/api/category/${slug}?${params}`);
        const result = await response.json();

        if (result.success) {
          setCategory(result.data);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryWithFilters();
    router.push(`/category/${slug}?${new URLSearchParams({ page: page.toString(), sort })}`, undefined, { shallow: true });
  }, [page, sort, minPrice, maxPrice, selectedSubcategory, inStockOnly, slug]);

  // Update page from URL query
  useEffect(() => {
    if (router.query.page) {
      setPage(parseInt(router.query.page) || 1);
    }
    if (router.query.sort) {
      setSort(router.query.sort);
    }
  }, [router.query]);

  const handleFilterChange = () => {
    setPage(1); // Reset to first page when filters change
  };

  const handlePriceFilter = () => {
    handleFilterChange();
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(1);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
    handleFilterChange();
  };

  const handleInStockToggle = () => {
    setInStockOnly(!inStockOnly);
    handleFilterChange();
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedSubcategory("");
    setInStockOnly(false);
    setSort("newest");
    setPage(1);
  };

  if (loading && !category) {
    return (
      <Layout containerClassName="py-6 md:py-8 lg:py-12">
        <Head>
          <title>Loading... - LIGNOVIA</title>
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading category...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !category) {
    return (
      <Layout containerClassName="py-6 md:py-8 lg:py-12">
        <Head>
          <title>Category Not Found - LIGNOVIA</title>
        </Head>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Category Not Found
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
              The category you're looking for doesn't exist.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-[12px] bg-accent text-white hover:bg-accent/90 transition-all duration-200"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const hasActiveFilters = minPrice || maxPrice || selectedSubcategory || inStockOnly;

  return (
    <Layout containerClassName="py-6 md:py-8 lg:py-12">
      <Head>
        <title>{category.seoTitle || category.name} - LIGNOVIA</title>
        <meta
          name="description"
          content={category.seoDescription || category.description || `Browse ${category.name} products at LIGNOVIA`}
        />
        {category.seoKeywords && category.seoKeywords.length > 0 && (
          <meta name="keywords" content={category.seoKeywords.join(", ")} />
        )}
        {category.image && <meta property="og:image" content={category.image} />}
      </Head>

      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:text-accent transition-colors duration-200">
              Home
            </Link>
          </li>
          {category.breadcrumb && category.breadcrumb.length > 0 && (
            <>
              {category.breadcrumb.map((crumb) => (
                <li key={crumb._id} className="flex items-center gap-2">
                  <span>/</span>
                  <Link
                    href={`/category/${crumb.slug}`}
                    className="hover:text-accent transition-colors duration-200"
                  >
                    {crumb.name}
                  </Link>
                </li>
              ))}
            </>
          )}
          <li className="flex items-center gap-2">
            <span>/</span>
            <span className="text-text-primary-light dark:text-text-primary-dark">{category.name}</span>
          </li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-8 md:mb-12">
        {category.image && (
          <div className="relative h-48 md:h-64 lg:h-80 rounded-[12px] overflow-hidden mb-6 bg-surface-light dark:bg-surface-dark">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg opacity-90 max-w-2xl">{category.description}</p>
              )}
            </div>
          </div>
        )}
        {!category.image && (
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-3 text-text-primary-light dark:text-text-primary-dark">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-3xl">
                {category.description}
              </p>
            )}
          </div>
        )}
        {category.pagination && (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-4">
            {category.pagination.total} {category.pagination.total === 1 ? "product" : "products"} found
          </p>
        )}
      </div>

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
            Subcategories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.subcategories.map((subcat) => (
              <Link
                key={subcat._id}
                href={`/category/${subcat.slug}`}
                className="group relative aspect-square rounded-[12px] overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-accent transition-all duration-200"
              >
                {subcat.image ? (
                  <Image
                    src={subcat.image}
                    alt={subcat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-3xl text-text-secondary-light dark:text-text-secondary-dark group-hover:text-accent transition-colors duration-200">
                      📁
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-sm font-medium text-white text-center">{subcat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
          <label className="text-sm text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
            Sort by:
          </label>
          <select
            value={sort}
            onChange={handleSortChange}
            className="px-4 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            {category.filters?.sortOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Panel */}
      {mounted && (showFilters || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
        <div className="mb-8 p-6 rounded-[12px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    handlePriceFilter();
                  }}
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <span className="text-text-secondary-light dark:text-text-secondary-dark">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    handlePriceFilter();
                  }}
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
              {category.filters?.priceRange && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  {formatPriceAmount(category.filters.priceRange.min)} - {formatPriceAmount(category.filters.priceRange.max)}
                </p>
              )}
            </div>

            {/* Subcategory Filter */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
                  Subcategory
                </label>
                <select
                  value={selectedSubcategory}
                  onChange={handleSubcategoryChange}
                  className="w-full px-3 py-2 rounded-[10px] border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                >
                  <option value="">All Subcategories</option>
                  {category.subcategories.map((subcat) => (
                    <option key={subcat._id} value={subcat._id}>
                      {subcat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* In Stock Filter */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={handleInStockToggle}
                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent/30"
              />
              <label
                htmlFor="inStockOnly"
                className="text-sm text-text-primary-light dark:text-text-primary-dark cursor-pointer"
              >
                In Stock Only
              </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-[10px] text-sm text-accent hover:bg-accent/10 dark:hover:bg-accent/20 border border-accent/30 transition-all duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : category.products && category.products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {category.products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {category.pagination && category.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-[10px] border transition-all duration-200 ${
                  page === 1
                    ? "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                    : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-accent hover:text-white hover:border-accent"
                }`}
              >
                Previous
              </button>

              {[...Array(category.pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === category.pagination.pages ||
                  (pageNum >= page - 2 && pageNum <= page + 2)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-[10px] border transition-all duration-200 ${
                        pageNum === page
                          ? "bg-accent text-white border-accent"
                          : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-accent/10 hover:border-accent/50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === page - 3 || pageNum === page + 3) {
                  return <span key={pageNum} className="px-2 text-text-secondary-light dark:text-text-secondary-dark">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === category.pagination.pages}
                className={`px-4 py-2 rounded-[10px] border transition-all duration-200 ${
                  page === category.pagination.pages
                    ? "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                    : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark hover:bg-accent hover:text-white hover:border-accent"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-text-secondary-light dark:text-text-secondary-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">
            No Products Found
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            {hasActiveFilters
              ? "Try adjusting your filters to see more products."
              : "This category doesn't have any products yet."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 rounded-[12px] bg-accent text-white hover:bg-accent/90 transition-all duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  try {
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Parse query parameters
    const page = context.query.page || "1";
    const limit = context.query.limit || "24";
    const sort = context.query.sort || "newest";
    const minPrice = context.query.minPrice || "";
    const maxPrice = context.query.maxPrice || "";
    const subcategory = context.query.subcategory || "";
    const inStock = context.query.inStock || "";

    const params = new URLSearchParams({
      page,
      limit,
      sort,
    });
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (subcategory) params.append("subcategory", subcategory);
    if (inStock) params.append("inStock", inStock);

    const response = await fetch(`${baseUrl}/api/category/${slug}?${params}`);
    const data = await response.json();

    if (!data.success) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        category: data.data,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      notFound: true,
    };
  }
}

