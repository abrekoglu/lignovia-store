import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";

export default function ErrorPageLayout({
  title,
  subtitle,
  description,
  icon,
  buttonText = "Go Back Home",
  buttonHref = "/",
  showReload = false,
  animated = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>{title} - LIGNOVIA</title>
      </Head>
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center px-4 py-12">
        <div
          className={`
            w-full max-w-[560px]
            bg-surface-light dark:bg-surface-dark
            rounded-[20px]
            shadow-soft dark:shadow-soft-dark
            p-10 md:p-14
            text-center
            transition-all duration-300
            ${mounted && animated ? "opacity-100 scale-100" : "opacity-0 scale-95"}
          `}
        >
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/images/logo/logo.png"
              alt="LIGNOVIA"
              width={200}
              height={60}
              className="h-12 md:h-14 w-auto"
              priority
            />
          </div>

          {/* Icon */}
          {icon && (
            <div className="mb-6 flex justify-center">
              <div className="text-accent">{icon}</div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-lg md:text-xl font-medium text-text-secondary-light dark:text-text-secondary-dark mb-3">
              {subtitle}
            </p>
          )}

          {/* Description */}
          {description && (
            <div className="mb-8 space-y-2">
              {Array.isArray(description) ? (
                description.map((line, index) => (
                  <p
                    key={index}
                    className="text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed"
                  >
                    {line}
                  </p>
                ))
              ) : (
                <p className="text-base text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {buttonHref && (
              <Link
                href={buttonHref}
                className="
                  w-full sm:w-auto
                  px-8 py-3
                  bg-accent
                  text-white
                  rounded-[12px]
                  font-medium
                  transition-all duration-200
                  hover:bg-accent/90
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-2
                  focus:ring-accent/30
                "
              >
                {buttonText}
              </Link>
            )}
            {showReload && (
              <button
                onClick={() => window.location.reload()}
                className="
                  w-full sm:w-auto
                  px-8 py-3
                  bg-surface-light dark:bg-surface-dark
                  border border-border-light dark:border-border-dark
                  text-text-primary-light dark:text-text-primary-dark
                  rounded-[12px]
                  font-medium
                  transition-all duration-200
                  hover:bg-hover-light dark:hover:bg-hover-dark
                  focus:outline-none
                  focus:ring-2
                  focus:ring-accent/30
                "
              >
                Reload
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


