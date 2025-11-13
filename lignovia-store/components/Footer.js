import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 500);
  };

  if (!mounted) {
    return (
      <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto w-full">
        <div className="container mx-auto px-4 lg:px-6 py-16">
          <div className="h-64" />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto w-full footer-fade-in">
      <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">
          {/* Shop Section */}
          <div className="space-y-4">
            <h3 className="text-overline">
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=new"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=bestsellers"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=categories"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="text-overline">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-overline">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-body-sm hover:text-accent transition-colors duration-300 ease-out"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="space-y-4">
            <h3 className="text-overline">
              Stay in the Loop
            </h3>
            <p className="text-body-sm">
              Join our newsletter for updates on new products, exclusive offers, and woodcraft stories.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  placeholder="Your email address"
                  className={`
                    w-full px-4 py-3
                    bg-hover-light dark:bg-hover-dark
                    border border-border-light dark:border-border-dark
                    rounded-[12px]
                    text-body
                    placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                    focus:outline-none
                    transition-all duration-300 ease-out
                    ${isEmailFocused ? "ring-2 ring-accent/30 border-accent shadow-md" : ""}
                  `}
                  required
                  disabled={isSubmitting || isSubmitted}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                  className={`
                  w-full px-6 py-3
                  bg-accent hover:bg-accent/90
                  text-white
                  rounded-[12px]
                  text-button
                  transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-0
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isSubmitting || isSubmitted ? "" : "hover:scale-[1.02] active:scale-[0.98]"}
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Subscribing...
                  </span>
                ) : isSubmitted ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Subscribed!
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
              {isSubmitted && (
                <p className="text-small text-success-light dark:text-success-dark text-center animate-fade-in">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-light dark:border-border-dark pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="flex items-center gap-2">
              <p className="text-small">
                &copy; {new Date().getFullYear()} LIGNOVIA. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/lignovia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-300 ease-out"
                aria-label="Instagram"
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
                    d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0v1.5a3 3 0 11-6 0V12m6 0h.008v.008H16.5V12z"
                  />
                </svg>
              </a>
              <a
                href="https://facebook.com/lignovia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-300 ease-out"
                aria-label="Facebook"
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
                    d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"
                  />
                </svg>
              </a>
              <a
                href="https://twitter.com/lignovia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-300 ease-out"
                aria-label="Twitter"
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
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
              <a
                href="https://pinterest.com/lignovia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-300 ease-out"
                aria-label="Pinterest"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.219-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.001 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
