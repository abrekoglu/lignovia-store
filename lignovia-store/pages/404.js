import ErrorPageLayout from "@/components/ErrorPageLayout";

export default function NotFound() {
  // 404 Icon - Minimal compass/circle
  const icon404 = (
    <svg
      className="w-20 h-20 md:w-24 md:h-24"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" strokeLinecap="round" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  );

  return (
    <ErrorPageLayout
      title="Page Not Found"
      subtitle="Looks like this page doesn't exist."
      description={[
        "It may have been moved or removed.",
        "Please check the URL or return to the homepage.",
      ]}
      icon={icon404}
      buttonText="Go Back Home"
      buttonHref="/"
      animated={true}
    />
  );
}


