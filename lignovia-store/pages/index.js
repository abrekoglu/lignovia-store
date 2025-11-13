import Head from "next/head";
import Layout from "@/components/Layout";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedCategories from "@/components/homepage/FeaturedCategories";
import ProductSection from "@/components/homepage/ProductSection";
import BrandStory from "@/components/homepage/BrandStory";
import Newsletter from "@/components/homepage/Newsletter";

export default function Home({ homepageData, error }) {
  const { featuredCategories, featuredProducts, newArrivals, bestSellers } =
    homepageData || {};

  return (
    <Layout containerClassName="!py-0 max-w-full">
      <Head>
        <title>LIGNOVIA — Handcrafted Wood Products</title>
        <meta
          name="description"
          content="Discover premium handcrafted woodworking products at LIGNOVIA. Quality craftsmanship, timeless elegance, and exceptional design. Each piece tells a story of dedication, precision, and passion."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="LIGNOVIA — Handcrafted Wood Products" />
        <meta
          property="og:description"
          content="Discover premium handcrafted woodworking products at LIGNOVIA. Quality craftsmanship, timeless elegance, and exceptional design."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/products/images.jpg" />
        <link rel="icon" href="/favicon.ico" />
        {/* Preload hero image for performance */}
        <link rel="preload" as="image" href="/images/products/images.jpg" />
      </Head>

      <div className="w-full">
        {/* Hero Section - Full viewport height */}
        <div className="w-full">
          <HeroSection />
        </div>

        {/* Main Content Sections - Clean spacing */}
        <div className="container mx-auto px-6 md:px-12 lg:px-16">
          {/* Featured Categories */}
          {featuredCategories && featuredCategories.length > 0 && (
            <FeaturedCategories categories={featuredCategories} />
          )}

          {/* Featured Products */}
          {featuredProducts && featuredProducts.length > 0 && (
            <ProductSection
              title="Featured Products"
              products={featuredProducts}
              viewAllLink="/shop"
              viewAllText="View All Products"
            />
          )}

          {/* Brand Story Section */}
          <BrandStory />

          {/* New Arrivals */}
          {newArrivals && newArrivals.length > 0 && (
            <ProductSection
              title="New Arrivals"
              subtitle="Freshly crafted pieces you'll love."
              products={newArrivals}
              viewAllLink="/shop?sort=newest"
              viewAllText="View All New Arrivals"
            />
          )}

          {/* Best Sellers */}
          {bestSellers && bestSellers.length > 0 && (
            <ProductSection
              title="Best Sellers"
              products={bestSellers}
              viewAllLink="/shop"
              viewAllText="View All Products"
            />
          )}

          {/* Newsletter Signup */}
          <Newsletter />

          {/* Error State - Minimal */}
          {error && (
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light/30 dark:border-border-dark/30 text-text-secondary-light dark:text-text-secondary-dark px-6 py-4 rounded-[10px] mb-6 text-center">
              <p className="font-light text-sm">Unable to load homepage content. Please refresh the page.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    const protocol = context.req.headers["x-forwarded-proto"] || "http";
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const response = await fetch(`${baseUrl}/api/homepage`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Homepage API returned ${response.status}`);
      return {
        props: {
          homepageData: null,
          error: null,
        },
      };
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      console.error("Homepage API failed:", data.error);
      return {
        props: {
          homepageData: null,
          error: null,
        },
      };
    }

    return {
      props: {
        homepageData: data.data,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error in homepage SSR:", error);
    return {
      props: {
        homepageData: null,
        error: null,
      },
    };
  }
}
