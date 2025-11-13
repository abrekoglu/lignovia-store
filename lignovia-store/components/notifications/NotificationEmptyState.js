/**
 * LIGNOVIA Notification Empty State Component
 * 
 * Features:
 * - Calm, centered empty state
 * - Bell icon in accent color
 * - Welcoming message
 * - Minimal aesthetic
 */
export default function NotificationEmptyState() {
  return (
    <div className="card p-12 md:p-16 text-center">
      <div className="flex flex-col items-center justify-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          No notifications yet
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          You're all caught up.
        </p>
      </div>
    </div>
  );
}

