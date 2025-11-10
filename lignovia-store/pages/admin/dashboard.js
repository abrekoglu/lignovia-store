import Head from "next/head";
import Layout from "@/components/Layout";

export default function AdminDashboard() {
  return (
    <Layout>
      <Head>
        <title>Admin Dashboard - Lignovia Store</title>
        <meta name="description" content="Admin dashboard" />
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <p>Admin panel dashboard content will appear here.</p>
      </div>
    </Layout>
  );
}

