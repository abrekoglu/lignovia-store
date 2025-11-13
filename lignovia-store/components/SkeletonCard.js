import Skeleton from "./Skeleton";

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card p-6 lg:p-8 space-y-4"
        >
          {/* Title */}
          <Skeleton width="40%" height="0.875rem" variant="rounded" />

          {/* Metric Value */}
          <Skeleton width="60%" height="2rem" variant="rounded" />

          {/* Subtext or Percentage */}
          <Skeleton width="30%" height="0.75rem" variant="rounded" />
        </div>
      ))}
    </>
  );
}

