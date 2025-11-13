import { useState, useRef, useEffect } from "react";
import Link from "next/link";

/**
 * Desktop Category Menu Component
 * Multi-level dropdown menu with hover support
 */
export default function CategoryMenuDesktop({ categories = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [openSubmenus, setOpenSubmenus] = useState(new Set());
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setHoveredCategoryId(null);
        setOpenSubmenus(new Set());
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Handle mouse leave with delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredCategoryId(null);
      setOpenSubmenus(new Set());
    }, 300); // Increased delay for better UX with nested menus
  };

  // Clear timeout on mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHoveredCategoryId(null);
      setOpenSubmenus(new Set());
    }
  };

  // Handle category hover
  const handleCategoryHover = (categoryId, hasChildren) => {
    if (hasChildren) {
      setHoveredCategoryId(categoryId);
      setOpenSubmenus((prev) => new Set(prev).add(categoryId));
    } else {
      // Clear hover state if category has no children
      setHoveredCategoryId(null);
    }
  };

  // Render nested submenu recursively
  const renderSubmenu = (category, level = 1) => {
    if (!category.children || category.children.length === 0) {
      return null;
    }

    const isHovered = hoveredCategoryId === category._id.toString();
    const maxWidth = level === 1 ? "w-64" : level === 2 ? "w-56" : "w-52";

    return (
      <div
        className={`
          absolute left-full top-0 ml-2
          ${maxWidth}
          bg-surface-light dark:bg-surface-dark
          border border-border-light dark:border-border-dark
          rounded-[12px]
          shadow-lg
          py-2
          transition-opacity duration-200 ease-out
          ${isHovered ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}
          ${level === 1 ? "z-50" : level === 2 ? "z-40" : "z-30"}
        `}
        onMouseEnter={(e) => {
          e.stopPropagation();
          handleCategoryHover(category._id.toString(), true);
        }}
        onMouseLeave={() => {
          // Clear hover when leaving submenu
          setHoveredCategoryId((prev) => (prev === category._id.toString() ? null : prev));
        }}
      >
        {category.children.map((child) => (
          <div
            key={child._id}
            className="relative group"
            onMouseEnter={(e) => {
              e.stopPropagation();
              handleCategoryHover(child._id.toString(), child.children && child.children.length > 0);
            }}
          >
            <Link
              href={`/category/${child.slug}`}
              className={`
                block px-4 py-2.5
                text-sm font-medium
                text-text-primary-light dark:text-text-primary-dark
                hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-200
                ${child.children && child.children.length > 0 ? "pr-8" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{child.name}</span>
                {child.children && child.children.length > 0 && (
                  <svg
                    className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </Link>
            {/* Recursively render nested children */}
            {child.children && child.children.length > 0 && renderSubmenu(child, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Categories Button */}
      <button
        onClick={toggleMenu}
        className={`
          flex items-center gap-2
          px-4 py-2.5
          rounded-[10px]
          text-sm font-medium
          text-text-primary-light dark:text-text-primary-dark
          hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark
          transition-all duration-200
          ${isOpen ? "text-accent bg-hover-light dark:bg-hover-dark" : ""}
        `}
        aria-label="Categories menu"
        aria-expanded={isOpen}
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
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
        <span>Categories</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 mt-2
            w-64
            bg-surface-light dark:bg-surface-dark
            border border-border-light dark:border-border-dark
            rounded-[12px]
            shadow-lg
            py-2
            z-50
            modal-content-enter
          `}
        >
          {categories.map((category) => (
            <div
              key={category._id}
              className="relative group"
              onMouseEnter={(e) => {
                e.stopPropagation();
                handleCategoryHover(category._id.toString(), category.children && category.children.length > 0);
              }}
              onMouseLeave={() => {
                // Clear hover only if we're not hovering a submenu
                if (hoveredCategoryId !== category._id.toString()) {
                  setHoveredCategoryId(null);
                }
              }}
            >
              <Link
                href={`/category/${category.slug}`}
                className={`
                  block px-4 py-2.5
                  text-sm font-medium
                  text-text-primary-light dark:text-text-primary-dark
                  hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark
                  transition-colors duration-200
                  ${category.children && category.children.length > 0 ? "pr-8" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  {category.children && category.children.length > 0 && (
                    <svg
                      className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </Link>
              {/* Render submenu if category has children */}
              {category.children && category.children.length > 0 && renderSubmenu(category, 1)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

