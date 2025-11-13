import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "@/components/AdminLayout";
import { Table } from "@/components/table";
import SkeletonTable from "@/components/SkeletonTable";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

/**
 * LIGNOVIA Categories List Page with Hierarchical Support
 * 
 * Complete categories management interface with unlimited nesting
 * Supports category tree visualization, expand/collapse, and hierarchical operations
 */

export default function AdminCategories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const { confirm } = useConfirmDialog();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("tree"); // "tree" or "table"
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Protect route - redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/categories");
      return;
    }

    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data || []);
      } else {
        console.error("Error fetching categories:", result.error);
        toastError("Failed to load categories");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toastError("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, []);

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
      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory);
        if (parent) {
          parent.children.push(categoryNode);
          categoryNode.level = (parent.level || 0) + 1;
        } else {
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Flatten tree for display (respecting expanded state)
    const flattenTree = (nodes, result = []) => {
      nodes.forEach((node) => {
        result.push(node);
        if (expandedCategories[node._id] && node.children.length > 0) {
          flattenTree(node.children, result);
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  // Filter categories (including nested) - no state updates during render
  const filterCategories = (categoriesList, query) => {
    if (!query || !query.trim()) return categoriesList;

    const queryLower = query.trim().toLowerCase();
    const matches = (category) => {
      return (
        category.name?.toLowerCase().includes(queryLower) ||
        category.slug?.toLowerCase().includes(queryLower) ||
        category.description?.toLowerCase().includes(queryLower) ||
        category.seoTitle?.toLowerCase().includes(queryLower) ||
        category.seoDescription?.toLowerCase().includes(queryLower)
      );
    };

    // Recursive function to check if category or any of its children match
    const categoryMatches = (category) => {
      if (matches(category)) return true;
      if (category.children) {
        return category.children.some((child) => categoryMatches(child));
      }
      return false;
    };

    const filtered = categoriesList.filter(categoryMatches);
    return filtered;
  };

  // Auto-expand matching categories when search query changes
  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) {
      return;
    }

    const queryLower = searchQuery.trim().toLowerCase();
    
    // Check if category matches search
    const matches = (category) => {
      return (
        category.name?.toLowerCase().includes(queryLower) ||
        category.slug?.toLowerCase().includes(queryLower) ||
        category.description?.toLowerCase().includes(queryLower) ||
        category.seoTitle?.toLowerCase().includes(queryLower) ||
        category.seoDescription?.toLowerCase().includes(queryLower)
      );
    };

    // Recursive function to check if category or any of its children match
    const categoryMatches = (category) => {
      if (matches(category)) return true;
      if (category.children) {
        return category.children.some((child) => categoryMatches(child));
      }
      return false;
    };

    // Build tree first to get children structure (flat list version)
    const categoryMap = new Map();
    const rootCategories = [];

    categories.forEach((category) => {
      categoryMap.set(category._id, {
        ...category,
        children: [],
      });
    });

    categories.forEach((category) => {
      const categoryNode = categoryMap.get(category._id);
      if (category.parentCategory) {
        const parent = categoryMap.get(category.parentCategory);
        if (parent) {
          parent.children.push(categoryNode);
        } else {
          rootCategories.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Use functional update to avoid dependency on expandedCategories
    setExpandedCategories((prevExpanded) => {
      const newExpanded = { ...prevExpanded };
      let hasChanges = false;

      const expandMatching = (categoriesList) => {
        categoriesList.forEach((category) => {
          if (categoryMatches(category)) {
            if (!newExpanded[category._id]) {
              newExpanded[category._id] = true;
              hasChanges = true;
            }
          }
          if (category.children && category.children.length > 0) {
            expandMatching(category.children);
          }
        });
      };

      expandMatching(rootCategories);

      return hasChanges ? newExpanded : prevExpanded;
    });
  }, [searchQuery, categories]);

  // Process categories
  const processedCategories = searchQuery
    ? filterCategories(categories, searchQuery)
    : categories;

  const categoryTree = buildCategoryTree(processedCategories);

  // Sort categories
  const sortedCategories = [...categoryTree].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (aValue === bValue) return 0;
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Paginate categories
  const totalPages = Math.ceil(sortedCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = sortedCategories.slice(startIndex, endIndex);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Expand all categories
  const expandAll = () => {
    const allExpanded = {};
    const expandCategory = (category) => {
      allExpanded[category._id] = true;
      if (category.children) {
        category.children.forEach(expandCategory);
      }
    };
    categories.forEach(expandCategory);
    setExpandedCategories(allExpanded);
  };

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories({});
  };

  // Handle sort
  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle delete
  const handleDelete = async (category) => {
    // Check if category has children by checking all categories
    const hasChildren = categories.some(
      (cat) => cat.parentCategory && cat.parentCategory.toString() === category._id.toString()
    );

    if (hasChildren) {
      const childrenCount = categories.filter(
        (cat) => cat.parentCategory && cat.parentCategory.toString() === category._id.toString()
      ).length;
      const confirmed = await confirm({
        title: "Delete Category with Subcategories?",
        message: `"${category.name}" has ${childrenCount} subcategor${childrenCount === 1 ? "y" : "ies"}. Please move or delete subcategories first.`,
        confirmText: "Cancel",
        cancelText: "Cancel",
        iconType: "alert",
        variant: "destructive",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Delete Category?",
      message: `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${category._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toastSuccess("Category deleted successfully!");
        // Refresh categories list
        await fetchCategories();
      } else {
        toastError(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toastError("Failed to delete category");
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    router.push(`/admin/categories/${category._id}`);
  };

  // Handle new category
  const handleNewCategory = () => {
    router.push("/admin/categories/new");
  };

  // Handle add subcategory
  const handleAddSubcategory = (parentCategory) => {
    router.push(`/admin/categories/new?parent=${parentCategory._id}`);
  };

  // Get status chip
  const getStatusChip = (visibility) => {
    if (visibility === "public") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark border border-success-light/30 dark:border-success-dark/30">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-hover-light dark:bg-hover-dark text-text-secondary-light dark:text-text-secondary-dark border border-border-light dark:border-border-dark">
          Hidden
        </span>
      );
    }
  };

  // Get category breadcrumb path
  const getCategoryPath = (category, categoriesList) => {
    const path = [category.name];
    let current = category;
    
    const findParent = (catId) => {
      return categoriesList.find((c) => c._id === catId);
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

  // Render category row (hierarchical)
  const renderCategoryRow = (category, index) => {
    const isExpanded = expandedCategories[category._id];
    const hasChildren = category.children && category.children.length > 0;
    const indentLevel = category.level || 0;

    return (
      <tr
        key={category._id || index}
        className="border-b border-border-light dark:border-border-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-colors duration-200"
      >
        <td className="py-4 px-6">
          <div
            className="flex items-center gap-3"
            style={{ paddingLeft: `${indentLevel * 24}px` }}
          >
            {/* Expand/Collapse Button */}
            {hasChildren ? (
              <button
                onClick={() => toggleCategory(category._id)}
                className="p-1 rounded-[6px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 flex-shrink-0"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <div className="w-6" /> // Spacer for alignment
            )}

            {/* Category Image/Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-[12px] border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark flex items-center justify-center">
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9h6a2.25 2.25 0 012.25 2.25v.75m-8.5 3A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16.5 0v-7.5A2.25 2.25 0 015.25 9h6a2.25 2.25 0 012.25 2.25v7.5m-9 0V18.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v1.5m-16.5 0h16.5"
                  />
                </svg>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                  {category.name}
                </p>
                {indentLevel > 0 && (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    Level {indentLevel + 1}
                  </span>
                )}
              </div>
              {category.description && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate line-clamp-1">
                  {category.description}
                </p>
              )}
              {category.slug && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                  /{category.slug}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {category.productCount || 0}
          </span>
        </td>
        <td className="py-4 px-6">
          {getStatusChip(category.visibility || "public")}
        </td>
        <td className="py-4 px-6">
          <div className="flex items-center justify-end gap-2">
            {/* Add Subcategory Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSubcategory(category);
              }}
              className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
              aria-label="Add subcategory"
              title="Add subcategory"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(category);
              }}
              className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
              aria-label="Edit category"
              title="Edit category"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V14.25m9-3.75h-2.25m-9 0H3.375c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </button>
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(category);
              }}
              className="p-2 rounded-[10px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-200"
              aria-label="Delete category"
              title="Delete category"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  };

  // Table columns configuration (for Table view only)
  const columns = [
    {
      key: "category",
      label: "Category",
      sortable: true,
      width: 300,
      render: (row) => {
        const indentLevel = row.level || 0;
        return (
          <div
            className="flex items-center gap-3"
            style={{ paddingLeft: `${indentLevel * 24}px` }}
          >
            {/* Category Image/Icon */}
            <div className="flex-shrink-0 w-14 h-14 rounded-[12px] border border-border-light dark:border-border-dark overflow-hidden bg-hover-light dark:bg-hover-dark flex items-center justify-center">
              {row.image ? (
                <Image
                  src={row.image}
                  alt={row.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9h6a2.25 2.25 0 012.25 2.25v.75m-8.5 3A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16.5 0v-7.5A2.25 2.25 0 015.25 9h6a2.25 2.25 0 012.25 2.25v7.5m-9 0V18.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v1.5m-16.5 0h16.5"
                  />
                </svg>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
                  {row.name}
                </p>
                {indentLevel > 0 && (
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    Level {indentLevel + 1}
                  </span>
                )}
              </div>
              {row.description && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate line-clamp-1">
                  {row.description}
                </p>
              )}
              {row.slug && (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                  /{row.slug}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "products",
      label: "Products",
      sortable: true,
      width: 120,
      render: (row) => (
        <span className="text-sm text-text-primary-light dark:text-text-primary-dark">
          {row.productCount || 0}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      width: 120,
      render: (row) => getStatusChip(row.visibility || "public"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      sortable: false,
      width: 180,
      render: (row) => {
        return (
          <div className="flex items-center justify-end gap-2">
            {/* Add Subcategory Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSubcategory(row);
              }}
              className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
              aria-label="Add subcategory"
              title="Add subcategory"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              className="p-2 rounded-[10px] text-accent hover:bg-accent/10 dark:hover:bg-accent/20 transition-all duration-200"
              aria-label="Edit category"
              title="Edit category"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21h-4.5A2.25 2.25 0 019 18.75V14.25m9-3.75h-2.25m-9 0H3.375c-.621 0-1.125.504-1.125 1.125v12.75c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </button>
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              className="p-2 rounded-[10px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-200"
              aria-label="Delete category"
              title="Delete category"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <Head>
          <title>Categories - LIGNOVIA Admin</title>
          <meta name="description" content="Manage product categories" />
        </Head>
        <div className="space-y-6">
          <SkeletonTable rows={8} columns={4} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Categories - LIGNOVIA Admin</title>
        <meta name="description" content="Manage product categories" />
      </Head>

      {/* Header Section */}
      <div className="mb-6 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight mb-2">
              Categories
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Manage product categories and subcategories
              {!loading && (
                <span className="ml-2 text-text-secondary-light dark:text-text-secondary-dark">
                  ({categories.length} {categories.length === 1 ? "category" : "categories"} found)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1.5 rounded-[8px] text-body-sm font-medium transition-all duration-200 ${
                  viewMode === "tree"
                    ? "bg-accent text-white shadow-soft"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:text-accent"
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-[8px] text-body-sm font-medium transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-accent text-white shadow-soft"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:text-accent"
                }`}
              >
                Table
              </button>
            </div>

            {/* Expand/Collapse Controls */}
            {viewMode === "tree" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                >
                  Collapse All
                </button>
              </div>
            )}

            {/* Add Category Button */}
            <button
              onClick={handleNewCategory}
              className="px-6 py-2.5 rounded-[10px] text-button bg-accent text-white hover:bg-accent/90 transition-all duration-200 shadow-soft hover:shadow-soft-lg flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories..."
            className="w-full px-4 py-3 pl-11 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark"
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

      {/* Categories Display */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-[18px] border border-border-light dark:border-border-dark shadow-soft overflow-hidden">
        {viewMode === "tree" ? (
          // Tree View
          paginatedCategories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-hover-light dark:bg-hover-dark border-b border-border-light dark:border-border-dark sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-left text-label text-text-primary-light dark:text-text-primary-dark">
                      Category
                    </th>
                    <th className="py-4 px-6 text-left text-label text-text-primary-light dark:text-text-primary-dark">
                      Products
                    </th>
                    <th className="py-4 px-6 text-left text-label text-text-primary-light dark:text-text-primary-dark">
                      Status
                    </th>
                    <th className="py-4 px-6 text-right text-label text-text-primary-light dark:text-text-primary-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.map((category, index) => renderCategoryRow(category, index))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 md:p-16 text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9h6a2.25 2.25 0 012.25 2.25v.75m-8.5 3A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16.5 0v-7.5A2.25 2.25 0 015.25 9h6a2.25 2.25 0 012.25 2.25v7.5m-9 0V18.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v1.5m-16.5 0h16.5"
                  />
                </svg>
              </div>
              <h3 className="text-heading-4 mb-2 text-text-primary-light dark:text-text-primary-dark">
                {searchQuery ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first category"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewCategory}
                  className="px-6 py-2.5 rounded-[10px] text-button bg-accent text-white hover:bg-accent/90 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                >
                  Create Category
                </button>
              )}
            </div>
          )
        ) : (
          // Table View
          paginatedCategories.length > 0 ? (
            <Table
              data={paginatedCategories}
              columns={columns}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={sortedCategories.length}
            />
          ) : (
            <div className="p-12 md:p-16 text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-16 h-16 text-text-secondary-light dark:text-text-secondary-dark opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9h6a2.25 2.25 0 012.25 2.25v.75m-8.5 3A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-16.5 0v-7.5A2.25 2.25 0 015.25 9h6a2.25 2.25 0 012.25 2.25v7.5m-9 0V18.75a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25v1.5m-16.5 0h16.5"
                  />
                </svg>
              </div>
              <h3 className="text-heading-4 mb-2 text-text-primary-light dark:text-text-primary-dark">
                {searchQuery ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by creating your first category"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleNewCategory}
                  className="px-6 py-2.5 rounded-[10px] text-button bg-accent text-white hover:bg-accent/90 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                >
                  Create Category
                </button>
              )}
            </div>
          )
        )}

        {/* Pagination */}
        {viewMode === "tree" && paginatedCategories.length > 0 && (
          <div className="border-t border-border-light dark:border-border-dark p-4 flex items-center justify-between">
            <div className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
              Showing {startIndex + 1} to {Math.min(endIndex, sortedCategories.length)} of {sortedCategories.length} categories
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-[8px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-[8px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
