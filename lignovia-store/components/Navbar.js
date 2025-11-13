import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import ThemeToggle from "./ThemeToggle";
import useCartStore from "@/store/cartStore";
import CategoryMenu from "./CategoryMenu";
import CategoryMenuMobile from "./CategoryMenuMobile";
import SearchSuggestions from "./SearchSuggestions";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const cartItems = useCartStore((state) => state.items);
  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  const [prevCartCount, setPrevCartCount] = useState(cartItemCount);
  const [isCartBadgeAnimating, setIsCartBadgeAnimating] = useState(false);
  
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Handle scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle cart badge animation
  useEffect(() => {
    if (cartItemCount > prevCartCount && cartItemCount > 0) {
      setIsCartBadgeAnimating(true);
      setTimeout(() => {
        setIsCartBadgeAnimating(false);
      }, 300);
    }
    setPrevCartCount(cartItemCount);
  }, [cartItemCount, prevCartCount]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    if (isUserDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isUserDropdownOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu or search modal is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchModalOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchModalOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearchModalOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchModalOpen(false);
      setShowSuggestions(false);
      setSearchQuery("");
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.trim().length >= 2);
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (searchQuery.trim().length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setIsSearchFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionSelect = () => {
    setShowSuggestions(false);
    setIsSearchModalOpen(false);
    setSearchQuery("");
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          bg-surface-light dark:bg-surface-dark
          border-b border-border-light dark:border-border-dark
          transition-all duration-300 ease-out
          ${isScrolled ? "shadow-md" : "shadow-sm"}
        `}
      >
        <nav className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Left */}
            <Link
              href="/"
              className="flex items-center transition-opacity duration-200 hover:opacity-80 flex-shrink-0"
              onClick={handleLinkClick}
            >
              <Image
                src="/images/logo/logo.png"
                alt="LIGNOVIA"
                width={180}
                height={48}
                className="h-10 md:h-12 w-auto"
                priority
              />
            </Link>

            {/* Categories Menu - Desktop */}
            <div className="hidden lg:block">
              <CategoryMenu />
            </div>

            {/* Search Bar - Center (Desktop Only) */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative">
              <form onSubmit={handleSearch} className="w-full">
                <div
                  className={`
                    relative flex items-center
                    bg-hover-light dark:bg-hover-dark
                    border border-border-light dark:border-border-dark
                    rounded-[12px]
                    transition-all duration-300 ease-out
                    ${isSearchFocused ? "ring-2 ring-accent/30 shadow-md" : ""}
                  `}
                >
                  <button
                    type="submit"
                    className="absolute left-4 p-2 text-accent hover:text-accent/80 transition-colors duration-200 z-10"
                    aria-label="Search"
                  >
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
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search products..."
                    className="w-full pl-12 pr-4 py-3 bg-transparent text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none text-sm"
                  />
                </div>
              </form>
              {/* Search Suggestions Dropdown */}
              <SearchSuggestions
                query={searchQuery}
                isOpen={showSuggestions && isSearchFocused}
                onClose={() => setShowSuggestions(false)}
                onSelect={handleSuggestionSelect}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Search Icon - Mobile Only */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="lg:hidden p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                aria-label="Search"
              >
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
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                onClick={handleLinkClick}
              >
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
                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h-.375a.75.75 0 010-1.5H7.5a.75.75 0 01.75.75zm7.5 0a.75.75 0 01-.75.75h-.375a.75.75 0 010-1.5H15a.75.75 0 01.75.75z"
                  />
                </svg>
                {/* Cart Badge */}
                {cartItemCount > 0 && (
                  <span
                    className={`
                      absolute -top-1 -right-1
                      bg-accent text-white
                      text-xs font-semibold
                      rounded-full
                      w-5 h-5
                      flex items-center justify-center
                      min-w-[20px]
                      transition-transform duration-300 ease-out
                      ${isCartBadgeAnimating ? "scale-125" : "scale-100"}
                    `}
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Account Icon */}
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-[10px] bg-hover-light dark:bg-hover-dark animate-pulse" />
              ) : session ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                    aria-label="User menu"
                    aria-expanded={isUserDropdownOpen}
                  >
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
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown */}
                  {isUserDropdownOpen && (
                    <div
                      className={`
                        absolute right-0 top-full mt-2
                        w-56
                        bg-surface-light dark:bg-surface-dark
                        border border-border-light dark:border-border-dark
                        rounded-[14px]
                        shadow-md
                        overflow-hidden
                        modal-content-enter
                      `}
                    >
                      <div className="p-2">
                        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
                          <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            {session.user?.email}
                          </p>
                        </div>
                        <Link
                          href="/my-orders"
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                        >
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
                              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                            />
                          </svg>
                          My Orders
                        </Link>
                        <Link
                          href="/my-addresses"
                          onClick={handleLinkClick}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                        >
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
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                            />
                          </svg>
                          My Addresses
                        </Link>
                        {session.user?.isAdmin && (
                          <Link
                            href="/admin/dashboard"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-accent/10 dark:hover:bg-accent/20 rounded-[10px] transition-colors duration-200"
                          >
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
                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                              />
                            </svg>
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-body-sm text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-[10px] transition-colors duration-200 text-left"
                        >
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
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-[10px] text-button hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                  onClick={handleLinkClick}
                >
                  Sign In
                </Link>
              )}

              {/* Hamburger Menu - Mobile Only */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 modal-backdrop-enter"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            ref={mobileMenuRef}
            className={`
              fixed top-0 right-0 bottom-0
              w-80 max-w-[85vw]
              bg-surface-light dark:bg-surface-dark
              border-l border-border-light dark:border-border-dark
              shadow-xl
              z-50
              overflow-y-auto
              modal-content-enter-mobile
            `}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-heading-4">
                  Menu
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-[10px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                >
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
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  Home
                </Link>
                <Link
                  href="/shop"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                >
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
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.25 10.5a.75.75 0 01-.75.75h-.375a.75.75 0 010-1.5H7.5a.75.75 0 01.75.75zm7.5 0a.75.75 0 01-.75.75h-.375a.75.75 0 010-1.5H15a.75.75 0 01.75.75z"
                    />
                  </svg>
                  Shop
                </Link>
                {/* Categories Menu - Mobile */}
                <div className="border-b border-border-light dark:border-border-dark pb-2 mb-2">
                  <div className="px-4 py-2 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wide">
                      Categories
                    </h3>
                  </div>
                  <CategoryMenuMobile onCategoryClick={handleLinkClick} />
                </div>
                {session && (
                  <>
                    <Link
                      href="/my-orders"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                    >
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
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                        />
                      </svg>
                      My Orders
                    </Link>
                    <Link
                      href="/my-addresses"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                    >
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
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                      My Addresses
                    </Link>
                    {session.user?.isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-4 py-3 text-accent hover:bg-accent/10 dark:hover:bg-accent/20 rounded-[10px] transition-colors duration-200"
                      >
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
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                          />
                        </svg>
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 rounded-[10px] transition-colors duration-200 text-left"
                    >
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
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                      </svg>
                      Logout
                    </button>
                  </>
                )}
                {!session && (
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark rounded-[10px] transition-colors duration-200"
                  >
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
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Search Modal - Mobile Only */}
      {isSearchModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 modal-backdrop-enter"
            onClick={() => setIsSearchModalOpen(false)}
          />
          <div
            className={`
              fixed top-0 left-0 right-0
              bg-surface-light dark:bg-surface-dark
              border-b border-border-light dark:border-border-dark
              shadow-lg
              z-50
              p-4
              modal-content-enter-mobile
            `}
          >
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative flex items-center">
                <button
                  type="submit"
                  className="absolute left-4 p-2 text-accent hover:text-accent/80 transition-colors duration-200"
                  aria-label="Search"
                >
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
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-4 p-2 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors duration-200 z-10"
                  aria-label="Close search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </form>
            {/* Mobile Search Suggestions */}
            {showSuggestions && (
              <div className="relative mt-2">
                <SearchSuggestions
                  query={searchQuery}
                  isOpen={showSuggestions}
                  onClose={() => setShowSuggestions(false)}
                  onSelect={handleSuggestionSelect}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
