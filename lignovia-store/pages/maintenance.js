import { useEffect, useState } from "react";
import ErrorPageLayout from "@/components/ErrorPageLayout";

export default function Maintenance() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Maintenance Icon - Soft gear/wrench with subtle animation
  const iconMaintenance = (
    <div className="relative">
      <svg
        className={`w-20 h-20 md:w-24 md:h-24 ${
          mounted ? "animate-spin-slow" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" />
      </svg>
      {/* Subtle shimmer overlay */}
      <div
        className={`
          absolute inset-0
          rounded-full
          opacity-30
        `}
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(200, 169, 139, 0.2) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: mounted ? "shimmer 2s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );

  return (
    <>
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
      <ErrorPageLayout
        title="We're crafting your experience…"
        subtitle="The system is undergoing maintenance."
        description={[
          "We'll be back shortly.",
          "Thank you for your patience.",
        ]}
        icon={iconMaintenance}
        buttonText="Check Again"
        buttonHref="/"
        showReload={true}
        animated={true}
      />
    </>
  );
}

