import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import useCartStore from "@/store/cartStore";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <nav className="container mx-auto px-4 lg:px-6">
        <div className="flex justify-between items-center py-5">
          {/* Logo - Centered */}
          <Link
            href="/"
            className="flex items-center transition-opacity duration-smooth hover:opacity-80"
            onClick={handleLinkClick}
          >
            <Image
              src="/images/logo/logo.png"
              alt="LIGNOVIA"
              width={200}
              height={48}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation - Hidden on mobile, visible on md and above */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/shop"
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium transition-colors duration-smooth"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="relative text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium transition-colors duration-smooth flex items-center"
            >
              {/* Cart Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a4.5 4.5 0 00-4.5 4.5c0 1.656 1.343 3 3 3h13.5c1.656 0 3-1.344 3-3 0-2.485-2.019-4.5-4.5-4.5S9 15.765 9 18.25c0 1.656 1.343 3 3 3h.75m0 0h.008v.008H12v-.008zm-3 0h.375v.008H9v-.008zm-3 0h.375v.008H6v-.008z"
                />
              </svg>
              {/* Cart Badge */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </Link>
            {status === "loading" ? (
              <span className="text-text-secondary-light dark:text-text-secondary-dark">Loading...</span>
            ) : session ? (
              <>
                <Link
                  href="/my-orders"
                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium transition-colors duration-smooth"
                >
                  My Orders
                </Link>
                <Link
                  href="/my-addresses"
                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium transition-colors duration-smooth"
                >
                  My Addresses
                </Link>
                <span className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm">
                  {session.user?.name || session.user?.email}
                </span>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin/orders"
                    className="text-accent hover:opacity-80 font-medium transition-colors duration-smooth"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="btn-text text-error-light dark:text-error-dark hover:text-error-light dark:hover:text-error-dark"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium transition-colors duration-smooth"
              >
                Login
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded-soft p-2 transition-colors duration-smooth"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
            {isMobileMenuOpen ? (
              // Close icon (X)
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
          </div>
        </div>

        {/* Mobile Menu - Stacked vertically, shown when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-light dark:border-border-dark py-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/shop"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium py-2 transition-colors duration-smooth"
                onClick={handleLinkClick}
              >
                Shop
              </Link>
              <Link
                href="/cart"
                className="relative text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium py-2 transition-colors duration-smooth flex items-center"
                onClick={handleLinkClick}
              >
                {/* Cart Icon */}
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a4.5 4.5 0 00-4.5 4.5c0 1.656 1.343 3 3 3h13.5c1.656 0 3-1.344 3-3 0-2.485-2.019-4.5-4.5-4.5S9 15.765 9 18.25c0 1.656 1.343 3 3 3h.75m0 0h.008v.008H12v-.008zm-3 0h.375v.008H9v-.008zm-3 0h.375v.008H6v-.008z"
                  />
                </svg>
                Cart
                {/* Cart Badge */}
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-accent text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
              {status === "loading" ? (
                <span className="text-text-secondary-light dark:text-text-secondary-dark py-2">Loading...</span>
              ) : session ? (
                <>
                  <Link
                    href="/my-orders"
                    className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium py-2 transition-colors duration-smooth"
                    onClick={handleLinkClick}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/my-addresses"
                    className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium py-2 transition-colors duration-smooth"
                    onClick={handleLinkClick}
                  >
                    My Addresses
                  </Link>
                  <div className="text-text-secondary-light dark:text-text-secondary-dark font-medium py-2 border-t border-border-light dark:border-border-dark pt-4">
                    {session.user?.name || session.user?.email}
                  </div>
                  {session.user?.isAdmin && (
                    <Link
                      href="/admin/orders"
                      className="text-accent hover:opacity-80 font-medium py-2 transition-colors duration-smooth"
                      onClick={handleLinkClick}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="btn-text text-error-light dark:text-error-dark hover:text-error-light dark:hover:text-error-dark text-left py-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent font-medium py-2 transition-colors duration-smooth"
                  onClick={handleLinkClick}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

