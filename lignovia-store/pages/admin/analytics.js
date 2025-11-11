import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/analytics");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Analytics - LIGNOVIA Admin</title>
        <meta name="description" content="View analytics" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Analytics
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Comprehensive business insights and reports
          </p>
        </div>
      </div>

      {/* Analytics Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Over Time */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
            Sales Over Time
          </h3>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-soft border border-border-light dark:border-border-dark">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Chart visualization coming soon
            </p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
            Top Categories
          </h3>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-soft border border-border-light dark:border-border-dark">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Chart visualization coming soon
            </p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
            Revenue Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-soft border border-border-light dark:border-border-dark">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Chart visualization coming soon
            </p>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
            Customer Growth
          </h3>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-soft border border-border-light dark:border-border-dark">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Chart visualization coming soon
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  // Check admin access using helper function
  const adminCheck = await import("@/lib/checkAdmin");
  const result = await adminCheck.checkAdmin(context);

  // If result contains redirect, return it (user is not authorized)
  if (result.redirect) {
    return result;
  }

  return {
    props: {},
  };
}

