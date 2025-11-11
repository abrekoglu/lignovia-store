import { useEffect, useState } from "react";

export default function CartToast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto-close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="bg-accent/95 backdrop-blur-sm text-white px-5 py-2.5 rounded-softer shadow-soft-lg flex items-center gap-2.5 min-w-[240px] max-w-[90vw]">
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <p className="text-sm font-medium flex-1">{message}</p>
      </div>
    </div>
  );
}

