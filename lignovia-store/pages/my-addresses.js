import Head from "next/head";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

export default function MyAddresses() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [billingProfiles, setBillingProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("shipping"); // "shipping" or "billing"
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingBilling, setEditingBilling] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showBillingForm, setShowBillingForm] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    postalCode: "",
    address: "",
    city: "",
    country: "",
    note: "",
    isDefault: false,
  });

  // Billing form state
  const [billingForm, setBillingForm] = useState({
    type: "individual",
    fullName: "",
    phone: "",
    postalCode: "",
    address: "",
    city: "",
    country: "",
    companyName: "",
    taxNumber: "",
    taxOffice: "",
    email: "",
    billingAddress: "",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/my-addresses");
    } else if (status === "authenticated") {
      fetchAddresses();
      fetchBillingProfiles();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingProfiles = async () => {
    try {
      const response = await fetch("/api/billing");
      const data = await response.json();
      if (data.success) {
        setBillingProfiles(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching billing profiles:", err);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress._id}`
        : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingAddress ? "Address updated!" : "Address added!");
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressForm({
          fullName: "",
          phone: "",
          postalCode: "",
          address: "",
          city: "",
          country: "",
          note: "",
          isDefault: false,
        });
        fetchAddresses();
      } else {
        setError(data.error || "Failed to save address");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const url = editingBilling
        ? `/api/billing/${editingBilling._id}`
        : "/api/billing";
      const method = editingBilling ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingForm),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(editingBilling ? "Billing profile updated!" : "Billing profile added!");
        setShowBillingForm(false);
        setEditingBilling(null);
        setBillingForm({
          type: "individual",
          fullName: "",
          phone: "",
          postalCode: "",
          address: "",
          city: "",
          country: "",
          companyName: "",
          taxNumber: "",
          taxOffice: "",
          email: "",
          billingAddress: "",
          isDefault: false,
        });
        fetchBillingProfiles();
      } else {
        setError(data.error || "Failed to save billing profile");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      postalCode: address.postalCode,
      address: address.address,
      city: address.city,
      country: address.country,
      note: address.note || "",
      isDefault: address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleEditBilling = (billing) => {
    setEditingBilling(billing);
    setBillingForm({
      type: billing.type || "individual",
      fullName: billing.fullName || "",
      phone: billing.phone || "",
      postalCode: billing.postalCode || "",
      address: billing.address || "",
      city: billing.city || "",
      country: billing.country || "",
      companyName: billing.companyName || "",
      taxNumber: billing.taxNumber || "",
      taxOffice: billing.taxOffice || "",
      email: billing.email || "",
      billingAddress: billing.billingAddress || "",
      isDefault: billing.isDefault || false,
    });
    setShowBillingForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Address deleted!");
        fetchAddresses();
      } else {
        setError(data.error || "Failed to delete address");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleDeleteBilling = async (id) => {
    if (!confirm("Are you sure you want to delete this billing profile?")) return;

    try {
      const response = await fetch(`/api/billing/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Billing profile deleted!");
        fetchBillingProfiles();
      } else {
        setError(data.error || "Failed to delete billing profile");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (status === "loading" || loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>My Addresses - LIGNOVIA</title>
        <meta name="description" content="Manage your shipping and billing addresses" />
      </Head>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-semibold mb-8 lg:mb-12 text-text-primary-light dark:text-text-primary-dark tracking-tight">
          My Addresses
        </h1>

        {/* Tabs */}
        <div className="mb-8 border-b border-border-light dark:border-border-dark">
          <div className="flex space-x-6">
            <button
              onClick={() => {
                setActiveTab("shipping");
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              className={`py-3 px-1 font-semibold border-b-2 transition-all duration-200 ${
                activeTab === "shipping"
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-accent"
              }`}
            >
              Shipping Addresses
            </button>
            <button
              onClick={() => {
                setActiveTab("billing");
                setShowBillingForm(false);
                setEditingBilling(null);
              }}
              className={`py-3 px-1 font-semibold border-b-2 transition-all duration-200 ${
                activeTab === "billing"
                  ? "border-accent text-accent"
                  : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-accent"
              }`}
            >
              Billing Profiles
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4 mb-6">
            <p className="text-error-light dark:text-error-dark text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="card border-success-light dark:border-success-dark bg-success-light/10 dark:bg-success-dark/10 p-4 mb-6">
            <p className="text-success-light dark:text-success-dark text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Shipping Addresses Tab */}
        {activeTab === "shipping" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                Shipping Addresses
              </h2>
              <button
                onClick={() => {
                  setShowAddressForm(!showAddressForm);
                  setEditingAddress(null);
                  setAddressForm({
                    fullName: "",
                    phone: "",
                    postalCode: "",
                    address: "",
                    city: "",
                    country: "",
                    note: "",
                    isDefault: false,
                  });
                }}
                className="btn-primary w-full sm:w-auto"
              >
                {showAddressForm ? "Cancel" : "+ Add New Address"}
              </button>
            </div>

            {/* Add/Edit Address Form */}
            {showAddressForm && (
              <div className="card p-6 lg:p-8 mb-8">
                <h3 className="text-xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <form onSubmit={handleAddressSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, fullName: e.target.value })
                        }
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, phone: e.target.value })
                        }
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, postalCode: e.target.value })
                        }
                        required
                        className="input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Address Line *
                      </label>
                      <textarea
                        value={addressForm.address}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, address: e.target.value })
                        }
                        required
                        rows="3"
                        className="input resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        City *
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, country: e.target.value })
                        }
                        required
                        className="input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Note (Optional)
                      </label>
                      <textarea
                        value={addressForm.note}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, note: e.target.value })
                        }
                        rows="2"
                        className="input resize-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, isDefault: e.target.checked })
                          }
                          className="h-4 w-4 text-accent focus:ring-accent border-border-light dark:border-border-dark rounded cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-text-primary-light dark:text-text-primary-dark">Set as default address</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                    >
                      {editingAddress ? "Update Address" : "Add Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            {addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className="card p-5 lg:p-6 relative"
                  >
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
                        aria-label="Edit address"
                        title="Edit address"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address._id)}
                        className="text-error-light dark:text-error-dark hover:opacity-70 transition-opacity duration-200 p-1.5"
                        aria-label="Delete address"
                        title="Delete address"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Default Badge */}
                    {address.isDefault && (
                      <div className="mb-4">
                        <span className="badge bg-accent/20 text-accent">
                          Default Address
                        </span>
                      </div>
                    )}

                    {/* Address Content */}
                    <div className="space-y-2 pr-12">
                      <p className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                        {address.fullName}
                      </p>
                      {address.phone && (
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          {address.phone}
                        </p>
                      )}
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        {address.address}
                      </p>
                      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        {address.city}, {address.postalCode}, {address.country}
                      </p>
                      {address.note && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                          Note: {address.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !showAddressForm ? (
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
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">
                  You haven't added any addresses yet.
                </p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="btn-primary"
                >
                  Add Your First Address
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Billing Profiles Tab */}
        {activeTab === "billing" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                Billing Profiles
              </h2>
              <button
                onClick={() => {
                  setShowBillingForm(!showBillingForm);
                  setEditingBilling(null);
                  setBillingForm({
                    type: "individual",
                    fullName: "",
                    phone: "",
                    postalCode: "",
                    address: "",
                    city: "",
                    country: "",
                    companyName: "",
                    taxNumber: "",
                    taxOffice: "",
                    email: "",
                    billingAddress: "",
                    isDefault: false,
                  });
                }}
                className="btn-primary w-full sm:w-auto"
              >
                {showBillingForm ? "Cancel" : "+ Add New Billing Profile"}
              </button>
            </div>

            {/* Add/Edit Billing Form */}
            {showBillingForm && (
              <div className="card p-6 lg:p-8 mb-8">
                <h3 className="text-xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  {editingBilling ? "Edit Billing Profile" : "Add New Billing Profile"}
                </h3>
                <form onSubmit={handleBillingSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-4">
                      Type *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="individual"
                          checked={billingForm.type === "individual"}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, type: e.target.value })
                          }
                          className="mr-3 text-accent focus:ring-accent border-border-light dark:border-border-dark cursor-pointer"
                        />
                        <span className="text-text-primary-light dark:text-text-primary-dark">Individual</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="corporate"
                          checked={billingForm.type === "corporate"}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, type: e.target.value })
                          }
                          className="mr-3 text-accent focus:ring-accent border-border-light dark:border-border-dark cursor-pointer"
                        />
                        <span className="text-text-primary-light dark:text-text-primary-dark">Corporate</span>
                      </label>
                    </div>
                  </div>

                  {billingForm.type === "individual" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={billingForm.fullName}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, fullName: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={billingForm.phone}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, phone: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={billingForm.postalCode}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, postalCode: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Address Line *
                        </label>
                        <textarea
                          value={billingForm.address}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, address: e.target.value })
                          }
                          required
                          rows="3"
                          className="input resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          City *
                        </label>
                        <input
                          type="text"
                          value={billingForm.city}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, city: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={billingForm.country}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, country: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={billingForm.companyName}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, companyName: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Tax Number *
                        </label>
                        <input
                          type="text"
                          value={billingForm.taxNumber}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, taxNumber: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Tax Office *
                        </label>
                        <input
                          type="text"
                          value={billingForm.taxOffice}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, taxOffice: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={billingForm.email}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, email: e.target.value })
                          }
                          required
                          className="input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                          Billing Address *
                        </label>
                        <textarea
                          value={billingForm.billingAddress}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, billingAddress: e.target.value })
                          }
                          required
                          rows="3"
                          className="input resize-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingForm.isDefault}
                        onChange={(e) =>
                          setBillingForm({ ...billingForm, isDefault: e.target.checked })
                        }
                        className="h-4 w-4 text-accent focus:ring-accent border-border-light dark:border-border-dark rounded cursor-pointer"
                      />
                      <span className="ml-3 text-sm text-text-primary-light dark:text-text-primary-dark">Set as default billing profile</span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                      type="submit"
                      className="btn-primary w-full sm:w-auto"
                    >
                      {editingBilling ? "Update Profile" : "Add Profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBillingForm(false);
                        setEditingBilling(null);
                      }}
                      className="btn-secondary w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Billing Profiles List */}
            {billingProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {billingProfiles.map((profile) => (
                  <div
                    key={profile._id}
                    className="card p-5 lg:p-6 relative"
                  >
                    {/* Action Buttons - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleEditBilling(profile)}
                        className="text-accent hover:opacity-70 transition-opacity duration-200 p-1.5"
                        aria-label="Edit billing profile"
                        title="Edit billing profile"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteBilling(profile._id)}
                        className="text-error-light dark:text-error-dark hover:opacity-70 transition-opacity duration-200 p-1.5"
                        aria-label="Delete billing profile"
                        title="Delete billing profile"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profile.isDefault && (
                        <span className="badge bg-accent/20 text-accent">
                          Default
                        </span>
                      )}
                      <span className={`badge ${
                        profile.type === "corporate"
                          ? "bg-accent/10 text-accent"
                          : "bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark"
                      }`}>
                        {profile.type === "corporate" ? "Corporate" : "Individual"}
                      </span>
                    </div>

                    {/* Profile Content */}
                    <div className="space-y-2 pr-12">
                      {profile.type === "individual" ? (
                        <>
                          <p className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                            {profile.fullName}
                          </p>
                          {profile.phone && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              {profile.phone}
                            </p>
                          )}
                          {profile.address && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                              {profile.address}
                            </p>
                          )}
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {profile.city}
                            {profile.postalCode && `, ${profile.postalCode}`}
                            {profile.country && `, ${profile.country}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">
                            {profile.companyName}
                          </p>
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Tax: {profile.taxNumber}
                          </p>
                          {profile.taxOffice && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              Tax Office: {profile.taxOffice}
                            </p>
                          )}
                          {profile.email && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                              Email: {profile.email}
                            </p>
                          )}
                          {profile.billingAddress && (
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                              {profile.billingAddress}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : !showBillingForm ? (
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
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">
                  You haven't added any billing profiles yet.
                </p>
                <button
                  onClick={() => setShowBillingForm(true)}
                  className="btn-primary"
                >
                  Add Your First Billing Profile
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions
    );

    if (!session || !session.user || !session.user.id) {
      return {
        redirect: {
          destination: "/login?callbackUrl=/my-addresses",
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
}


