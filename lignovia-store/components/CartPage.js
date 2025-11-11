import Link from "next/link";
import { useState } from "react";
import useCartStore, { useCartTotalPrice } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity } = useCartStore();
  const totalPrice = useCartTotalPrice();
  const [stockWarnings, setStockWarnings] = useState({});

  const getProductId = (item) => item._id || item.id;

  const handleIncreaseQuantity = (productId, currentQuantity, totalStock) => {
    // Check if increasing would exceed stock
    if (currentQuantity >= totalStock) {
      // Show "Max stock reached" warning
      setStockWarnings((prev) => ({
        ...prev,
        [productId]: "max",
      }));
      // Hide warning after 3 seconds
      setTimeout(() => {
        setStockWarnings((prev) => {
          const newWarnings = { ...prev };
          delete newWarnings[productId];
          return newWarnings;
        });
      }, 3000);
      return;
    }
    
    // Clear warning if it was showing
    setStockWarnings((prev) => {
      const newWarnings = { ...prev };
      delete newWarnings[productId];
      return newWarnings;
    });
    
    increaseQuantity(productId);
  };

  return (
    <div>
      <h1 className="text-3xl lg:text-4xl font-semibold mb-8 text-text-primary-light dark:text-text-primary-dark tracking-tight">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg mb-6">Your cart is empty</p>
          <Link
            href="/shop"
            className="btn-primary inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item) => {
              const productId = getProductId(item);
              const itemTotal = (item.price || 0) * item.quantity;
              const totalStock = item.stock !== undefined ? item.stock : 0;
              // Calculate remaining available stock (total stock - current quantity)
              const remainingStock = Math.max(0, totalStock - item.quantity);
              const isMaxQuantity = item.quantity >= totalStock;
              const warningType = stockWarnings[productId];

              return (
                <div
                  key={productId}
                  className="card p-6 flex flex-col md:flex-row gap-4 items-center"
                >
                  {/* Product Name */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                      {item.name || "Product Name"}
                    </h3>
                    <p className="text-lg font-semibold text-accent">
                      ${item.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decreaseQuantity(productId)}
                        className="bg-surface-light dark:bg-surface-dark hover:bg-hover-light dark:hover:bg-hover-dark text-text-primary-light dark:text-text-primary-dark font-semibold py-2 px-4 rounded-soft transition-all duration-smooth border border-border-light dark:border-border-dark"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold w-12 text-center text-text-primary-light dark:text-text-primary-dark">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(productId, item.quantity, totalStock)}
                        disabled={isMaxQuantity && totalStock > 0}
                        className={`font-semibold py-2 px-4 rounded-soft transition-all duration-smooth border border-border-light dark:border-border-dark ${
                          isMaxQuantity && totalStock > 0
                            ? "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                            : "bg-surface-light dark:bg-surface-dark hover:bg-hover-light dark:hover:bg-hover-dark text-text-primary-light dark:text-text-primary-dark"
                        }`}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Stock Information */}
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        Available: {remainingStock}
                      </p>
                      
                      {/* Stock Warning */}
                      {warningType === "max" && (
                        <p className="text-xs text-error-light dark:text-error-dark font-medium">
                          Max stock reached
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">Total</p>
                    <p className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(productId)}
                    className="btn-text text-error-light dark:text-error-dark hover:text-error-light dark:hover:text-error-dark"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total Cart Price */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">Total</h2>
              <p className="text-3xl font-semibold text-accent">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="flex-1 btn-secondary text-center py-3"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 btn-primary text-center py-3"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

