import Skeleton from "./Skeleton";

export default function SkeletonModal({ fields = 5 }) {
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

        {/* Form Fields */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: fields }).map((_, index) => (
              <div key={index} className={index >= fields - 1 ? "md:col-span-2" : ""}>
                <div className="space-y-3">
                  {/* Label */}
                  <Skeleton width="25%" height="0.75rem" variant="rounded" />

                  {/* Input */}
                  <Skeleton width="100%" height="2.5rem" variant="rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-4 justify-end">
          <Skeleton width="6rem" height="2.5rem" variant="rounded" />
          <Skeleton width="6rem" height="2.5rem" variant="rounded" />
        </div>
      </div>
    </div>
  );
}
