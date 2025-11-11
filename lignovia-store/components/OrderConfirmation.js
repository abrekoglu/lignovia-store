import { useEffect } from "react";

export default function OrderConfirmation({ isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-light dark:bg-surface-dark rounded-softer shadow-soft-lg max-w-md w-full p-8 text-center animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Checkmark Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent"
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
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
          Thank you for your purchase!
        </h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Your order has been successfully placed.
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

