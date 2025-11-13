import Skeleton from "./Skeleton";

export default function SkeletonProductCard({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="card p-4 space-y-4"
        >
          {/* Image */}
          <Skeleton width="100%" height="12rem" variant="rounded" />

          {/* Title */}
          <Skeleton width="70%" height="1.25rem" variant="rounded" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton width="100%" height="0.875rem" variant="rounded" />
            <Skeleton width="80%" height="0.875rem" variant="rounded" />
          </div>

          {/* Price */}
          <Skeleton width="40%" height="1rem" variant="rounded" />

          {/* Button */}
          <Skeleton width="100%" height="2.5rem" variant="rounded" />
        </div>
      ))}
    </>
  );
}
