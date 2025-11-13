/**
 * Section Component for LIGNOVIA Storefront
 * 
 * Provides consistent vertical spacing between major sections.
 * 
 * Features:
 * - Generous vertical padding
 * - Responsive spacing adjustments
 * - Optional background colors
 * - Full dark mode support
 * 
 * Usage:
 * <Section>
 *   <YourSectionContent />
 * </Section>
 * 
 * Or with custom spacing:
 * <Section className="py-20">
 *   <YourSectionContent />
 * </Section>
 */

export default function Section({ 
  children, 
  className = "",
  padding = true,
  paddingY = "default",
  background = "transparent",
}) {
  // Determine vertical padding
  let paddingClasses = "";
  if (padding) {
    switch (paddingY) {
      case "small":
        paddingClasses = "py-8 md:py-12 lg:py-16";
        break;
      case "large":
        paddingClasses = "py-16 md:py-20 lg:py-24 xl:py-28";
        break;
      case "none":
        paddingClasses = "";
        break;
      default: // "default"
        paddingClasses = "py-12 md:py-16 lg:py-20 xl:py-24";
    }
  }

  // Determine background
  let backgroundClasses = "";
  switch (background) {
    case "surface":
      backgroundClasses = "bg-surface-light dark:bg-surface-dark";
      break;
    case "hover":
      backgroundClasses = "bg-hover-light dark:bg-hover-dark";
      break;
    case "transparent":
    default:
      backgroundClasses = "";
  }

  const sectionClasses = `
    w-full
    ${paddingClasses}
    ${backgroundClasses}
    ${className}
  `.trim().replace(/\s+/g, " ");

  return (
    <section className={sectionClasses}>
      {children}
    </section>
  );
}

