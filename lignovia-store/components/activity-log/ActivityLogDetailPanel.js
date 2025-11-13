import { useEffect } from "react";

/**
 * LIGNOVIA Activity Log Detail Panel Component
 * 
 * Features:
 * - Slide-in panel from right
 * - Full activity details
 * - JSON-like detail display
 * - Warm UI blocks
 * - Related resource links
 */
export default function ActivityLogDetailPanel({ isOpen, onClose, activity }) {
  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen || !activity) return null;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format metadata
  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    return JSON.stringify(metadata, null, 2);
  };

  // Get action type color
  const getActionTypeColor = (actionType) => {
    if (actionType.includes("delete")) {
      return "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border-error-light/30 dark:border-error-dark/30";
    }
    if (actionType.includes("security")) {
      return "bg-accent/20 dark:bg-accent/30 text-accent border-accent/30";
    }
    if (actionType.includes("product")) {
      return "bg-accent/20 dark:bg-accent/30 text-accent border-accent/30";
    }
    return "bg-hover-light dark:bg-hover-dark text-text-primary-light dark:text-text-primary-dark border-border-light dark:border-border-dark";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
      />

      {/* Slide-in Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-2xl bg-surface-light dark:bg-surface-dark shadow-2xl z-50
          transform transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          overflow-y-auto
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 flex justify-between items-center z-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
            Activity Details
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors duration-200 p-2 rounded-[8px] hover:bg-hover-light dark:hover:bg-hover-dark"
            aria-label="Close panel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
              Basic Information
            </h3>
            <div className="space-y-4">
              {/* Timestamp */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  Timestamp
                </span>
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>

              {/* Action Type */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  Action Type
                </span>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getActionTypeColor(activity.actionType)}`}>
                  {activity.actionLabel}
                </span>
              </div>

              {/* Category */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  Category
                </span>
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark capitalize">
                  {activity.category || "N/A"}
                </p>
              </div>

              {/* Details */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  Details
                </span>
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {activity.details || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Admin User */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
              Admin User
            </h3>
            <div className="flex items-center gap-4">
              {activity.adminUser?.avatar ? (
                <img
                  src={activity.adminUser.avatar}
                  alt={activity.adminUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 dark:bg-accent/30 flex items-center justify-center">
                  <span className="text-lg font-semibold text-accent">
                    {activity.adminUser?.name?.charAt(0).toUpperCase() || "A"}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {activity.adminUser?.name || "Admin"}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {activity.adminUser?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Device & IP Info */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
              Device & Network
            </h3>
            <div className="space-y-4">
              {/* IP Address */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  IP Address
                </span>
                <p className="text-sm font-mono text-text-primary-light dark:text-text-primary-dark">
                  {activity.ipAddress || "N/A"}
                </p>
              </div>

              {/* Device Info */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark block mb-1">
                  Device Info
                </span>
                <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                  {activity.deviceInfo || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {activity.metadata && (
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                Metadata
              </h3>
              <div className="bg-hover-light dark:bg-hover-dark rounded-[12px] p-4 border border-border-light dark:border-border-dark">
                <pre className="text-xs font-mono text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap break-words">
                  {formatMetadata(activity.metadata)}
                </pre>
              </div>
            </div>
          )}

          {/* Related Resource */}
          {activity.metadata && (
            <div className="card p-5">
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 tracking-tight">
                Related Resource
              </h3>
              <div className="space-y-2">
                {activity.metadata.productId && (
                  <a
                    href={`/admin/products/${activity.metadata.productId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 text-accent rounded-[10px] text-sm font-medium hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    View Product
                  </a>
                )}
                {activity.metadata.orderId && (
                  <a
                    href={`/admin/orders/${activity.metadata.orderId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 text-accent rounded-[10px] text-sm font-medium hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    View Order
                  </a>
                )}
                {activity.metadata.userId && (
                  <a
                    href={`/admin/customers/${activity.metadata.userId}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 dark:bg-accent/20 text-accent rounded-[10px] text-sm font-medium hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    View User
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

