import Head from "next/head";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import { AdminCalendar } from "@/components/calendar";
import { checkAdmin } from "@/lib/checkAdmin";

export default function AdminCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/calendar");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];

    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  // Show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <AdminLayout>
      <Head>
        <title>Calendar & Tasks - LIGNOVIA Admin</title>
      </Head>
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
          Calendar & Task Planner
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Manage orders, tasks, reminders, and events
        </p>
      </div>
      <AdminCalendar />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const result = await checkAdmin(context);

  if (result.redirect) {
    return result;
  }

  // Session is handled by useSession hook, no need to pass it as prop
  // This avoids serialization issues with undefined values
  return {
    props: {},
  };
}

