import Skeleton from "./Skeleton";

export default function SkeletonSidebar({ menuItems = 7 }) {
  return (
    <div className="w-64 min-h-screen bg-bg-light dark:bg-bg-dark border-r border-border-light dark:border-border-dark p-6 space-y-6">
      {/* Logo */}
      <div className="mb-8">
        <Skeleton width="60%" height="3rem" variant="rounded" />
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {Array.from({ length: menuItems }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            {/* Icon */}
            <Skeleton width="1.25rem" height="1.25rem" variant="circular" />

            {/* Label */}
            <Skeleton width="60%" height="0.875rem" variant="rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
