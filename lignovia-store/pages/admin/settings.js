import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import FilterDropdown from "@/components/filters/FilterDropdown";
import { useToast } from "@/contexts/ToastContext";

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const [settings, setSettings] = useState({
    storeName: "LIGNOVIA",
    storeEmail: "info@lignovia.com",
    currency: "USD",
    taxRate: 0,
    shippingEnabled: true,
    notificationsEnabled: true,
  });
  const [saving, setSaving] = useState(false);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/settings");
      return;
    }

    // Restrict to allowed admin email
    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toastSuccess("Settings saved successfully!");
    } catch (err) {
      toastError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <AdminLayout>
        <Head>
          <title>Settings - LIGNOVIA Admin</title>
        </Head>
        <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Configure your store settings and preferences
          </p>
        </div>
        <div className="space-y-8">
          <div className="card p-6">
            <div className="h-8 bg-hover-light dark:bg-hover-dark rounded-[12px] animate-pulse mb-4" />
            <div className="h-12 bg-hover-light dark:bg-hover-dark rounded-[12px] animate-pulse" />
          </div>
          <div className="card p-6">
            <div className="h-8 bg-hover-light dark:bg-hover-dark rounded-[12px] animate-pulse mb-4" />
            <div className="h-12 bg-hover-light dark:bg-hover-dark rounded-[12px] animate-pulse" />
          </div>
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
        <title>Settings - LIGNOVIA Admin</title>
        <meta name="description" content="Manage settings" />
      </Head>

      {/* Header Section */}
      <div className="mb-8 pb-6 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
            Settings
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Configure your store settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Store Information */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Store Information
            </h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="Store name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Store Email
              </label>
              <input
                type="email"
                name="storeEmail"
                value={settings.storeEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="Store email"
              />
            </div>
          </div>
        </div>

        {/* Payment & Shipping */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Payment & Shipping
            </h2>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Currency
              </label>
              <FilterDropdown
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "GBP", label: "GBP (£)" },
                ]}
                value={settings.currency}
                onChange={(value) => setSettings({ ...settings, currency: value })}
                placeholder="Select Currency"
                label=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxRate"
                value={settings.taxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-center gap-3 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
              <input
                type="checkbox"
                name="shippingEnabled"
                id="shippingEnabled"
                checked={settings.shippingEnabled}
                onChange={handleChange}
                className=""
              />
              <label htmlFor="shippingEnabled" className="flex-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark cursor-pointer">
                Enable Shipping
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-[12px] bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Notifications
            </h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
              <input
                type="checkbox"
                name="notificationsEnabled"
                id="notificationsEnabled"
                checked={settings.notificationsEnabled}
                onChange={handleChange}
                className=""
              />
              <label htmlFor="notificationsEnabled" className="flex-1 text-sm font-medium text-text-primary-light dark:text-text-primary-dark cursor-pointer">
                Enable Email Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-accent text-white rounded-[12px] text-sm font-semibold hover:bg-accent/90 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
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

