/**
 * Global Container Component for LIGNOVIA Storefront
 * 
 * Provides consistent width, padding, and spacing across all pages.
 * 
 * Features:
 * - Max width: 1400px (premium, airy feel)
 * - Centered with auto margins
 * - Responsive horizontal padding
 * - Generous vertical spacing
 * - Full dark mode support
 * 
 * Usage:
 * <Container>
 *   <YourContent />
 * </Container>
 * 
 * Or with custom spacing:
 * <Container className="py-16">
 *   <YourContent />
 * </Container>
 */

export default function Container({ 
  children, 
  className = "",
  fullWidth = false,
  maxWidth = "container",
  padding = true,
}) {
  // If fullWidth is true, don't apply container constraints
  if (fullWidth) {
    return (
      <div className={`w-full ${className}`}>
        {children}
      </div>
    );
  }

  // Standard container with max-width and padding
  const maxWidthClass = maxWidth === "container" ? "max-w-container" : maxWidth;
  const paddingClasses = padding 
    ? "px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12" 
    : "";

  const containerClasses = `
    w-full
    ${maxWidthClass}
    mx-auto
    ${paddingClasses}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

