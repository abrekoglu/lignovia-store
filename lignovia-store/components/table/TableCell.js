import Image from "next/image";

/**
 * LIGNOVIA Table Cell Component
 * 
 * Features:
 * - Custom cell rendering
 * - Thumbnail support
 * - Status badges
 * - Action buttons
 * - Responsive styling
 */
export default function TableCell({
  row,
  column,
  columnWidths = {},
  isLastRow = false,
  isLastColumn = false,
}) {
  const { key, render, align = "left", cellClassName = "" } = column;
  // Use user-resized width if available, otherwise undefined (let table auto-layout handle it)
  const userResizedWidth = columnWidths[key];

  // Get cell value
  const getCellValue = () => {
    if (render) {
      return render(row, column);
    }
    return row[key] ?? "";
  };

  const cellValue = getCellValue();

  // Render based on column type
  const renderCell = () => {
    // Custom render function
    if (render) {
      return render(row, column);
    }

    // Thumbnail/Image
    if (column.type === "thumbnail" && row.image) {
      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-[8px] overflow-hidden bg-surface-light dark:bg-surface-dark flex-shrink-0">
            <Image
              src={row.image}
              alt={row.name || row.title || ""}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          {row.name && (
            <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark truncate">
              {row.name}
            </span>
          )}
        </div>
      );
    }

    // Status badge
    if (column.type === "status" && typeof cellValue === "string") {
      const statusColors = {
        pending: "bg-accent/20 dark:bg-accent/30 text-accent",
        completed: "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
        cancelled: "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark",
        active: "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
        inactive: "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark",
        in_stock: "bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark",
        out_of_stock: "bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark",
        low_stock: "bg-accent/20 dark:bg-accent/30 text-accent",
      };
      const statusColor = statusColors[cellValue.toLowerCase().replace(/\s+/g, "_")] || "bg-accent/20 dark:bg-accent/30 text-accent";
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {cellValue.charAt(0).toUpperCase() + cellValue.slice(1)}
        </span>
      );
    }

    // Date
    if (column.type === "date" && cellValue) {
      const date = new Date(cellValue);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {formattedDate}
        </span>
      );
    }

    // DateTime
    if (column.type === "datetime" && cellValue) {
      const date = new Date(cellValue);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {formattedDate}
        </span>
      );
    }

    // Currency
    if (column.type === "currency" && cellValue !== null && cellValue !== undefined) {
      const amount = typeof cellValue === "number" ? cellValue : parseFloat(cellValue);
      return (
        <span className="text-sm font-semibold text-accent">
          ${amount.toFixed(2)}
        </span>
      );
    }

    // Number
    if (column.type === "number" && cellValue !== null && cellValue !== undefined) {
      return (
        <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
          {cellValue.toLocaleString()}
        </span>
      );
    }

    // Actions
    if (column.type === "actions" && column.actions) {
      return (
        <div className="flex items-center justify-end gap-2">
          {column.actions.map((action, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.(row, e);
              }}
              className={`
                p-2 rounded-[8px]
                text-text-secondary-light dark:text-text-secondary-dark
                hover:bg-hover-light dark:hover:bg-hover-dark
                hover:text-accent
                transition-all duration-200
                ${action.variant === "danger" ? "hover:text-error-light dark:hover:text-error-dark" : ""}
              `}
              title={action.label}
              aria-label={action.label}
            >
              {action.icon || (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a9.75 9.75 0 110 19.5 9.75 9.75 0 010-19.5zM16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
              )}
            </button>
          ))}
        </div>
      );
    }

    // Default text
    return (
      <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
        {cellValue}
      </span>
    );
  };

  return (
    <td
      className={`
        px-6 py-4
        whitespace-nowrap
        ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}
        ${cellClassName}
      `}
      style={{
        // Only set explicit width if user has resized the column
        width: userResizedWidth ? `${userResizedWidth}px` : undefined,
        minWidth: `${column.minWidth || 100}px`,
        maxWidth: column.maxWidth ? `${column.maxWidth}px` : undefined,
      }}
    >
      {renderCell()}
    </td>
  );
}

