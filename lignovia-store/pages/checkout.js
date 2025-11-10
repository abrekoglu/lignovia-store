import Head from "next/head";
import Layout from "@/components/Layout";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with Zustand
const CheckoutForm = dynamic(() => import("@/components/CheckoutForm"), {
  ssr: false,
});

export default function Checkout() {
  return (
    <Layout>
      <Head>
        <title>Checkout - Lignovia Store</title>
        <meta name="description" content="Complete your purchase" />
      </Head>
      <CheckoutForm />
    </Layout>
  );
}
