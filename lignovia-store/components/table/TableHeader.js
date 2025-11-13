import { forwardRef, useEffect, useState, useRef } from "react";

/**
 * LIGNOVIA Table Header Component
 * 
 * Features:
 * - Sticky header
 * - Sortable columns
 * - Resizable columns
 * - Sort indicators
 */
const TableHeader = forwardRef(({
  columns = [],
  onSort,
  sortColumn,
  sortDirection,
  columnWidths = {},
  onResizeStart,
  sticky = true,
  resizable = true,
  sortable = true,
  className = "",
  onSelectAll,
  isAllSelected = false,
  isIndeterminate = false,
  showCheckbox = false,
}, ref) => {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);

  // Handle sticky header for page-level scrolling
  useEffect(() => {
    if (!sticky || !headerRef.current) return;

    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        // Check if header has scrolled past the top of the viewport
        setIsSticky(rect.top <= 0);
      }
    };

    // Listen to window scroll events for page-level scrolling
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Also check on mount in case page is already scrolled
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sticky]);

  // Handle sort
  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return;
    if (sortColumn === columnKey) {
      onSort(columnKey, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnKey, "asc");
    }
  };

  // Sort icon
  const SortIcon = ({ columnKey }) => {
    if (!sortable || sortColumn !== columnKey) {
      return (
        <svg
          className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg
        className={`w-4 h-4 text-accent transition-transform duration-200 ${
          sortDirection === "desc" ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <thead
      ref={(node) => {
        headerRef.current = node;
        if (ref) {
          if (typeof ref === "function") {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      }}
      className={`
        ${sticky ? "sticky top-0 z-10" : ""}
        bg-hover-light dark:bg-hover-dark
        transition-all duration-200
        ${sticky && isSticky ? "shadow-md" : ""}
        ${className}
      `}
    >
      <tr>
        {/* Checkbox Column */}
        {showCheckbox && (
          <th
            className="px-4 py-4 text-left"
            style={{
              width: "48px",
              minWidth: "48px",
              position: "sticky",
              left: 0,
              zIndex: sticky ? 11 : 1,
            }}
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent focus:ring-2 cursor-pointer"
              />
            </div>
          </th>
        )}

        {/* Column Headers */}
        {columns.map((column, index) => {
          // Use user-resized width if available, otherwise let table auto-layout handle it
          const userResizedWidth = columnWidths[column.key];
          const isSorted = sortColumn === column.key;
          const isSortable = sortable && column.sortable !== false;

          return (
            <th
              key={column.key || index}
              className={`
                px-6 py-4
                text-left
                text-xs font-semibold uppercase tracking-wider
                text-text-secondary-light dark:text-text-secondary-dark
                transition-colors duration-200
                ${isSorted ? "bg-accent/10 dark:bg-accent/20" : ""}
                ${isSortable ? "cursor-pointer hover:bg-hover-light dark:hover:bg-hover-dark" : ""}
                ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}
              `}
              style={{
                // Only set explicit width if user has resized the column
                width: userResizedWidth ? `${userResizedWidth}px` : undefined,
                minWidth: `${column.minWidth || 100}px`,
                maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
                position: "relative",
              }}
              onClick={() => isSortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-2">
                <span className="flex-1">{column.label}</span>
                {isSortable && (
                  <div className="flex-shrink-0">
                    <SortIcon columnKey={column.key} />
                  </div>
                )}
              </div>

              {/* Resize Handle */}
              {resizable && index < columns.length - 1 && (
                <div
                  className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-accent/50 transition-colors duration-200"
                  onMouseDown={(e) => onResizeStart?.(column.key, e)}
                  style={{
                    marginRight: "-3px",
                  }}
                />
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
});

TableHeader.displayName = "TableHeader";

export default TableHeader;

