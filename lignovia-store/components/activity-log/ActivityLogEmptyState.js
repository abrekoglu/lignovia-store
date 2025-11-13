/**
 * LIGNOVIA Activity Log Empty State Component
 * 
 * Features:
 * - Calm, centered empty state
 * - Shield or clock icon in accent color
 * - Welcoming message
 * - Minimal aesthetic
 */
export default function ActivityLogEmptyState() {
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
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          No activity recorded
        </h3>

        {/* Description */}
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Try adjusting your filters or check back later.
        </p>
      </div>
    </div>
  );
}


