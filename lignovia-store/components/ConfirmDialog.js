import { useEffect, useState } from "react";

// Icon components
const IconTrash = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const IconCheckmark = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const IconAlert = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const IconInfo = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const IconLock = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const iconMap = {
  trash: IconTrash,
  checkmark: IconCheckmark,
  alert: IconAlert,
  info: IconInfo,
  lock: IconLock,
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  iconType = "checkmark", // trash, checkmark, alert, info, lock
  variant = "normal", // normal, destructive
  isLoading = false,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Trigger animation after a brief delay
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      // Prevent body scrolling
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      // Start exit animation
      setIsAnimating(false);
      // Wait for exit animation before unmounting
      setTimeout(() => {
        setShouldRender(false);
        // Allow scrolling when closed
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }, 220);
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key - only allow if cancel button is available
  useEffect(() => {
    if (!isOpen || !cancelText) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isLoading, cancelText]);

  const handleClose = () => {
    if (isLoading) return;
    setIsAnimating(false);
    // Wait for exit animation before calling onClose
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm();
  };

  const handleBackdropClick = (e) => {
    // Only allow closing via backdrop if cancel button is available
    if (e.target === e.currentTarget && !isLoading && cancelText) {
      handleClose();
    }
  };

  if (!shouldRender) return null;

  const IconComponent = iconMap[iconType] || IconCheckmark;
  const isDestructive = variant === "destructive";

  // Icon color based on variant
  const iconColor = isDestructive
    ? "text-[#B35B4E] dark:text-[#CC6C5E]"
    : "text-accent";

  // Button colors
  const confirmButtonBg = isDestructive
    ? "bg-[#B35B4E] dark:bg-[#CC6C5E] hover:bg-[#B35B4E]/90 dark:hover:bg-[#CC6C5E]/90"
    : "bg-accent hover:bg-accent/90";

  return (
    <div
      className={`
        fixed inset-0
        z-[9999]
        flex items-center justify-center
        p-4
        bg-black/30
        backdrop-blur-sm
        ${isAnimating ? "modal-backdrop-enter" : "modal-backdrop-exit"}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          w-full max-w-[480px]
          bg-surface-light dark:bg-surface-dark
          border border-border-light dark:border-border-dark
          rounded-[18px]
          shadow-soft dark:shadow-soft-dark
          p-8 md:p-10
          text-center
          ${isAnimating ? "modal-content-enter" : "modal-content-exit"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div
            className={`
              w-16 h-16
              rounded-full
              flex items-center justify-center
              ${isDestructive ? "bg-[#B35B4E]/10 dark:bg-[#B35B4E]/20" : "bg-accent/10 dark:bg-accent/20"}
            `}
          >
            <IconComponent className={`w-8 h-8 ${iconColor}`} />
          </div>
        </div>

        {/* Title */}
        <h2
          className="
            text-2xl md:text-3xl
            font-semibold
            text-text-primary-light dark:text-text-primary-dark
            mb-3
            tracking-tight
          "
        >
          {title}
        </h2>

        {/* Message */}
        <p
          className="
            text-base md:text-lg
            text-text-secondary-light dark:text-text-secondary-dark
            mb-8
            leading-relaxed
          "
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {/* Cancel Button - Only show if cancelText is provided */}
          {cancelText && (
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="
                w-full sm:w-auto
                px-8 py-3
                bg-transparent
                border border-border-light dark:border-border-dark
                text-text-secondary-light dark:text-text-secondary-dark
                rounded-[12px]
                font-medium
                transition-all duration-200
                hover:bg-hover-light dark:hover:bg-hover-dark
                hover:underline
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {cancelText}
            </button>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              w-full sm:w-auto
              px-8 py-3
              ${confirmButtonBg}
              text-white
              rounded-[12px]
              font-medium
              transition-all duration-200
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-accent/30
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            `}
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

