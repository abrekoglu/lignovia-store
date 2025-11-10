import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useCartStore from "@/store/cartStore";

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore();
  const cart = useCartStore((state) => state.items);
  const [showMaxStockWarning, setShowMaxStockWarning] = useState(false);

  const stock = product?.stock !== undefined ? product.stock : 0;
  
  // Get product ID
  const productId = product?._id || product?.id;

  // Find current cart quantity for this product
  const cartItem = productId
    ? cart.find((item) => (item._id || item.id) === productId)
    : null;
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isInCart = cartQuantity > 0;

  // Calculate remaining available stock (total stock - quantity in cart)
  const remainingStock = Math.max(0, stock - cartQuantity);
  // Product is out of stock if original stock is 0
  const isOutOfStock = stock === 0;
  // User has added max if cart quantity equals or exceeds stock
  const isMaxAdded = stock > 0 && cartQuantity >= stock;
  // Show low stock warning if remaining stock is low (but not if user added max)
  const isLowStock = remainingStock > 0 && remainingStock <= 5 && !isMaxAdded;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent adding to cart if out of stock
    if (isOutOfStock) {
      return;
    }
    
    if (!productId) {
      console.error("Product missing ID:", product);
      return;
    }

    // Check if adding would exceed stock
    if (remainingStock <= 0) {
      setShowMaxStockWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => setShowMaxStockWarning(false), 3000);
      return;
    }
    
    // Clear warning if it was showing
    setShowMaxStockWarning(false);
    
    const productData = {
      _id: productId, // Store as _id to match MongoDB format
      id: productId,  // Also store as id for compatibility
      name: product?.name,
      price: product?.price,
      image: product?.image,
      slug: product?.slug,
      description: product?.description,
      stock: stock,
    };
    
    addToCart(productData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/product/${product?.slug || "product-slug"}`}>
        <div className="relative h-48 bg-gray-200">
          {product?.image ? (
            <Image
              src={product.image}
              alt={product.name || "Product"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            {product?.name || "Product Name"}
          </h3>
          <p className="text-gray-600 mb-2">
            {product?.description || "Product description"}
          </p>
          <p className="text-xl font-bold text-blue-600 mb-2">
            ${product?.price?.toFixed(2) || "0.00"}
          </p>
          {/* Stock Information */}
          {isOutOfStock ? (
            <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded mb-2">
              Sold Out
            </span>
          ) : isMaxAdded ? (
            <span className="inline-block bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded mb-2">
              Max Added
            </span>
          ) : isLowStock ? (
            <p className="text-sm text-orange-600 font-medium mb-2">
              Only {remainingStock} left
            </p>
          ) : null}
        </div>
      </Link>
      <div className="px-4 pb-4">
        {/* Out of Stock Warning Message */}
        {isOutOfStock && (
          <p className="text-red-600 text-sm font-medium mb-2 mt-2">
            This product is out of stock.
          </p>
        )}
        
        {/* Max Stock Warning Message */}
        {showMaxStockWarning && (
          <p className="text-red-600 text-xs mb-2 mt-2">
            {isMaxAdded ? "Max added" : "You already added the maximum available stock."}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxAdded}
            className={`flex-1 font-bold py-2 px-4 rounded transition-colors duration-200 ${
              isOutOfStock || isMaxAdded
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {isOutOfStock ? "Sold Out" : isMaxAdded ? "Max Added" : "Add to Cart"}
          </button>
          
          {/* In Cart Indicator */}
          {isInCart && !isOutOfStock && (
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
              In Cart: {cartQuantity}
            </span>
          )}
          
          {/* Remaining Stock Indicator (when not max added) */}
          {!isMaxAdded && !isOutOfStock && remainingStock > 0 && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              ({remainingStock} available)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

