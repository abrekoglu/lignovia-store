import ErrorPageLayout from "@/components/ErrorPageLayout";
import { useRouter } from "next/router";

export default function Unauthorized() {
  const router = useRouter();
  const isAdminPage = router.pathname?.startsWith("/admin");

  // 403 Icon - Minimal lock/shield
  const icon403 = (
    <svg
      className="w-20 h-20 md:w-24 md:h-24"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
    </svg>
  );

  return (
    <ErrorPageLayout
      title="Access Restricted"
      subtitle="You don't have permission to view this page."
      description={[
        "Please check your account or contact an administrator.",
        isAdminPage
          ? "Admin access is required for this section."
          : "You may need to sign in with the correct account.",
      ]}
      icon={icon403}
      buttonText={isAdminPage ? "Return to Dashboard" : "Go Back Home"}
      buttonHref={isAdminPage ? "/admin/dashboard" : "/"}
      animated={true}
    />
  );
}


