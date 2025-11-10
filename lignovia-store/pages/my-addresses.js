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
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>My Addresses - Lignovia Store</title>
        <meta name="description" content="Manage your shipping and billing addresses" />
      </Head>
      <div>
        <h1 className="text-3xl font-bold mb-8">My Addresses</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setActiveTab("shipping");
                setShowAddressForm(false);
                setEditingAddress(null);
              }}
              className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === "shipping"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
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
              className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === "billing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Billing Profiles
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Shipping Addresses Tab */}
        {activeTab === "shipping" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Shipping Addresses</h2>
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                {showAddressForm ? "Cancel" : "+ Add Address"}
              </button>
            </div>

            {/* Add/Edit Address Form */}
            {showAddressForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, fullName: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, phone: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={addressForm.postalCode}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, postalCode: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line *
                      </label>
                      <textarea
                        value={addressForm.address}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, address: e.target.value })
                        }
                        required
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, city: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, country: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note (Optional)
                      </label>
                      <textarea
                        value={addressForm.note}
                        onChange={(e) =>
                          setAddressForm({ ...addressForm, note: e.target.value })
                        }
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, isDefault: e.target.checked })
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      {editingAddress ? "Update Address" : "Add Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  {address.isDefault && (
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Default
                      </span>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    <p className="font-semibold text-gray-900">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-600">{address.address}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.postalCode}, {address.country}
                    </p>
                    {address.note && (
                      <p className="text-xs text-gray-500 italic">Note: {address.note}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {addresses.length === 0 && !showAddressForm && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-4">No shipping addresses saved yet.</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  Add Your First Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Billing Profiles Tab */}
        {activeTab === "billing" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Billing Profiles</h2>
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
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
              >
                {showBillingForm ? "Cancel" : "+ Add Billing Profile"}
              </button>
            </div>

            {/* Add/Edit Billing Form */}
            {showBillingForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  {editingBilling ? "Edit Billing Profile" : "Add New Billing Profile"}
                </h3>
                <form onSubmit={handleBillingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Type *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="individual"
                          checked={billingForm.type === "individual"}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, type: e.target.value })
                          }
                          className="mr-2"
                        />
                        <span>Individual</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="corporate"
                          checked={billingForm.type === "corporate"}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, type: e.target.value })
                          }
                          className="mr-2"
                        />
                        <span>Corporate</span>
                      </label>
                    </div>
                  </div>

                  {billingForm.type === "individual" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={billingForm.fullName}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, fullName: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={billingForm.phone}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, phone: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={billingForm.postalCode}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, postalCode: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line *
                        </label>
                        <textarea
                          value={billingForm.address}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, address: e.target.value })
                          }
                          required
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={billingForm.city}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, city: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          value={billingForm.country}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, country: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          value={billingForm.companyName}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, companyName: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Number *
                        </label>
                        <input
                          type="text"
                          value={billingForm.taxNumber}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, taxNumber: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tax Office *
                        </label>
                        <input
                          type="text"
                          value={billingForm.taxOffice}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, taxOffice: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={billingForm.email}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, email: e.target.value })
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Billing Address *
                        </label>
                        <textarea
                          value={billingForm.billingAddress}
                          onChange={(e) =>
                            setBillingForm({ ...billingForm, billingAddress: e.target.value })
                          }
                          required
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={billingForm.isDefault}
                        onChange={(e) =>
                          setBillingForm({ ...billingForm, isDefault: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Set as default billing profile</span>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      {editingBilling ? "Update Profile" : "Add Profile"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBillingForm(false);
                        setEditingBilling(null);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Billing Profiles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {billingProfiles.map((profile) => (
                <div
                  key={profile._id}
                  className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  {profile.isDefault && (
                    <div className="mb-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Default
                      </span>
                    </div>
                  )}
                  <div className="mb-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        profile.type === "corporate"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {profile.type === "corporate" ? "Corporate" : "Individual"}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {profile.type === "individual" ? (
                      <>
                        <p className="font-semibold text-gray-900">{profile.fullName}</p>
                        <p className="text-sm text-gray-600">{profile.phone}</p>
                        <p className="text-sm text-gray-600">{profile.address}</p>
                        <p className="text-sm text-gray-600">
                          {profile.city}, {profile.postalCode}, {profile.country}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-900">{profile.companyName}</p>
                        <p className="text-sm text-gray-600">Tax: {profile.taxNumber}</p>
                        <p className="text-sm text-gray-600">Tax Office: {profile.taxOffice}</p>
                        <p className="text-sm text-gray-600">Email: {profile.email}</p>
                        <p className="text-sm text-gray-600">{profile.billingAddress}</p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditBilling(profile)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBilling(profile._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-3 rounded transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {billingProfiles.length === 0 && !showBillingForm && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-4">No billing profiles saved yet.</p>
                <button
                  onClick={() => setShowBillingForm(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                >
                  Add Your First Billing Profile
                </button>
              </div>
            )}
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


