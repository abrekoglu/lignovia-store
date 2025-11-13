import { useState, useEffect } from "react";

/**
 * LIGNOVIA Notification Item Component
 * 
 * Features:
 * - Icon based on category
 * - Title and message
 * - Timestamp
 * - Unread indicator
 * - Actions menu (Mark as read, Delete)
 * - Warm, rounded card design
 */
export default function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get icon based on notification type
  const getIcon = () => {
    const iconClass = "w-5 h-5 text-accent";
    switch (notification.type) {
      case "order":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        );
      case "inventory":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
          </svg>
        );
      case "system":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "customer":
      case "users":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        );
      case "security":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        );
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Handle mark as read
  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    setIsMenuOpen(false);
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete?.(notification.id);
    setIsDeleting(false);
    setIsMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".notification-menu")) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      className={`
        card p-5 md:p-6
        transition-all duration-200
        ${notification.read
          ? "bg-surface-light dark:bg-surface-dark"
          : "bg-hover-light dark:bg-hover-dark border-l-4 border-accent"
        }
        hover:bg-hover-light dark:hover:bg-hover-dark
        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-[10px] bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3
                className={`
                  text-sm font-semibold text-text-primary-light dark:text-text-primary-dark mb-1
                  ${notification.read ? "" : "font-semibold"}
                `}
              >
                {notification.title}
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {formatTimestamp(notification.timestamp)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-2 flex-shrink-0">
              {/* Unread Indicator */}
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-accent mt-2" />
              )}

              {/* More Menu */}
              <div className="relative notification-menu">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-[8px] text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark hover:text-accent transition-all duration-200"
                  aria-label="More options"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] shadow-soft dark:shadow-soft-dark z-10 overflow-hidden">
                    {!notification.read && (
                      <button
                        onClick={handleMarkAsRead}
                        className="w-full px-4 py-2.5 text-left text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-error-light dark:text-error-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

