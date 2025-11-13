import Skeleton from "./Skeleton";

export default function SkeletonChart({ type = "line", height = "300px" }) {
  if (type === "line") {
    return (
      <div className="card p-6" style={{ minHeight: height }}>
        {/* Chart Title */}
        <div className="mb-6">
          <Skeleton width="40%" height="1.25rem" variant="rounded" />
          <Skeleton width="60%" height="0.75rem" variant="rounded" className="mt-2" />
        </div>

        {/* Line Chart Skeleton */}
        <div className="relative" style={{ height: "calc(100% - 4rem)", minHeight: "200px" }}>
          {/* Y-axis */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between py-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="1.5rem" height="0.5rem" variant="rounded" />
            ))}
          </div>

          {/* Chart Area */}
          <div className="ml-10 h-full relative flex items-end">
            {/* Simulated line chart area */}
            <div className="w-full h-full flex items-end justify-between gap-2 pb-8">
              {Array.from({ length: 8 }).map((_, i) => {
                const randomHeight = Math.random() * 60 + 30;
                return (
                  <div key={i} className="flex-1 flex items-end">
                    <Skeleton
                      width="100%"
                      height={`${randomHeight}%`}
                      variant="rounded"
                      className="min-h-[2rem]"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis Labels */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-between px-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} width="2rem" height="0.5rem" variant="rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div className="card p-6" style={{ minHeight: height }}>
        {/* Chart Title */}
        <div className="mb-6">
          <Skeleton width="40%" height="1.25rem" variant="rounded" />
          <Skeleton width="60%" height="0.75rem" variant="rounded" className="mt-2" />
        </div>

        {/* Bar Chart Skeleton */}
        <div className="flex items-end justify-between gap-2" style={{ height: "calc(100% - 4rem)", minHeight: "200px" }}>
          {Array.from({ length: 6 }).map((_, index) => {
            const randomHeight = Math.random() * 70 + 20;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                <Skeleton
                  width="100%"
                  height={`${randomHeight}%`}
                  variant="rounded"
                  className="min-h-[3rem]"
                />
                <Skeleton width="80%" height="0.5rem" variant="rounded" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "donut") {
    return (
      <div className="card p-6" style={{ minHeight: height }}>
        {/* Chart Title */}
        <div className="mb-6">
          <Skeleton width="40%" height="1.25rem" variant="rounded" />
          <Skeleton width="60%" height="0.75rem" variant="rounded" className="mt-2" />
        </div>

        {/* Donut Chart Skeleton */}
        <div className="flex items-center justify-center" style={{ height: "calc(100% - 4rem)", minHeight: "200px" }}>
          <div className="relative">
            {/* Outer Ring */}
            <Skeleton width="12rem" height="12rem" variant="circular" />
            
            {/* Inner Circle (simulating donut hole) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="rounded-full bg-bg-light dark:bg-bg-dark" 
                style={{ width: "6rem", height: "6rem" }} 
              />
            </div>

            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton width="3rem" height="1rem" variant="rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
