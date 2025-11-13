import Link from "next/link";
import Image from "next/image";

/**
 * Minimal Brand Story Section Component
 * Clean two-column layout with soft image
 */
export default function BrandStory() {
  return (
    <section className="mb-24 md:mb-32 lg:mb-40">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20">
        {/* Left - Soft Image */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] order-2 lg:order-1 overflow-hidden rounded-[10px] bg-surface-light dark:bg-surface-dark">
          {/* Calm woodworking image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EF] via-[#EFE8E2] to-[#E5DED7] dark:from-[#29231F] dark:via-[#2E2722] dark:to-[#3B332C]">
            {/* Background image - muted */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-[0.15]"
              style={{
                backgroundImage: "url('/images/products/images.jpg')",
                filter: "grayscale(20%)",
              }}
            ></div>
          </div>
        </div>

        {/* Right - Clean Text Block */}
        <div className="flex flex-col justify-center order-1 lg:order-2">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-text-primary-light dark:text-text-primary-dark mb-6 md:mb-8 tracking-tight">
            Our Story
          </h2>
          
          <div className="space-y-5 md:space-y-6 mb-8 md:mb-10">
            <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light leading-relaxed">
              At LIGNOVIA, we believe in the timeless beauty of handcrafted wood. Every piece we create tells a story of dedication, precision, and passion for the craft.
            </p>
            <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light leading-relaxed">
              Our artisans combine traditional techniques with modern design sensibilities, resulting in products that are both functional and beautiful. Each creation is made to last, honoring the natural material it comes from.
            </p>
            <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light leading-relaxed">
              We source only the finest materials, ensuring that every item in our collection meets the highest standards of quality and craftsmanship.
            </p>
          </div>

          {/* Simple Link */}
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-accent font-light hover:text-accent/80 transition-colors duration-300 text-base md:text-lg self-start"
          >
            <span>Learn More</span>
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
      </div>
    </section>
  );
}
