import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import CategoryMenuDesktop from "./CategoryMenuDesktop";
import CategoryMenuMobile from "./CategoryMenuMobile";

/**
 * Main Category Menu Component
 * Handles fetching categories and rendering desktop/mobile versions
 */
export default function CategoryMenu() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/categories/tree");
        const result = await response.json();

        if (result.success && result.data.categories) {
          setCategories(result.data.categories);
        } else {
          setError(result.error || "Failed to load categories");
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Don't render if no categories or still loading initially
  if (loading && categories.length === 0) {
    return null; // Or return a skeleton loader
  }

  if (error && categories.length === 0) {
    return null; // Silently fail, menu won't show
  }

  // Only render desktop version here - mobile is handled in Navbar
  return <CategoryMenuDesktop categories={categories} />;
}

