import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useCartStore, { useCartTotalPrice } from "@/store/cartStore";
import OrderConfirmation from "./OrderConfirmation";
import { formatPrice } from "@/utils/priceUtils";

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
  const [showConfirmation, setShowConfirmation] = useState(false);

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

      // Show confirmation modal
      setShowConfirmation(true);
      
      // Redirect to thank-you page after a short delay
      setTimeout(() => {
        router.push(`/thank-you?orderId=${data.orderId}`);
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <h1 className="text-3xl lg:text-4xl font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark tracking-tight">
          Checkout
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">Your cart is empty</p>
        <Link
          href="/shop"
          className="btn-primary inline-block"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl lg:text-4xl font-semibold mb-8 lg:mb-12 text-text-primary-light dark:text-text-primary-dark tracking-tight">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Checkout Forms - Left Column */}
        <div className="space-y-6">
          {error && (
            <div className="card border-error-light dark:border-error-dark bg-error-light/10 dark:bg-error-dark/10 p-4">
              <p className="text-error-light dark:text-error-dark text-sm font-medium">{error}</p>
            </div>
          )}

          {loadingPreviousData && (
            <div className="card p-4">
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                Loading your previous address information...
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address Section */}
            <div className="card p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  Shipping Address
                </h2>
                {session?.user && (
                  <Link
                    href="/my-addresses"
                    className="btn-text text-sm"
                  >
                    Manage Addresses
                  </Link>
                )}
              </div>

              {session?.user ? (
                addresses.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
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
                      <div className="mt-4 p-5 bg-hover-light dark:bg-hover-dark rounded-softer border border-border-light dark:border-border-dark">
                        {(() => {
                          const selectedAddress = addresses.find(
                            (a) => a._id === selectedAddressId
                          );
                          if (!selectedAddress) return null;

                          return (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark text-base mb-3">
                                {selectedAddress.fullName}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedAddress.phone && (
                                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Phone:</span>{" "}
                                    {selectedAddress.phone}
                                  </p>
                                )}
                                {selectedAddress.postalCode && (
                                  <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Postal Code:</span>{" "}
                                    {selectedAddress.postalCode}
                                  </p>
                                )}
                              </div>
                              {selectedAddress.address && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Address:</span>{" "}
                                  {selectedAddress.address}
                                </p>
                              )}
                              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                <span className="font-medium text-text-primary-light dark:text-text-primary-dark">City:</span>{" "}
                                {selectedAddress.city}
                                {selectedAddress.country && `, ${selectedAddress.country}`}
                              </p>
                              {selectedAddress.note && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark pt-3 border-t border-border-light dark:border-border-dark">
                                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Delivery Note:</span>{" "}
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
                  <div className="card p-6">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                      You don't have any shipping addresses saved yet.
                    </p>
                    <Link
                      href="/my-addresses"
                      className="btn-primary inline-block text-sm"
                    >
                      Create Shipping Address
                    </Link>
                  </div>
                )
              ) : (
                <div className="card p-6">
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Please{" "}
                    <Link href="/login" className="text-accent hover:opacity-80 underline">
                      log in
                    </Link>{" "}
                    to use saved shipping addresses.
                  </p>
                </div>
              )}
            </div>

            {/* Billing Information Section */}
            <div className="card p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
                  Billing Information
                </h2>
                {session?.user && (
                  <Link
                    href="/my-addresses"
                    className="btn-text text-sm"
                  >
                    Manage Billing Profiles
                  </Link>
                )}
              </div>

              {session?.user ? (
                billingProfiles.length > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                        Select Billing Profile {billingProfiles.length > 0 && "*"}
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
                      <div className="mt-4 p-5 bg-hover-light dark:bg-hover-dark rounded-softer border border-border-light dark:border-border-dark">
                        {(() => {
                          const selectedProfile = billingProfiles.find(
                            (p) => p._id === selectedBillingId
                          );
                          if (!selectedProfile) return null;
                          
                          return selectedProfile.type === "corporate" ? (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {selectedProfile.companyName}
                              </p>
                              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                Tax Number: {selectedProfile.taxNumber}
                              </p>
                              {selectedProfile.taxOffice && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  Tax Office: {selectedProfile.taxOffice}
                                </p>
                              )}
                              {selectedProfile.email && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  Email: {selectedProfile.email}
                                </p>
                              )}
                              {selectedProfile.billingAddress && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  Address: {selectedProfile.billingAddress}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2 text-sm">
                              <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                                {selectedProfile.fullName}
                              </p>
                              {selectedProfile.phone && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  Phone: {selectedProfile.phone}
                                </p>
                              )}
                              {selectedProfile.address && (
                                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                                  {selectedProfile.address}
                                </p>
                              )}
                              <p className="text-text-secondary-light dark:text-text-secondary-dark">
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
                  <div className="card p-6">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">
                      You don't have any billing profiles saved yet.
                    </p>
                    <Link
                      href="/my-addresses"
                      className="btn-primary inline-block text-sm"
                    >
                      Create Billing Profile
                    </Link>
                  </div>
                )
              ) : (
                <div className="card p-6">
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
                    Please{" "}
                    <Link href="/login" className="text-accent hover:opacity-80 underline">
                      log in
                    </Link>{" "}
                    to use billing profiles.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/cart"
                className="btn-text text-center py-3 order-2 sm:order-1"
              >
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:flex-1 py-3 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary - Right Column */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6 lg:p-8">
            <h2 className="text-xl font-semibold mb-6 text-text-primary-light dark:text-text-primary-dark tracking-tight">
              Order Summary
            </h2>

            {/* Product List */}
            <div className="space-y-4 mb-6">
              {items.map((item) => {
                const productId = item._id || item.id;
                const itemTotal = (item.price || 0) * item.quantity;

                return (
                  <div
                    key={productId}
                    className="flex justify-between items-start pb-4 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0"
                  >
                    <div className="flex-1 pr-4">
                      <p className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
                        {item.name || "Product"}
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-text-primary-light dark:text-text-primary-dark whitespace-nowrap">
                      {formatPrice(itemTotal)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Shipping Info */}
            <div className="mb-6 pt-4 border-t border-border-light dark:border-border-dark">
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-1">
                Estimated delivery: 3-5 business days
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Shipping included
              </p>
            </div>

            {/* Total */}
            <div className="border-t border-border-light dark:border-border-dark pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">Total</span>
                <span className="text-2xl font-semibold text-accent">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmation
        isVisible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
      />
    </div>
  );
}
