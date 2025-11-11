import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark mt-auto w-full">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo/logo.png"
                alt="LIGNOVIA"
                width={150}
                height={38}
                className="h-9 md:h-10 w-auto"
              />
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed text-sm">
              Craftsmanship, precision, and serenity. A modern woodcraft studio bringing you
              quality products with elegant design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Quick Links
            </h4>
            <ul className="space-y-2 text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <Link
                  href="/shop"
                  className="hover:text-accent transition-colors duration-smooth text-sm"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-accent transition-colors duration-smooth text-sm"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-accent transition-colors duration-smooth text-sm"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              Account
            </h4>
            <ul className="space-y-2 text-text-secondary-light dark:text-text-secondary-dark">
              <li>
                <Link
                  href="/login"
                  className="hover:text-accent transition-colors duration-smooth text-sm"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-accent transition-colors duration-smooth text-sm"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border-light dark:border-border-dark pt-8 text-center">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            &copy; {new Date().getFullYear()} LIGNOVIA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

