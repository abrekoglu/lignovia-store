import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";

export default function AdminCustomers({ customers, error }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/customers");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Filter customers
  const filteredCustomers = customers?.filter((customer) => {
    if (searchQuery.trim() === "") return true;
    const query = searchQuery.toLowerCase();
    const matchesName = customer.name?.toLowerCase().includes(query);
    const matchesEmail = customer.email?.toLowerCase().includes(query);
    return matchesName || matchesEmail;
  }) || [];

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <title>Customers - LIGNOVIA Admin</title>
        <meta name="description" content="Manage customers" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Customers
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              View and manage customer accounts
            </p>
          </div>
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search customers..."
              className="input flex-1 lg:min-w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
          <p className="text-error-light dark:text-error-dark text-sm font-medium">Error loading customers: {error}</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="card p-12 lg:p-16 text-center">
          <div className="mb-6 flex justify-center">
            <svg
              className="w-16 h-16 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">
            {customers?.length === 0 ? "No customers found yet." : "No customers match your search."}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
              <thead className="bg-hover-light dark:bg-hover-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Total Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Registration Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Last Activity
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                        {customer.name || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        {customer.totalOrders || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {formatDate(customer.lastOrderDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        className="btn-text text-sm"
                        aria-label="View profile"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

  try {
    await connectDB();

    // Get all users
    const users = await User.find({}).lean();

    // Get order counts and last order dates for each user
    const customers = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id })
          .sort({ createdAt: -1 })
          .lean();

        return {
          _id: user._id.toString(),
          name: user.name || null,
          email: user.email || null,
          totalOrders: orders.length,
          createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
          lastOrderDate: orders.length > 0 && orders[0].createdAt
            ? new Date(orders[0].createdAt).toISOString()
            : null,
        };
      })
    );

    return {
      props: {
        customers: JSON.parse(JSON.stringify(customers)),
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return {
      props: {
        customers: [],
        error: error.message || "Failed to fetch customers",
      },
    };
  }
}

