import Head from "next/head";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";

// Dynamically import CartPage with SSR disabled
const CartPage = dynamic(() => import("@/components/CartPage"), {
  ssr: false,
});

export default function Cart() {
  return (
    <Layout>
      <Head>
        <title>Cart - Lignovia Store</title>
        <meta name="description" content="Your shopping cart" />
      </Head>
      <CartPage />
    </Layout>
  );
}
