import Head from "next/head";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import CategoryDropdown from "@/components/CategoryDropdown";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

/**
 * LIGNOVIA Category Create/Edit Page
 * 
 * Complete category management interface with LIGNOVIA design system
 * Supports category creation and editing with subcategory support
 * 
 * Routes:
 * - /admin/categories/new - Create new category
 * - /admin/categories/[id] - Edit existing category
 */

export default function CategoryForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { toastSuccess, toastError, toastWarning } = useToast();
  const { confirm } = useConfirmDialog();

  const isNewCategory = id === "new" || !id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    visibility: "public",
    sortOrder: 0,
    parentCategory: null,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  });
  const [allCategories, setAllCategories] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);
  const [circularReferenceWarning, setCircularReferenceWarning] = useState("");

  // Protect route
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

  // Load category data if editing
  useEffect(() => {
    if (!isNewCategory && id) {
      const fetchCategory = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/categories/${id}`);
          const result = await response.json();

          if (result.success) {
            const category = result.data;
            setFormData({
              name: category.name || "",
              slug: category.slug || "",
              description: category.description || "",
              image: category.image || "",
              visibility: category.visibility || "public",
              sortOrder: category.sortOrder || 0,
              parentCategory: category.parentCategory || null,
              seoTitle: category.seoTitle || "",
              seoDescription: category.seoDescription || "",
              seoKeywords: category.seoKeywords || [],
            });
          } else {
            toastError(result.error || "Failed to load category");
            router.push("/admin/categories");
          }
        } catch (error) {
          console.error("Error fetching category:", error);
          toastError("Failed to load category");
          router.push("/admin/categories");
        } finally {
          setLoading(false);
        }
      };

      fetchCategory();
    }
  }, [id, isNewCategory, router]);

  // Load all categories for dropdown
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          setAllCategories(result.data || []);
        } else {
          console.error("Error fetching categories:", result.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchAllCategories();
  }, []);

  // Load children count if editing
  useEffect(() => {
    if (!isNewCategory && id) {
      const fetchChildrenCount = async () => {
        try {
          const response = await fetch("/api/categories");
          const result = await response.json();

          if (result.success) {
            const categories = result.data || [];
            const children = categories.filter(
              (cat) => cat.parentCategory && cat.parentCategory.toString() === id
            );
            setChildrenCount(children.length);
          }
        } catch (error) {
          console.error("Error fetching children count:", error);
        }
      };

      fetchChildrenCount();
    }
  }, [id, isNewCategory]);

  // Get parent category from URL (for "Add Subcategory" action)
  useEffect(() => {
    if (!router.isReady) return;
    const { parent } = router.query;
    if (parent && isNewCategory) {
      setFormData((prev) => ({
        ...prev,
        parentCategory: parent,
      }));
    }
  }, [router.isReady, router.query, isNewCategory]);

  // Check for circular reference when parent category changes
  useEffect(() => {
    if (!isNewCategory && formData.parentCategory && id) {
      // Check if selected parent is a descendant of current category
      const checkCircularReference = (categoryId, parentId, categoriesList) => {
        if (!parentId) return false;
        const parent = categoriesList.find((c) => c._id === parentId);
        if (!parent) return false;
        if (parent._id === categoryId) return true;
        if (parent.parentCategory) {
          return checkCircularReference(categoryId, parent.parentCategory, categoriesList);
        }
        return false;
      };

      const isCircular = checkCircularReference(id, formData.parentCategory, allCategories);
      if (isCircular) {
        setCircularReferenceWarning(
          "Warning: Creating a circular reference is not allowed. This category cannot be its own parent or descendant."
        );
      } else {
        setCircularReferenceWarning("");
      }
    } else {
      setCircularReferenceWarning("");
    }
  }, [formData.parentCategory, id, isNewCategory, allCategories]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  // Handle save
  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toastError("Category name is required");
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      toastError("Category slug is required");
      return;
    }

    setSaving(true);

    try {
      const url = isNewCategory ? "/api/categories" : `/api/categories/${id}`;
      const method = isNewCategory ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description || "",
          image: formData.image || "",
          visibility: formData.visibility || "public",
          sortOrder: formData.sortOrder || 0,
          parentCategory: formData.parentCategory || null,
          seoTitle: formData.seoTitle || "",
          seoDescription: formData.seoDescription || "",
          seoKeywords: formData.seoKeywords || [],
        }),
      });

      const result = await response.json();

      if (result.success) {
        toastSuccess(
          isNewCategory ? "Category created successfully" : "Category updated successfully"
        );
        // Redirect to categories list - the list page will refetch automatically
        router.push("/admin/categories");
      } else {
        toastError(result.error || `Failed to ${isNewCategory ? "create" : "update"} category`);
        setSaving(false);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toastError(`Failed to ${isNewCategory ? "create" : "update"} category`);
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (isNewCategory) return;

    // Check if category has children
    if (childrenCount > 0) {
      const confirmed = await confirm({
        title: "Delete Category with Subcategories?",
        message: `This category has ${childrenCount} subcategor${childrenCount === 1 ? "y" : "ies"}. Please move or delete subcategories first.`,
        confirmText: "Cancel",
        cancelText: "Cancel",
        iconType: "alert",
        variant: "destructive",
      });
      return;
    }

    const confirmed = await confirm({
      title: "Delete Category?",
      message: `Are you sure you want to delete "${formData.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toastSuccess("Category deleted successfully");
        router.push("/admin/categories");
      } else {
        toastError(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toastError("Failed to delete category");
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>{isNewCategory ? "Create Category" : "Edit Category"} - LIGNOVIA Admin</title>
        <meta name="description" content={isNewCategory ? "Create a new category" : "Edit category"} />
      </Head>

      {/* Header Section */}
      <div className="mb-6 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
              <Link href="/admin/categories" className="hover:text-accent transition-colors duration-200">
                Categories
              </Link>
              <span>/</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {isNewCategory ? "Create" : "Edit"}
              </span>
            </nav>
            
            {/* Page Title */}
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              {isNewCategory ? "Create Category" : "Edit Category"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/categories")}
              className="px-4 py-2 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
            >
              Cancel
            </button>
            {!isNewCategory && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-[10px] text-body-sm bg-error-light/10 dark:bg-error-dark/10 border border-error-light/30 dark:border-error-dark/30 text-error-light dark:text-error-dark hover:bg-error-light/20 dark:hover:bg-error-dark/20 transition-all duration-200"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-[10px] text-button bg-accent text-white hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
            >
              {saving ? "Saving..." : isNewCategory ? "Create" : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-[18px] border border-border-light dark:border-border-dark p-6 lg:p-8 shadow-soft tab-content-enter">
        <div className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="pb-4 border-b border-border-light dark:border-border-dark">
              <h2 className="text-heading-4 text-text-primary-light dark:text-text-primary-dark">
                Basic Information
              </h2>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Essential category details
              </p>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                Category Name <span className="text-error-light dark:text-error-dark">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter category name"
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                Slug <span className="text-error-light dark:text-error-dark">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="category-slug"
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
              <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
                URL-friendly identifier (auto-generated from name)
              </p>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Category description (optional)"
                rows="4"
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                Category Image
              </label>
              <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-[14px] p-8 text-center hover:border-accent transition-colors duration-200">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    // TODO: Handle image upload
                    // This is just structure - no business logic
                  }}
                  className="hidden"
                  id="category-image-upload"
                />
                <label
                  htmlFor="category-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Click to upload or drag and drop
                  </span>
                </label>
                {formData.image && (
                  <div className="mt-4">
                    <img src={formData.image} alt="Category" className="w-32 h-32 object-cover rounded-[10px] mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Settings Section */}
          <div className="space-y-6 pt-6 border-t border-border-light dark:border-border-dark">
            <div className="pb-4">
              <h2 className="text-heading-4 text-text-primary-light dark:text-text-primary-dark">
                Settings
              </h2>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Category visibility and organization
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                  Visibility
                </label>
                <div className="flex flex-wrap gap-3">
                  {["public", "private"].map((visibility) => {
                    const isActive = formData.visibility === visibility;
                    return (
                      <button
                        key={visibility}
                        onClick={() => handleChange("visibility", visibility)}
                        className={`
                          px-4 py-2 rounded-[10px] text-body-sm font-medium transition-all duration-200
                          ${
                            isActive
                              ? "bg-accent text-white shadow-soft"
                              : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                          }
                        `}
                      >
                        {visibility === "public" ? "Public" : "Private"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                />
                <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                Parent Category
              </label>
              <CategoryDropdown
                value={formData.parentCategory}
                onChange={(value) => handleChange("parentCategory", value)}
                categories={allCategories}
                placeholder="None (Top-level category)"
                excludeCategoryId={isNewCategory ? null : id}
                showBreadcrumb={true}
                className="w-full"
              />
              <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Select a parent category to make this a subcategory. Leave empty for a top-level category.
              </p>
              {circularReferenceWarning && (
                <div className="mt-2 p-3 rounded-[10px] bg-warning-light/10 dark:bg-warning-dark/10 border border-warning-light/30 dark:border-warning-dark/30 text-warning-light dark:text-warning-dark text-body-sm">
                  {circularReferenceWarning}
                </div>
              )}
            </div>

            {/* Show children count if editing */}
            {!isNewCategory && childrenCount > 0 && (
              <div className="mt-4 p-4 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-5 h-5 text-accent"
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
                  <span className="text-body-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    This category has {childrenCount} subcategor{childrenCount === 1 ? "y" : "ies"}
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
                  If you delete this category, you'll need to handle its subcategories first.
                </p>
              </div>
            )}

            {/* Quick Action: Add Subcategory */}
            {!isNewCategory && (
              <div className="mt-4">
                <button
                  onClick={() => router.push(`/admin/categories/new?parent=${id}`)}
                  className="px-4 py-2 rounded-[10px] text-body-sm bg-accent/10 dark:bg-accent/20 border border-accent/30 text-accent hover:bg-accent/20 dark:hover:bg-accent/30 transition-all duration-200 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
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
                  Add Subcategory
                </button>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="space-y-6 pt-6 border-t border-border-light dark:border-border-dark">
            <div className="pb-4">
              <h2 className="text-heading-4 text-text-primary-light dark:text-text-primary-dark">
                SEO Settings
              </h2>
              <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Optimize category page for search engines
              </p>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={(e) => handleChange("seoTitle", e.target.value)}
                placeholder="SEO title (max 60 characters)"
                maxLength="60"
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
              <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
                {formData.seoTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                SEO Description
              </label>
              <textarea
                value={formData.seoDescription}
                onChange={(e) => handleChange("seoDescription", e.target.value)}
                placeholder="SEO description (max 160 characters)"
                rows="3"
                maxLength="160"
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
              />
              <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
                {formData.seoDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
                SEO Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.seoKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-body-sm"
                  >
                    {keyword}
                    <button
                      onClick={() => {
                        const newKeywords = formData.seoKeywords.filter((_, i) => i !== index);
                        handleChange("seoKeywords", newKeywords);
                      }}
                      className="hover:text-error-light dark:text-error-dark transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add keywords (press Enter)"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    e.preventDefault();
                    handleChange("seoKeywords", [...formData.seoKeywords, e.target.value.trim().toLowerCase()]);
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

