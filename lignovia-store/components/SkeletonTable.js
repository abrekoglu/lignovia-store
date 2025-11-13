import Skeleton from "./Skeleton";

export default function SkeletonTable({ rows = 6, columns = 5, showThumbnail = false }) {
  const totalColumns = showThumbnail ? columns + 1 : columns;
  
  // Map column counts to Tailwind classes
  const getGridCols = (cols) => {
    const gridMap = {
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      5: "md:grid-cols-5",
      6: "md:grid-cols-6",
      7: "md:grid-cols-7",
      8: "md:grid-cols-8",
    };
    return gridMap[cols] || "md:grid-cols-5";
  };
  
  const gridColsClass = getGridCols(totalColumns);
  
  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      <div className={`hidden md:grid ${gridColsClass} gap-4 px-6 py-4 border-b border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark`}>
        {showThumbnail && (
          <Skeleton width="3rem" height="0.75rem" variant="rounded" />
        )}
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton
            key={index}
            width={index === 0 ? "60%" : "80%"}
            height="0.75rem"
            variant="rounded"
          />
        ))}
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className={`grid grid-cols-1 ${gridColsClass} gap-4 px-6 py-4 hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200`}
          >
            {/* Thumbnail Column */}
            {showThumbnail && (
              <div className="hidden md:block">
                <Skeleton width="3rem" height="3rem" variant="rounded" />
              </div>
            )}

            {/* Data Columns */}
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex}>
                {colIndex === 0 ? (
                  // First column (ID/Name) - larger
                  <Skeleton width="70%" height="1rem" variant="rounded" />
                ) : colIndex === columns - 1 ? (
                  // Last column (Actions) - smaller buttons
                  <div className="flex gap-2">
                    <Skeleton width="2rem" height="2rem" variant="circular" />
                    <Skeleton width="2rem" height="2rem" variant="circular" />
                    <Skeleton width="2rem" height="2rem" variant="circular" />
                  </div>
                ) : (
                  // Regular columns
                  <Skeleton width="80%" height="0.875rem" variant="rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
