import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatPrice } from "@/utils/priceUtils";

/**
 * Search Suggestions Component
 * Displays live search suggestions in a dropdown
 */
export default function SearchSuggestions({
  query,
  isOpen,
  onClose,
  onSelect,
}) {
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const suggestionsRef = useRef(null);

  // Fetch suggestions when query changes (debounced)
  useEffect(() => {
    if (!query || query.length < 2 || !isOpen) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const fetchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success && result.data) {
          setSuggestions(result.data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !query || query.length < 2) {
    return null;
  }

  const hasSuggestions =
    (suggestions.products && suggestions.products.length > 0) ||
    (suggestions.categories && suggestions.categories.length > 0);

  if (!hasSuggestions && !loading) {
    return null;
  }

  const handleSuggestionClick = (type, item) => {
    if (type === "product") {
      router.push(`/product/${item.slug}`);
    } else if (type === "category") {
      router.push(`/category/${item.slug}`);
    }
    onSelect();
  };

  const handleViewAllClick = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onSelect();
  };

  return (
    <div
      ref={suggestionsRef}
      className={`
        absolute top-full left-0 right-0 mt-2
        bg-surface-light dark:bg-surface-dark
        border border-border-light dark:border-border-dark
        rounded-[12px]
        shadow-lg
        z-50
        max-h-[400px]
        overflow-y-auto
        modal-content-enter
      `}
    >
      {loading ? (
        <div className="p-4 text-center text-text-secondary-light dark:text-text-secondary-dark">
          <div className="animate-pulse">Searching...</div>
        </div>
      ) : hasSuggestions ? (
        <div className="py-2">
          {/* Products Section */}
          {suggestions.products && suggestions.products.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Products
              </div>
              {suggestions.products.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug}`}
                  onClick={() => handleSuggestionClick("product", product)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200 cursor-pointer"
                >
                  {product.mainImage ? (
                    <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-hover-light dark:bg-hover-dark flex-shrink-0">
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-[8px] bg-hover-light dark:bg-hover-dark flex-shrink-0 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                      {product.name}
                    </div>
                    {product.price && (
                      <div className="text-xs text-accent font-semibold">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Categories Section */}
          {suggestions.categories && suggestions.categories.length > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                Categories
              </div>
              {suggestions.categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  onClick={() => handleSuggestionClick("category", category)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200 cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Results */}
          <div className="border-t border-border-light dark:border-border-dark mt-2 pt-2">
            <button
              onClick={handleViewAllClick}
              className="w-full px-4 py-2.5 text-sm font-medium text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200 text-left"
            >
              View all results for &quot;{query}&quot;
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

