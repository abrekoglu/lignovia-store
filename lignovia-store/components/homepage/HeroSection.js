"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Minimal Hero Section Component
 * Clean, compact, premium minimalism
 */
export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden bg-bg-light dark:bg-bg-dark"
      style={{
        minHeight: "clamp(45vh, 50vw, 55vh)", // Mobile: 45-55%
      }}
    >
      {/* Soft Background - Minimal */}
      <div className="absolute inset-0 z-0">
        {/* Soft warm background with very subtle texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF9] via-[#FAF8F5] to-[#F5F2EF] dark:from-[#1E1A17] dark:via-[#221E1A] dark:to-[#29231F]">
          {/* Very subtle background image - barely visible */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
            style={{
              backgroundImage: "url('/images/products/images.jpg')",
              filter: "grayscale(100%) brightness(1.1)",
            }}
          ></div>
          
          {/* Very light gradient overlay - barely visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-light/30 dark:to-bg-dark/30"></div>
        </div>
      </div>

      {/* Content - Centered, Compact */}
      <div 
        className={`relative z-10 container mx-auto px-6 md:px-12 lg:px-16 transition-opacity duration-500 ease-out flex items-center ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          minHeight: "clamp(45vh, 50vw, 55vh)", // Mobile: 45-55%
        }}
      >
        <div className="max-w-2xl mx-auto w-full text-center py-12 md:py-16 lg:py-20">
          {/* Main Headline - Medium-large, NOT huge */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-text-primary-light dark:text-text-primary-dark mb-3 md:mb-4 leading-tight tracking-tight">
            Handcrafted Wood Design
          </h1>
          
          {/* Subheadline - One clean line */}
          <p className="text-base md:text-lg text-text-secondary-light dark:text-text-secondary-dark font-light mb-6 md:mb-8 max-w-lg mx-auto leading-relaxed">
            Modern craftsmanship made for everyday living.
          </p>

          {/* Single Primary Button - Compact */}
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 md:px-7 md:py-3 bg-accent text-white font-medium hover:bg-accent/90 transition-colors duration-300 rounded-[8px] text-sm md:text-base"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Subtle bottom border - optional */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border-light/20 dark:bg-border-dark/20"></div>
    </section>
  );
}
