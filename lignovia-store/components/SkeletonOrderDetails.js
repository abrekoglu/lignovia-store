import Skeleton from "./Skeleton";

export default function SkeletonOrderDetails() {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <Skeleton width="40%" height="1.5rem" variant="rounded" />
            <Skeleton width="2rem" height="2rem" variant="circular" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Tags */}
          <div className="flex gap-2">
            <Skeleton width="5rem" height="1.75rem" variant="rounded" />
            <Skeleton width="5rem" height="1.75rem" variant="rounded" />
          </div>

          {/* Order Info Lines */}
          <div className="space-y-3">
            <Skeleton width="60%" height="0.875rem" variant="rounded" />
            <Skeleton width="50%" height="0.875rem" variant="rounded" />
            <Skeleton width="55%" height="0.875rem" variant="rounded" />
          </div>

          {/* Product List */}
          <div className="space-y-4">
            <Skeleton width="30%" height="1rem" variant="rounded" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-border-light dark:border-border-dark rounded-soft">
                {/* Thumbnail */}
                <Skeleton width="4rem" height="4rem" variant="rounded" />
                
                {/* Product Info */}
                <div className="flex-1 space-y-2">
                  <Skeleton width="60%" height="1rem" variant="rounded" />
                  <Skeleton width="40%" height="0.875rem" variant="rounded" />
                  <Skeleton width="30%" height="0.875rem" variant="rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-border-light dark:border-border-dark pt-4">
            <div className="flex justify-between items-center">
              <Skeleton width="30%" height="1rem" variant="rounded" />
              <Skeleton width="20%" height="1.25rem" variant="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

