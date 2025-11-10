import Head from "next/head";
import Layout from "@/components/Layout";

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Home - Lignovia Store</title>
        <meta name="description" content="Welcome to Lignovia Store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1 className="text-4xl font-bold mb-6">Home Page</h1>
        <p className="text-lg mb-4">Welcome to Lignovia Store!</p>
        <div className="mt-8">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200">
            Tailwind CSS Test Button
          </button>
        </div>
      </div>
    </Layout>
  );
}
