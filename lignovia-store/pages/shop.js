import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";

export default function Shop({ products: initialProducts, error, searchQuery: initialSearchQuery }) {
  const router = useRouter();
  const [filteredProducts, setFilteredProducts] = useState(initialProducts || []);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(initialProducts || []);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = (initialProducts || []).filter((product) => {
      const matchesName = product.name?.toLowerCase().includes(query);
      const matchesDescription = product.description?.toLowerCase().includes(query);
      const matchesSlug = product.slug?.toLowerCase().includes(query);
      return matchesName || matchesDescription || matchesSlug;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, initialProducts]);

  // Update search query when router query changes
  useEffect(() => {
    if (router.query.search) {
      setSearchQuery(router.query.search);
    } else {
      setSearchQuery("");
    }
  }, [router.query.search]);

  return (
    <Layout>
      <Head>
        <title>{searchQuery ? `Search: ${searchQuery} - LIGNOVIA` : "Shop - LIGNOVIA"}</title>
        <meta name="description" content={searchQuery ? `Search results for ${searchQuery}` : "Browse our handcrafted products"} />
      </Head>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-heading-2">
            {searchQuery ? `Search: "${searchQuery}"` : "Shop"}
          </h1>
          {searchQuery && (
            <button
              onClick={() => {
                router.push("/shop");
                setSearchQuery("");
              }}
              className="px-4 py-2 text-body-sm hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
            >
              Clear Search
            </button>
          )}
        </div>

        {error ? (
          <div className="bg-error-light/10 dark:bg-error-dark/10 border border-error-light/30 dark:border-error-dark/30 text-error-light dark:text-error-dark px-6 py-4 rounded-[14px] mb-6">
            <p className="font-medium">Error loading products: {error}</p>
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <>
            {searchQuery && (
              <p className="text-body-sm mb-6">
                Found {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} matching "{searchQuery}"
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-surface-light dark:bg-surface-dark rounded-[14px] border border-border-light dark:border-border-dark p-12 md:p-16 text-center">
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
            <p className="text-body-lg mb-2">
              {searchQuery ? `No products found for "${searchQuery}"` : "No products available at the moment."}
            </p>
            <p className="text-body-sm">
              {searchQuery ? "Try searching for something else." : "Please check back later."}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    // Get the protocol and host from the request
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    // Get search query from URL
    const searchQuery = context.query.search || "";

    // Fetch products from the API route
    const response = await fetch(`${baseUrl}/api/products`);
    const data = await response.json();

    if (!data.success) {
      return {
        props: {
          products: [],
          error: data.error || "Failed to fetch products",
          searchQuery: searchQuery,
        },
      };
    }

    // Products are already filtered by API (published, public, inStock)
    // Images are already normalized by API, no need to normalize again
    const allProducts = data.data || [];

    return {
      props: {
        products: allProducts,
        error: null,
        searchQuery: searchQuery,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        products: [],
        error: error.message || "An error occurred while fetching products",
        searchQuery: context.query.search || "",
      },
    };
  }
}
