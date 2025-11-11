import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import useCartStore from "@/store/cartStore";
import CartToast from "./CartToast";

export default function ProductCard({ product, onAddToCart }) {
  const { addToCart } = useCartStore();
  const cart = useCartStore((state) => state.items);
  const [showMaxStockWarning, setShowMaxStockWarning] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
    
    // Show toast notification
    setShowToast(true);
    
    // Notify parent component if callback provided
    if (onAddToCart) {
      onAddToCart();
    }
  };

  return (
    <div className="card-hover overflow-hidden p-0 flex flex-col h-full">
      {/* Image Area - Fixed Height */}
      <Link href={`/product/${product?.slug || "product-slug"}`}>
        <div className="relative h-48 bg-surface-light dark:bg-surface-dark flex-shrink-0">
          {product?.image ? (
            <Image
              src={product.image}
              alt={product.name || "Product"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-secondary-light dark:text-text-secondary-dark">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Content Area - Flexible, grows to fill space */}
      <div className="flex flex-col flex-1 p-5 min-h-0">
        {/* Title + Description Area - Flexible */}
        <div className="flex-1 mb-5 min-h-0">
          <Link href={`/product/${product?.slug || "product-slug"}`}>
            <h3 className="text-lg font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark line-clamp-2">
              {product?.name || "Product Name"}
            </h3>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed line-clamp-2">
              {product?.description || "Product description"}
            </p>
          </Link>
        </div>

        {/* Price + Stock Badge Row - Fixed Position */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <p className="text-xl font-semibold text-accent">
            ${product?.price?.toFixed(2) || "0.00"}
          </p>
          {/* Stock Badge */}
          {isOutOfStock ? (
            <span className="badge bg-error-light dark:bg-error-dark text-white text-xs">
              Sold Out
            </span>
          ) : isMaxAdded ? (
            <span className="badge bg-accent/20 text-accent text-xs">
              Max Added
            </span>
          ) : null}
        </div>

        {/* Fixed Lower Section - Stock Message + Button */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          {/* Stock Warning Message - Always Reserved Space */}
          <div className="h-5 flex items-center">
            {isOutOfStock ? (
              <p className="text-error-light dark:text-error-dark text-xs font-medium">
                Out of stock
              </p>
            ) : showMaxStockWarning ? (
              <p className="text-error-light dark:text-error-dark text-xs font-medium">
                {isMaxAdded ? "Max added" : "Max stock reached"}
              </p>
            ) : isLowStock ? (
              <p className="text-error-light dark:text-error-dark text-xs font-medium">
                Only {remainingStock} left
              </p>
            ) : (
              <div className="h-5"></div> // Spacer to maintain consistent height
            )}
          </div>

          {/* Add to Cart Button - Always Fully Visible */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isMaxAdded}
            className={`w-full py-2.5 px-4 rounded-soft transition-all duration-smooth font-semibold flex-shrink-0 ${
              isOutOfStock || isMaxAdded
                ? "bg-border-light dark:bg-border-dark text-text-secondary-light dark:text-text-secondary-dark cursor-not-allowed"
                : "btn-primary"
            }`}
          >
            {isOutOfStock ? "Sold Out" : isMaxAdded ? "Max Added" : "Add to Cart"}
          </button>
        </div>
      </div>
      
      {/* Cart Toast Notification */}
      <CartToast
        message="Product added to your cart"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

