import Link from "next/link";
import ProductCard from "@/components/ProductCard";

/**
 * Minimal Product Section Component
 * Clean grid with maximum whitespace
 */
export default function ProductSection({
  title,
  subtitle,
  products = [],
  viewAllLink,
  viewAllText = "View All",
}) {
  if (!products || products.length === 0) {
    return null;
  }

  // Limit to 8 products
  const displayProducts = products.slice(0, 8);

  return (
    <section className="mb-24 md:mb-32 lg:mb-40">
      {/* Section Header - Minimal */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 md:mb-20">
        <div className="mb-6 md:mb-0">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-text-primary-light dark:text-text-primary-dark mb-3 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* View All Link - Minimal */}
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="hidden md:inline-flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-light transition-colors duration-300 text-base"
          >
            <span>{viewAllText}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Products Grid - Generous spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {displayProducts.map((product) => (
          <div
            key={product._id || product.id}
            className="transform transition-opacity duration-300 hover:opacity-90"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Mobile View All Button */}
      {viewAllLink && (
        <div className="flex justify-center mt-12 md:hidden">
          <Link
            href={viewAllLink}
            className="inline-flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-light transition-colors duration-300 text-base"
          >
            <span>{viewAllText}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
