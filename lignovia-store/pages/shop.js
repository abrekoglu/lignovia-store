import Head from "next/head";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";

export default function Shop({ products, error }) {
  return (
    <Layout>
      <Head>
        <title>Shop - Lignovia Store</title>
        <meta name="description" content="Browse our products" />
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-8">Shop</h1>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error loading products: {error}</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
            <p className="text-gray-500 mt-2">Please check back later.</p>
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

    // Fetch products from the API route
    const response = await fetch(`${baseUrl}/api/products`);
    const data = await response.json();

    if (!data.success) {
      return {
        props: {
          products: [],
          error: data.error || "Failed to fetch products",
        },
      };
    }

    // Filter products to only show those with inStock: true
    const allProducts = data.data || [];
    const inStockProducts = allProducts.filter(
      (product) => product.inStock === true
    );

    return {
      props: {
        products: inStockProducts,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      props: {
        products: [],
        error: error.message || "An error occurred while fetching products",
      },
    };
  }
}
