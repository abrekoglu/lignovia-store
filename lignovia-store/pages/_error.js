import { useEffect, useState } from "react";
import ErrorPageLayout from "@/components/ErrorPageLayout";
import Head from "next/head";

function Error({ statusCode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default error icon
  const errorIcon = (
    <svg
      className="w-20 h-20 md:w-24 md:h-24"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" strokeLinecap="round" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );

  // Customize based on status code
  let title, subtitle, description, icon, buttonText, buttonHref;

  switch (statusCode) {
    case 404:
      title = "Page Not Found";
      subtitle = "Looks like this page doesn't exist.";
      description = [
        "It may have been moved or removed.",
        "Please check the URL or return to the homepage.",
      ];
      icon = (
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
      buttonText = "Go Back Home";
      buttonHref = "/";
      break;

    case 500:
      title = "Something went wrong.";
      subtitle = "We're experiencing some issues right now.";
      description = [
        "Please try again later.",
        "If the problem persists, contact our support team.",
      ];
      icon = (
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
      buttonText = "Go Back Home";
      buttonHref = "/";
      break;

    case 403:
      title = "Access Restricted";
      subtitle = "You don't have permission to view this page.";
      description = [
        "Please check your account or contact an administrator.",
        "You may need to sign in with the correct account.",
      ];
      icon = (
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
      buttonText = "Go Back Home";
      buttonHref = "/";
      break;

    default:
      title = "An error occurred";
      subtitle = "Something unexpected happened.";
      description = [
        "We're sorry for the inconvenience.",
        "Please try again or return to the homepage.",
      ];
      icon = errorIcon;
      buttonText = "Go Back Home";
      buttonHref = "/";
  }

  return (
    <>
      <Head>
        <title>{title} - LIGNOVIA</title>
      </Head>
      <ErrorPageLayout
        title={title}
        subtitle={subtitle}
        description={description}
        icon={icon}
        buttonText={buttonText}
        buttonHref={buttonHref}
        showReload={statusCode === 500}
        animated={true}
      />
    </>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

