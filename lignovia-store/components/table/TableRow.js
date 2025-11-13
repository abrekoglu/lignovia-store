import TableCell from "./TableCell";

/**
 * LIGNOVIA Table Row Component
 * 
 * Features:
 * - Hover effects
 * - Click handler
 * - Selection checkbox
 * - Styled cells
 */
export default function TableRow({
  row,
  columns = [],
  columnWidths = {},
  onRowClick,
  className = "",
  isSelected = false,
  onSelect,
  showCheckbox = false,
  isLastRow = false,
}) {
  const handleClick = (e) => {
    // Don't trigger row click if clicking on checkbox or action buttons
    if (
      e.target.type === "checkbox" ||
      e.target.closest("button") ||
      e.target.closest("a")
    ) {
      return;
    }
    onRowClick?.(row, e);
  };

  return (
    <tr
      className={`
        transition-all duration-200
        hover:bg-hover-light dark:hover:bg-hover-dark
        ${isSelected ? "bg-accent/10 dark:bg-accent/20 border-l-4 border-accent" : ""}
        ${onRowClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={handleClick}
    >
      {/* Checkbox Column */}
      {showCheckbox && (
        <td className="px-4 py-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-border-light dark:border-border-dark text-accent focus:ring-accent focus:ring-2 cursor-pointer"
            />
          </div>
        </td>
      )}

      {/* Table Cells */}
      {columns.map((column, index) => {
        const isLastColumn = index === columns.length - 1;
        return (
          <TableCell
            key={column.key || index}
            row={row}
            column={column}
            columnWidths={columnWidths}
            isLastRow={isLastRow}
            isLastColumn={isLastColumn}
          />
        );
      })}
    </tr>
  );
}

