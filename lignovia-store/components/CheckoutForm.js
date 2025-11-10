import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import useCartStore, { useCartTotalPrice } from "@/store/cartStore";

export default function CheckoutForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore();
  const totalPrice = useCartTotalPrice();

  // Note: formData is kept for potential future use, but shipping address is now only from saved addresses
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingPreviousData, setLoadingPreviousData] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [billingProfiles, setBillingProfiles] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedBillingId, setSelectedBillingId] = useState("");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [useNewBilling, setUseNewBilling] = useState(true);

  // Fetch saved addresses and billing profiles
  useEffect(() => {
    const fetchSavedData = async () => {
      if (!session?.user?.id) return;

      setLoadingPreviousData(true);
      try {
        // Fetch addresses
        const addressesResponse = await fetch("/api/addresses");
        if (addressesResponse.ok) {
          const addressesData = await addressesResponse.json();
          if (addressesData.success) {
            setAddresses(addressesData.data || []);
            // Auto-select default address if available
            const defaultAddress = addressesData.data?.find((addr) => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress._id);
              setUseNewAddress(false);
            }
          }
        }

        // Fetch billing profiles
        const billingResponse = await fetch("/api/billing");
        if (billingResponse.ok) {
          const billingData = await billingResponse.json();
          if (billingData.success) {
            setBillingProfiles(billingData.data || []);
            // Auto-select default billing profile if available
            const defaultBilling = billingData.data?.find((b) => b.isDefault);
            if (defaultBilling) {
              setSelectedBillingId(defaultBilling._id);
              setUseNewBilling(false);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching saved data:", err);
        // Silently fail - don't show error to user
      } finally {
        setLoadingPreviousData(false);
      }
    };

    fetchSavedData();
  }, [session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
  };

  const handleBillingSelect = (billingId) => {
    setSelectedBillingId(billingId);
    setUseNewBilling(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate shipping address selection for logged-in users with addresses
    if (session?.user && addresses.length > 0 && !selectedAddressId) {
      setError("Please select a shipping address to continue");
      setLoading(false);
      return;
    }

    // For guests or users without saved addresses, we need to allow manual entry
    // But since we removed manual entry, we'll require login for now
    if (!session?.user || addresses.length === 0) {
      setError("Please log in and create a shipping address to continue");
      setLoading(false);
      return;
    }

    // Ensure we have the selected address data
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddress) {
      setError("Selected address not found. Please select a valid address.");
      setLoading(false);
      return;
    }

    // Validate billing profile selection for logged-in users with billing profiles
    if (session?.user && billingProfiles.length > 0 && !selectedBillingId) {
      setError("Please select a billing profile to continue");
      setLoading(false);
      return;
    }

    // Validate cart is not empty
    if (items.length === 0) {
      setError("Your cart is empty");
      setLoading(false);
      return;
    }

    try {
      // Get selected address data
      const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
      if (!selectedAddress) {
        setError("Selected address not found. Please select a valid address.");
        setLoading(false);
        return;
      }

      // Get selected billing profile data if a profile is selected
      let billingInfoData = null;
      if (selectedBillingId) {
        const selectedBilling = billingProfiles.find((b) => b._id === selectedBillingId);
        if (selectedBilling) {
          billingInfoData = {
            type: selectedBilling.type,
            requestInvoice: selectedBilling.type === "corporate",
            companyName: selectedBilling.companyName || undefined,
            taxNumber: selectedBilling.taxNumber || undefined,
            taxOffice: selectedBilling.taxOffice || undefined,
            email: selectedBilling.email || undefined,
            billingAddress: selectedBilling.billingAddress || undefined,
            fullName: selectedBilling.fullName || undefined,
            phone: selectedBilling.phone || undefined,
            postalCode: selectedBilling.postalCode || undefined,
            address: selectedBilling.address || undefined,
            city: selectedBilling.city || undefined,
            country: selectedBilling.country || undefined,
          };
        }
      }

      // Prepare order data
      const orderData = {
        // Shipping Address (always include for order snapshot)
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
          deliveryNote: selectedAddress.note || undefined,
          note: selectedAddress.note || undefined,
        },
        // Shipping Address ID (using saved address)
        shippingAddressId: selectedAddressId,
        // Billing Information (always include for order snapshot if billing profile is selected)
        billingInfo: billingInfoData,
        // Billing Info ID (if using saved billing profile)
        billingInfoId: selectedBillingId ? selectedBillingId : undefined,
        items: items.map((item) => {
          // Ensure we get the correct product ID
          const productId = item._id || item.id;
          
          if (!productId) {
            console.error("Cart item missing ID:", item);
            return null;
          }
          
          return {
            id: productId,
            _id: productId, // Include both for consistency
            quantity: item.quantity,
            price: item.price,
          };
        }).filter(Boolean), // Remove any null items
      };

      // Send POST request to /api/orders
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // Clear cart
      clearCart();

      // Redirect to thank-you page with order ID
      router.push(`/thank-you?orderId=${data.orderId}`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push("/shop")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Forms */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loadingPreviousData && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
              Loading your previous address information...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Shipping Address</h2>
                {session?.user && (
                  <a
                    href="/my-addresses"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Manage Addresses
                  </a>
                )}
              </div>

              {session?.user ? (
                addresses.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Shipping Address *
                      </label>
                      <select
                        value={selectedAddressId || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddressSelect(e.target.value);
                          } else {
                            setSelectedAddressId("");
                            setUseNewAddress(true);
                          }
                        }}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select a shipping address --</option>
                        {addresses.map((address) => (
                          <option key={address._id} value={address._id}>
                            {address.fullName} - {address.address}, {address.city}
                            {address.isDefault ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedAddressId && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {(() => {
                          const selectedAddress = addresses.find(
                            (a) => a._id === selectedAddressId
                          );
                          if (!selectedAddress) return null;

                          return (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-gray-900 text-base mb-3">
                                {selectedAddress.fullName}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedAddress.phone && (
                                  <p className="text-gray-600">
                                    <span className="font-medium text-gray-700">Phone:</span>{" "}
                                    {selectedAddress.phone}
                                  </p>
                                )}
                                {selectedAddress.postalCode && (
                                  <p className="text-gray-600">
                                    <span className="font-medium text-gray-700">Postal Code:</span>{" "}
                                    {selectedAddress.postalCode}
                                  </p>
                                )}
                              </div>
                              {selectedAddress.address && (
                                <p className="text-gray-600">
                                  <span className="font-medium text-gray-700">Address:</span>{" "}
                                  {selectedAddress.address}
                                </p>
                              )}
                              <p className="text-gray-600">
                                <span className="font-medium text-gray-700">City:</span>{" "}
                                {selectedAddress.city}
                                {selectedAddress.country && `, ${selectedAddress.country}`}
                              </p>
                              {selectedAddress.note && (
                                <p className="text-gray-600 pt-2 border-t border-gray-300">
                                  <span className="font-medium text-gray-700">Delivery Note:</span>{" "}
                                  <span className="italic">{selectedAddress.note}</span>
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      You don't have any shipping addresses saved yet.
                    </p>
                    <a
                      href="/my-addresses"
                      className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-sm"
                    >
                      Create Shipping Address
                    </a>
                  </div>
                )
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Please{" "}
                    <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
                      log in
                    </a>{" "}
                    to use saved shipping addresses.
                  </p>
                </div>
              )}
            </div>

            {/* Billing Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Billing Information</h2>
                {session?.user && (
                  <a
                    href="/my-addresses"
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Manage Billing Profiles
                  </a>
                )}
              </div>

              {session?.user ? (
                billingProfiles.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Billing Profile *
                      </label>
                      <select
                        value={selectedBillingId || ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBillingSelect(e.target.value);
                          } else {
                            setSelectedBillingId("");
                            setUseNewBilling(true);
                          }
                        }}
                        required={billingProfiles.length > 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select a billing profile --</option>
                        {billingProfiles.map((profile) => (
                          <option key={profile._id} value={profile._id}>
                            {profile.type === "corporate"
                              ? `${profile.companyName} (Corporate)`
                              : `${profile.fullName} (Individual)`}
                            {profile.isDefault ? " (Default)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedBillingId && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {(() => {
                          const selectedProfile = billingProfiles.find(
                            (p) => p._id === selectedBillingId
                          );
                          if (!selectedProfile) return null;
                          
                          return selectedProfile.type === "corporate" ? (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-gray-900">
                                {selectedProfile.companyName}
                              </p>
                              <p className="text-gray-600">
                                Tax Number: {selectedProfile.taxNumber}
                              </p>
                              {selectedProfile.taxOffice && (
                                <p className="text-gray-600">
                                  Tax Office: {selectedProfile.taxOffice}
                                </p>
                              )}
                              {selectedProfile.email && (
                                <p className="text-gray-600">
                                  Email: {selectedProfile.email}
                                </p>
                              )}
                              {selectedProfile.billingAddress && (
                                <p className="text-gray-600">
                                  Address: {selectedProfile.billingAddress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-gray-900">
                                {selectedProfile.fullName}
                              </p>
                              {selectedProfile.phone && (
                                <p className="text-gray-600">
                                  Phone: {selectedProfile.phone}
                                </p>
                              )}
                              {selectedProfile.address && (
                                <p className="text-gray-600">
                                  {selectedProfile.address}
                                </p>
                              )}
                              <p className="text-gray-600">
                                {selectedProfile.city}
                                {selectedProfile.postalCode && `, ${selectedProfile.postalCode}`}
                                {selectedProfile.country && `, ${selectedProfile.country}`}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      You don't have any billing profiles saved yet.
                    </p>
                    <a
                      href="/my-addresses"
                      className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-sm"
                    >
                      Create Billing Profile
                    </a>
                  </div>
                )
              ) : (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    Please{" "}
                    <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
                      log in
                    </a>{" "}
                    to use billing profiles.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </form>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const productId = item._id || item.id;
                const itemTotal = (item.price || 0) * item.quantity;

                return (
                  <div
                    key={productId}
                    className="flex justify-between items-center pb-4 border-b border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.name || "Product"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
