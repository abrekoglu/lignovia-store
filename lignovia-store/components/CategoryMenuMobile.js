import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Mobile Category Menu Component
 * Accordion-style expanding menu for mobile devices
 */
export default function CategoryMenuMobile({ categories: initialCategories = [], onCategoryClick }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCategories || initialCategories.length === 0);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Fetch categories if not provided
  useEffect(() => {
    if (!initialCategories || initialCategories.length === 0) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/categories/tree");
          const result = await response.json();

          if (result.success && result.data.categories) {
            setCategories(result.data.categories);
          }
        } catch (err) {
          console.error("Error fetching categories:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }
  }, [initialCategories]);

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Render category with children recursively
  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id.toString());
    const paddingLeft = `${16 + level * 20}px`;

    return (
      <div key={category._id} className="border-b border-border-light dark:border-border-dark last:border-b-0">
        <div
          className={`
            flex items-center justify-between
            py-3.5
            text-text-primary-light dark:text-text-primary-dark
            transition-colors duration-200
            ${level === 0 ? "font-medium text-base" : "font-normal text-sm"}
          `}
          style={{ paddingLeft }}
        >
          <Link
            href={`/category/${category.slug}`}
            className="flex-1 hover:text-accent transition-colors duration-200 active:opacity-70"
            onClick={() => {
              if (onCategoryClick) {
                onCategoryClick();
              }
            }}
          >
            <span className="block">{category.name}</span>
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCategory(category._id.toString());
              }}
              className={`
                p-1.5 rounded-[8px]
                ml-2 flex-shrink-0
                text-text-secondary-light dark:text-text-secondary-dark
                hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark
                active:scale-95
                transition-all duration-200
              `}
              aria-label={isExpanded ? "Collapse" : "Expand"}
              aria-expanded={isExpanded}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div className="bg-hover-light/30 dark:bg-hover-dark/30 transition-all duration-200">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-hover-light dark:bg-hover-dark rounded-[10px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {categories.map((category) => renderCategory(category, 0))}
    </div>
  );
}
