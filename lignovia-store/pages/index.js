import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Home - LIGNOVIA</title>
        <meta name="description" content="Welcome to LIGNOVIA - Craftsmanship, precision, and serenity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 lg:py-20">
          <h1 className="text-heading-1 mb-6">
            Craftsmanship, Precision, Serenity
          </h1>
          <p className="text-body-lg text-text-secondary-light dark:text-text-secondary-dark mb-8 max-w-2xl mx-auto">
            Welcome to LIGNOVIA — a modern woodcraft studio bringing you quality products with elegant design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop" className="btn-primary">
              Explore Shop
            </Link>
            <Link href="/cart" className="btn-secondary">
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
