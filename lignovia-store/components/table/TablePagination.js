import FilterDropdown from "@/components/filters/FilterDropdown";

/**
 * LIGNOVIA Table Pagination Component
 * 
 * Features:
 * - Page navigation
 * - Rows per page selector
 * - Page information
 * - Rounded buttons
 * - Accent colors
 */
export default function TablePagination({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    onPageSizeChange?.(newPageSize);
    // Reset to page 1 when page size changes
    onPageChange?.(1);
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Items Count */}
      <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Showing {startIndex}–{endIndex} of {totalItems} {totalItems === 1 ? "item" : "items"}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="pageSize"
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap"
          >
            Rows per page:
          </label>
          <FilterDropdown
            options={pageSizeOptions.map((size) => ({
              value: size.toString(),
              label: size.toString(),
            }))}
            value={pageSize.toString()}
            onChange={(value) => handlePageSizeChange(parseInt(value))}
            placeholder={pageSize.toString()}
            label=""
          />
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          {/* First Page */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`
              px-3 py-2 rounded-[10px] text-sm font-medium
              transition-all duration-200
              ${currentPage === 1
                ? "opacity-50 cursor-not-allowed text-text-secondary-light dark:text-text-secondary-dark"
                : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
              }
            `}
            aria-label="First page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous Page */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              px-3 py-2 rounded-[10px] text-sm font-medium
              transition-all duration-200
              ${currentPage === 1
                ? "opacity-50 cursor-not-allowed text-text-secondary-light dark:text-text-secondary-dark"
                : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
              }
            `}
            aria-label="Previous page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`
                  px-4 py-2 rounded-[10px] text-sm font-medium
                  transition-all duration-200
                  ${currentPage === page
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                  }
                `}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Page */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-2 rounded-[10px] text-sm font-medium
              transition-all duration-200
              ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed text-text-secondary-light dark:text-text-secondary-dark"
                : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
              }
            `}
            aria-label="Next page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last Page */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-2 rounded-[10px] text-sm font-medium
              transition-all duration-200
              ${currentPage === totalPages
                ? "opacity-50 cursor-not-allowed text-text-secondary-light dark:text-text-secondary-dark"
                : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
              }
            `}
            aria-label="Last page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


