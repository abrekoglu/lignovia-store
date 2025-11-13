import { useEffect, useState } from "react";

export default function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
  variant = "rectangular", // rectangular, circular, rounded
  lines = 1,
  animated = true,
  ...props
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseClasses = `
    bg-[#EFE8E2] dark:bg-[#2E2722]
    ${animated && mounted ? "animate-shimmer" : ""}
    ${variant === "circular" ? "rounded-full" : variant === "rounded" ? "rounded-[12px]" : "rounded-[8px]"}
    ${className}
  `;

  const shimmerStyle = {
    width: typeof width === "string" ? width : `${width}px`,
    height: typeof height === "string" ? height : `${height}px`,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={baseClasses}
            style={{
              ...shimmerStyle,
              width: index === lines - 1 ? "60%" : "100%", // Last line is shorter
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseClasses}
      style={shimmerStyle}
      {...props}
    />
  );
}

// SkeletonStyles component - exports empty component since styles are in globals.css
export const SkeletonStyles = () => null;

