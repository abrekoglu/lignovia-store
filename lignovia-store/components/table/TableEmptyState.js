/**
 * LIGNOVIA Table Empty State Component
 * 
 * Features:
 * - Calm empty state design
 * - Custom icon
 * - Action button
 * - Serene aesthetic
 */
export default function TableEmptyState({
  title = "No data available",
  description = "Try adjusting your filters or add new content.",
  action,
  icon,
}) {
  // Default icon
  const DefaultIcon = (
    <svg
      className="w-16 h-16 text-accent/50"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
          {icon || DefaultIcon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 max-w-md">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-accent text-white rounded-[12px] text-sm font-medium hover:bg-accent/90 transition-colors duration-200"
        >
          {action.label || "Add New"}
        </button>
      )}
    </div>
  );
}

