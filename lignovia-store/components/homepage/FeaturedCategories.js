import Link from "next/link";
import Image from "next/image";

/**
 * Minimal Featured Categories Section Component
 * Clean, simple cards with maximum simplicity
 */
export default function FeaturedCategories({ categories = [] }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Limit to 6 categories
  const displayCategories = categories.slice(0, 6);

  return (
    <section className="mb-24 md:mb-32 lg:mb-40">
      {/* Section Header - Minimal */}
      <div className="text-center mb-16 md:mb-20">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
          Featured Categories
        </h2>
        <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light max-w-xl mx-auto">
          Explore our handcrafted collections
        </p>
      </div>

      {/* Categories Grid - Clean spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {displayCategories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug}`}
            className="group relative aspect-[4/3] overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light/30 dark:border-border-dark/30 hover:border-border-light dark:hover:border-border-dark transition-all duration-300 transform hover:translate-y-[-3px] rounded-[10px]"
          >
            {/* Category Image - Minimalist */}
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-hover-light/50 to-surface-light dark:from-hover-dark/50 dark:to-surface-dark flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark opacity-30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              </div>
            )}

            {/* Category Info - Centered, minimal */}
            <div className="absolute inset-0 flex flex-col justify-center items-center px-6 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h3 className="text-xl md:text-2xl font-medium text-white mb-1 text-center">
                {category.name}
              </h3>
              {category.productCount > 0 && (
                <p className="text-sm text-white/80 font-light">
                  {category.productCount} {category.productCount === 1 ? "product" : "products"}
                </p>
              )}
            </div>

            {/* Fallback: Always visible label on bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-sm group-hover:opacity-0 transition-opacity duration-300">
              <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark text-center">
                {category.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
