import { useState, useEffect, useRef } from "react";

/**
 * LIGNOVIA Hierarchical Category Dropdown Component
 * 
 * A reusable dropdown component for selecting categories with hierarchical display
 * Supports unlimited nesting, breadcrumb preview, and search
 */

export default function CategoryDropdown({
  value,
  onChange,
  categories = [],
  placeholder = "Select category",
  excludeCategoryId = null, // Exclude a category (e.g., when editing, exclude self)
  showBreadcrumb = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Build hierarchical category tree
  const buildCategoryTree = (categoriesList) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // Create map of all categories
    categoriesList.forEach((category) => {
      categoryMap.set(category._id, {
        ...category,
        children: [],
        level: 0,
      });
    });

    // Build tree structure
    categoriesList.forEach((category) => {
      const categoryNode = categoryMap.get(category._id);
      if (category.parentCategory && categoryMap.has(category.parentCategory)) {
        const parent = categoryMap.get(category.parentCategory);
        parent.children.push(categoryNode);
        categoryNode.level = (parent.level || 0) + 1;
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Recursively set levels
    const setLevels = (nodes, level = 0) => {
      nodes.forEach((node) => {
        node.level = level;
        if (node.children.length > 0) {
          setLevels(node.children, level + 1);
        }
      });
    };

    setLevels(rootCategories);
    return rootCategories;
  };

  // Filter categories (including nested)
  const filterCategories = (categoryTree, query) => {
    if (!query.trim()) return categoryTree;

    const queryLower = query.toLowerCase();
    const matches = (category) => {
      return (
        category.name?.toLowerCase().includes(queryLower) ||
        category.slug?.toLowerCase().includes(queryLower) ||
        category.description?.toLowerCase().includes(queryLower)
      );
    };

    // Recursive filter
    const filterTree = (nodes) => {
      const filtered = [];
      nodes.forEach((node) => {
        const nodeMatches = matches(node);
        const filteredChildren = filterTree(node.children || []);
        const hasMatchingChildren = filteredChildren.length > 0;

        if (nodeMatches || hasMatchingChildren) {
          filtered.push({
            ...node,
            children: filteredChildren,
          });
        }
      });
      return filtered;
    };

    return filterTree(categoryTree);
  };

  // Get category tree
  const categoryTree = buildCategoryTree(
    categories.filter((cat) => cat._id !== excludeCategoryId)
  );

  // Filter tree based on search
  const filteredTree = searchQuery
    ? filterCategories(categoryTree, searchQuery)
    : categoryTree;

  // Flatten tree for display (with indentation)
  const flattenTree = (nodes, result = []) => {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        flattenTree(node.children, result);
      }
    });
    return result;
  };

  const flatCategories = flattenTree(filteredTree);

  // Get selected category - convert IDs to strings for comparison
  const selectedCategory = categories.find((cat) => String(cat._id) === String(value || ""));

  // Get category breadcrumb path
  const getCategoryPath = (categoryId) => {
    const category = categories.find((cat) => cat._id === categoryId);
    if (!category) return "";

    const path = [category.name];
    let current = category;

    const findParent = (catId) => {
      return categories.find((c) => c._id === catId);
    };

    while (current.parentCategory) {
      const parent = findParent(current.parentCategory);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }

    return path.join(" / ");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle category select
  const handleSelect = (category) => {
    // Convert category ID to string to ensure consistency
    onChange(String(category._id));
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-left text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 flex items-center justify-between"
      >
        <span className={selectedCategory ? "" : "text-text-secondary-light dark:text-text-secondary-dark"}>
          {selectedCategory
            ? showBreadcrumb
              ? getCategoryPath(selectedCategory._id)
              : selectedCategory.name
            : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface-light dark:bg-surface-dark rounded-[14px] border border-border-light dark:border-border-dark shadow-soft-lg overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-border-light dark:border-border-dark">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full px-3 py-2 pl-9 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                autoFocus
              />
              <svg
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
          </div>

          {/* Category List */}
          <div className="max-h-64 overflow-y-auto">
            {flatCategories.length > 0 ? (
              <ul className="py-2">
                {flatCategories.map((category) => {
                  // Convert IDs to strings for comparison
                  const isSelected = String(category._id) === String(value || "");
                  const indentLevel = category.level || 0;

                  return (
                    <li key={category._id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(category)}
                        className={`w-full px-4 py-2.5 text-left text-body-sm transition-colors duration-200 flex items-center gap-2 ${
                          isSelected
                            ? "bg-accent/20 text-accent font-medium"
                            : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                        }`}
                        style={{ paddingLeft: `${16 + indentLevel * 20}px` }}
                      >
                        {/* Indentation Lines */}
                        {indentLevel > 0 && (
                          <span className="absolute left-2 top-0 bottom-0 w-px bg-border-light dark:bg-border-dark" />
                        )}

                        {/* Category Name */}
                        <span className="flex-1 truncate">{category.name}</span>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-accent flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {searchQuery ? "No categories found" : "No categories available"}
                </p>
              </div>
            )}
          </div>

          {/* Option: None */}
          <div className="border-t border-border-light dark:border-border-dark p-2">
            <button
              type="button"
              onClick={() => {
                // Use empty string for consistency (instead of null)
                onChange("");
                setIsOpen(false);
                setSearchQuery("");
              }}
              className={`w-full px-4 py-2.5 rounded-[10px] text-body-sm text-left transition-colors duration-200 ${
                !value
                  ? "bg-accent/20 text-accent font-medium"
                  : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
              }`}
            >
              None (Top-level category)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

