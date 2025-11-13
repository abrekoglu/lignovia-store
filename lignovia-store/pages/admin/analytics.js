import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import SkeletonChart from "@/components/SkeletonChart";

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
        <Head>
          <title>Analytics - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Analytics
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Comprehensive business insights and reports
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SkeletonChart type="line" height="300px" />
          <SkeletonChart type="bar" height="300px" />
          <SkeletonChart type="pie" height="300px" />
          <SkeletonChart type="line" height="300px" />
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

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Over Time */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Sales Over Time
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
            <div className="text-center">
              <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25l3 3m0 0l3-3m-3 3v6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Top Categories
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
            <div className="text-center">
              <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.125M8.25 8.25l3 3m0 0l3-3m-3 3v6" />
              </svg>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Revenue Breakdown
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
            <div className="text-center">
              <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Customer Growth
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
            <div className="text-center">
              <svg className="w-16 h-16 text-accent/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Chart visualization coming soon
              </p>
            </div>
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

