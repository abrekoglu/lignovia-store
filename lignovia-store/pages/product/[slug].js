import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <Layout>
      <Head>
        <title>Product - Lignovia Store</title>
        <meta name="description" content="Product details" />
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-6">Product Detail Page</h1>
        <p>Product Slug: {slug || "Loading..."}</p>
      </div>
    </Layout>
  );
}

