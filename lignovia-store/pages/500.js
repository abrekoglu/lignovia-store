import ErrorPageLayout from "@/components/ErrorPageLayout";

export default function ServerError() {
  // 500 Icon - Minimal broken circle/box
  const icon500 = (
    <svg
      className="w-20 h-20 md:w-24 md:h-24"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" />
      <path d="M9 9h6M9 15h6" strokeLinecap="round" />
      <path d="M3 3l18 18" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );

  return (
    <ErrorPageLayout
      title="Something went wrong."
      subtitle="We're experiencing some issues right now."
      description={[
        "Please try again later.",
        "If the problem persists, contact our support team.",
      ]}
      icon={icon500}
      buttonText="Go Back Home"
      buttonHref="/"
      showReload={true}
      animated={true}
    />
  );
}


