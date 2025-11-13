import { useEffect, useState, useCallback } from "react";

const ToastVariants = {
  success: {
    bg: "bg-[#E9F5EE] dark:bg-[#233029]",
    border: "border-[#4F8A5E]/20 dark:border-[#4F8A5E]/30",
    icon: "text-[#4F8A5E] dark:text-[#5FA374]",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bg: "bg-[#F7E8E6] dark:bg-[#3B1F1E]",
    border: "border-[#B35B4E]/20 dark:border-[#B35B4E]/30",
    icon: "text-[#B35B4E] dark:text-[#CC6C5E]",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-[#F6EFE5] dark:bg-[#2E2722]",
    border: "border-[#C8A98B]/20 dark:border-[#C8A98B]/30",
    icon: "text-[#C8A98B] dark:text-[#C8A98B]",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-[#F5F2EF] dark:bg-[#29231F]",
    border: "border-[#E5DED7] dark:border-[#3B332C]",
    icon: "text-[#C8A98B] dark:text-[#C8A98B]",
    iconSvg: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function Toast({ id, message, variant = "info", duration = 4000, onClose, persistent = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const toastStyle = ToastVariants[variant] || ToastVariants.info;

  const handleClose = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match fade-out animation duration
  }, [id, onClose]);

  useEffect(() => {
    // Trigger fade-in animation
    const fadeInTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss if not persistent
    let dismissTimer;
    if (!persistent && duration > 0) {
      dismissTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(fadeInTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, persistent, handleClose]);

  return (
    <div
      className={`
        w-full
        ${toastStyle.bg}
        border ${toastStyle.border}
        rounded-[14px]
        shadow-soft dark:shadow-soft-dark
        p-4 md:p-5
        flex items-start gap-3
        transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? "opacity-100 translate-y-0 md:translate-x-0" : "opacity-0 translate-y-4 md:translate-y-0 md:translate-x-full"}
        ${isRemoving ? "opacity-0 translate-y-4 md:translate-y-0 md:translate-x-full" : ""}
        z-50
      `}
      role="alert"
      aria-live="polite"
      style={{
        minWidth: "300px",
        maxWidth: "360px",
      }}
    >
      {/* Icon */}
      <div className={`${toastStyle.icon} flex-shrink-0 mt-0.5`}>
        {toastStyle.iconSvg}
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm md:text-base font-medium text-text-primary-light dark:text-text-primary-dark leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-200 p-1 -mt-1 -mr-1"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
