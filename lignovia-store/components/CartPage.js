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
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200"
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
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row gap-4 items-center"
                >
                  {/* Product Name */}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.name || "Product Name"}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      ${item.price?.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => decreaseQuantity(productId)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded transition-colors duration-200"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold w-12 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseQuantity(productId, item.quantity, totalStock)}
                        disabled={isMaxQuantity && totalStock > 0}
                        className={`font-bold py-2 px-4 rounded transition-colors duration-200 ${
                          isMaxQuantity && totalStock > 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                        }`}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Stock Information */}
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-xs text-gray-600">
                        Available: {remainingStock}
                      </p>
                      
                      {/* Stock Warning */}
                      {warningType === "max" && (
                        <p className="text-xs text-red-600 font-medium">
                          Max stock reached
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      ${itemTotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(productId)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total Cart Price */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Total</h2>
              <p className="text-3xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/shop"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href="/checkout"
              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

