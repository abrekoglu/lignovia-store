import { useState, useRef, useEffect, useCallback } from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
import TableEmptyState from "./TableEmptyState";
import TablePagination from "./TablePagination";

/**
 * LIGNOVIA Admin Table Component
 * 
 * Features:
 * - Sticky header
 * - Resizable columns
 * - Sortable columns
 * - Hover effects
 * - Responsive layout
 * - Empty states
 * - Pagination
 * - Dark mode support
 */
export default function Table({
  columns = [],
  data = [],
  onSort,
  onRowClick,
  sortColumn,
  sortDirection,
  emptyStateTitle = "No data available",
  emptyStateDescription = "Try adjusting your filters or add new content.",
  emptyStateAction,
  emptyStateIcon,
  pagination = false,
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showHeader = true,
  stickyHeader = true,
  resizable = true,
  sortable = true,
  className = "",
  rowClassName = "",
  headerClassName = "",
  bodyClassName = "",
  onSelectionChange,
  selectedRows = [],
  bulkActions,
  exportCSV,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  mobileCardComponent,
  loading = false,
}) {
  const [columnWidths, setColumnWidths] = useState({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumn, setResizeColumn] = useState(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const tableRef = useRef(null);
  const headerRef = useRef(null);

  // Initialize column widths (only for resizable columns - user resized widths)
  // Don't set fixed widths initially - let table-layout: auto distribute space
  useEffect(() => {
    if (columns.length > 0 && Object.keys(columnWidths).length === 0 && resizable) {
      // Only initialize if columns have explicit width requirements
      // Otherwise, let the table use auto layout
      const initialWidths = {};
      columns.forEach((col) => {
        // Only store width if explicitly set and resizable
        // Otherwise, let CSS minWidth/maxWidth handle it
        if (col.width && resizable) {
          initialWidths[col.key] = col.width;
        }
      });
      // Only set if we have any explicit widths
      if (Object.keys(initialWidths).length > 0) {
        setColumnWidths(initialWidths);
      }
    }
  }, [columns, columnWidths, resizable]);

  // Handle column resize
  const handleResizeStart = useCallback((columnKey, e) => {
    if (!resizable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeColumn(columnKey);
    setResizeStartX(e.clientX);
    
    // Get current width from DOM element (most accurate)
    // The resize handle div is inside the th, so get the parent th element
    const resizeHandle = e.currentTarget;
    const th = resizeHandle.parentElement; // Resize handle is direct child of th
    if (th && th.tagName === 'TH') {
      setResizeStartWidth(th.offsetWidth);
    } else {
      // Fallback: use stored width, or column minWidth, or default
      const storedWidth = columnWidths[columnKey];
      if (storedWidth) {
        setResizeStartWidth(storedWidth);
      } else {
        const column = columns.find(col => col.key === columnKey);
        setResizeStartWidth(column?.minWidth || 100);
      }
    }
  }, [resizable, columnWidths, columns]);

  const handleResize = useCallback((e) => {
    if (!isResizing || !resizeColumn) return;
    const diff = e.clientX - resizeStartX;
    const newWidth = Math.max(80, resizeStartWidth + diff); // Min width 80px
    setColumnWidths((prev) => ({
      ...prev,
      [resizeColumn]: newWidth,
    }));
  }, [isResizing, resizeColumn, resizeStartX, resizeStartWidth]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeColumn(null);
  }, []);

  // Add resize event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      return () => {
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handleResize, handleResizeEnd]);

  // Calculate paginated data
  const paginatedData = pagination
    ? data.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : data;

  // Get row ID - supports both `id` and `_id` fields
  const getRowId = useCallback((row) => {
    return row.id || row._id || JSON.stringify(row);
  }, []);

  // Handle row selection
  const handleRowSelect = useCallback((row, isSelected) => {
    if (!onSelectionChange) return;
    const rowId = getRowId(row);
    if (isSelected) {
      onSelectionChange([...selectedRows, row]);
    } else {
      onSelectionChange(selectedRows.filter((r) => getRowId(r) !== rowId));
    }
  }, [onSelectionChange, selectedRows, getRowId]);

  const handleSelectAll = useCallback((isSelected) => {
    if (!onSelectionChange) return;
    if (isSelected) {
      onSelectionChange([...paginatedData]);
    } else {
      onSelectionChange([]);
    }
  }, [onSelectionChange, paginatedData]);

  const isAllSelected = selectedRows.length === paginatedData.length && paginatedData.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < paginatedData.length;

  // Note: Mobile card view should be handled by the parent component using CSS media queries
  // This ensures proper SSR and avoids layout shift
  // Use className="hidden lg:block" for desktop table and className="lg:hidden" for mobile cards

  return (
    <div className={`w-full ${className}`}>
      {/* Bulk Actions Bar */}
      {bulkActions && selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-accent/10 dark:bg-accent/20 border border-accent/30 rounded-[14px] flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {selectedRows.length} {selectedRows.length === 1 ? "item" : "items"} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions}
          </div>
        </div>
      )}

      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-12 pr-4 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[12px] text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Export CSV Button */}
      {exportCSV && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-accent text-white rounded-[10px] text-sm font-medium hover:bg-accent/90 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      )}

      {/* Table Container - Fully rounded LIGNOVIA card */}
      <div
        ref={tableRef}
        className="card w-full overflow-hidden"
        style={{
          borderRadius: "18px",
        }}
      >
        {/* Table wrapper - preserves rounded corners */}
        <div className="w-full">
          <table className="w-full table-auto divide-y divide-border-light dark:divide-border-dark">
            {/* Table Header */}
            {showHeader && (
              <TableHeader
                ref={headerRef}
                columns={columns}
                onSort={onSort}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                columnWidths={columnWidths}
                onResizeStart={handleResizeStart}
                sticky={stickyHeader}
                resizable={resizable}
                sortable={sortable}
                className={headerClassName}
                onSelectAll={onSelectionChange ? handleSelectAll : undefined}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                showCheckbox={!!onSelectionChange}
              />
            )}

            {/* Table Body */}
            <tbody className={`bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark ${bodyClassName}`}>
              {loading ? (
                // Loading skeleton rows
                [...Array(pageSize)].map((_, index) => (
                  <tr key={index} className="animate-shimmer">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4"
                        style={{
                          height: "64px",
                        }}
                      >
                        <div className="h-4 bg-hover-light dark:bg-hover-dark rounded" style={{ width: "60%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-12">
                    <TableEmptyState
                      title={emptyStateTitle}
                      description={emptyStateDescription}
                      action={emptyStateAction}
                      icon={emptyStateIcon}
                    />
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row);
                  const isLastRow = index === paginatedData.length - 1;
                  return (
                    <TableRow
                      key={rowId || index}
                      row={row}
                      columns={columns}
                      columnWidths={columnWidths}
                      onRowClick={onRowClick}
                      className={rowClassName}
                      isSelected={selectedRows.some((r) => getRowId(r) === rowId)}
                      onSelect={onSelectionChange ? (isSelected) => handleRowSelect(row, isSelected) : undefined}
                      showCheckbox={!!onSelectionChange}
                      isLastRow={isLastRow}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && !loading && paginatedData.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems || data.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  );
}

