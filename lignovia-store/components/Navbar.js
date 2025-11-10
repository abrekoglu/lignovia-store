import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-white shadow-lg">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors duration-200"
            onClick={handleLinkClick}
          >
            Lignovia Store
          </Link>

          {/* Desktop Navigation - Hidden on mobile, visible on md and above */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/shop"
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Shop
            </Link>
            <Link
              href="/cart"
              className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Cart
            </Link>
            {status === "loading" ? (
              <span className="text-gray-500">Loading...</span>
            ) : session ? (
              <>
                <Link
                  href="/my-orders"
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  My Orders
                </Link>
                <Link
                  href="/my-addresses"
                  className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                >
                  My Addresses
                </Link>
                <span className="text-gray-600 font-medium">
                  {session.user?.name || session.user?.email}
                </span>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin/orders"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - Visible on mobile, hidden on md and above */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-2 transition-colors duration-200"
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

        {/* Mobile Menu - Stacked vertically, shown when hamburger is clicked */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/shop"
                className="text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
                onClick={handleLinkClick}
              >
                Shop
              </Link>
              <Link
                href="/cart"
                className="text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
                onClick={handleLinkClick}
              >
                Cart
              </Link>
              {status === "loading" ? (
                <span className="text-gray-500 py-2">Loading...</span>
              ) : session ? (
                <>
                  <Link
                    href="/my-orders"
                    className="text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
                    onClick={handleLinkClick}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/my-addresses"
                    className="text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
                    onClick={handleLinkClick}
                  >
                    My Addresses
                  </Link>
                  <div className="text-gray-600 font-medium py-2 border-t border-gray-200 pt-4">
                    {session.user?.name || session.user?.email}
                  </div>
                  {session.user?.isAdmin && (
                    <Link
                      href="/admin/orders"
                      className="text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors duration-200"
                      onClick={handleLinkClick}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200 text-left w-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors duration-200"
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

