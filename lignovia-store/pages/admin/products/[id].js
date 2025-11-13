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
 * LIGNOVIA Product Create/Edit Page
 * 
 * Complete product management interface with tab-based navigation
 * Supports all fields from the upgraded Product model
 * 
 * Routes:
 * - /admin/products/new - Create new product
 * - /admin/products/[id] - Edit existing product
 */

// Tab Configuration
const TABS = [
  { id: "basic", label: "Basic Info", icon: "info" },
  { id: "pricing", label: "Pricing", icon: "dollar" },
  { id: "inventory", label: "Inventory", icon: "box" },
  { id: "images", label: "Images", icon: "image" },
  { id: "variants", label: "Variants", icon: "layers" },
  { id: "attributes", label: "Attributes", icon: "settings" },
  { id: "shipping", label: "Shipping", icon: "truck" },
  { id: "seo", label: "SEO", icon: "search" },
  { id: "status", label: "Status & Visibility", icon: "eye" },
  { id: "notes", label: "Internal Notes", icon: "file" },
];

// Icon Component
const TabIcon = ({ icon }) => {
  const icons = {
    info: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
    dollar: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    box: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    image: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6.75v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    layers: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    truck: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25c0-4.556-4.03-8.25-9-8.25a9.764 9.764 0 00-2.555.325A9.954 9.954 0 003 11.25v7.875c0 .621.504 1.125 1.125 1.125h1.5m6-4.5H21m-3.75-4.5H21m-1.125 4.5H18m-2.25-4.5H15m-2.25 4.5h-1.5m-1.5-4.5H12m-1.5 4.5H9.75m0-4.5H8.25m0 4.5H6m12-4.5v1.5m0 0V16.5m0-1.5v-1.5m0 0H18m-6 0v1.5m0 0V16.5m0-1.5v-1.5m0 0H12" />
      </svg>
    ),
    search: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    eye: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    file: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  };

  return icons[icon] || null;
};

export default function ProductForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const { toastSuccess, toastError, toastWarning } = useToast();
  const { confirm } = useConfirmDialog();

  const isNewProduct = id === "new" || !id;
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prevTab, setPrevTab] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    shortDescription: "",
    description: "",
    slug: "",
    category: "",
    subcategory: "",
    tags: [],
    brand: "LIGNOVIA",
    
    // Pricing
    price: "",
    compareAtPrice: "",
    currency: "TRY",
    
    // Inventory
    inStock: true,
    stock: 0,
    lowStockThreshold: 10,
    sku: "",
    barcode: "",
    inventoryLocation: "",
    
    // Images
    mainImage: "",
    images: [],
    thumbnail: "",
    video: "",
    zoomImage: "",
    
    // Variants
    hasVariants: false,
    variantGroups: [],
    variants: [],
    
    // Attributes
    material: "",
    finish: "",
    dimensions: {
      width: "",
      height: "",
      depth: "",
      thickness: "",
      unit: "cm",
    },
    weight: "",
    weightUnit: "kg",
    careInstructions: "",
    warranty: "",
    
    // Shipping
    packageDimensions: {
      length: "",
      width: "",
      height: "",
      weight: "",
      unit: "cm",
      weightUnit: "kg",
    },
    packageWeight: "",
    packageWeightUnit: "kg",
    shippingClass: "standard",
    processingTime: "1-3 days",
    
    // SEO
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
    ogImage: "",
    
    // Status & Visibility
    status: "published",
    visibility: "public",
    
    // Internal Notes
    notes: "",
  });

  const [categories, setCategories] = useState([]);

  // Load categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (result.success) {
          setCategories(result.data || []);
        } else {
          console.error("Error fetching categories:", result.error);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Protect route
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/products");
      return;
    }

    const allowedAdminEmails = ["abrekoglu@gmail.com"];
    if (session?.user?.email && !allowedAdminEmails.includes(session.user.email)) {
      router.push("/");
      return;
    }
  }, [status, session, router]);

  // Load product data if editing
  useEffect(() => {
    if (!isNewProduct && id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/products/${id}`);
          const result = await response.json();

          if (result.success) {
            const product = result.data;
            setFormData({
              // Basic Info
              name: product.name || "",
              shortDescription: product.shortDescription || "",
              description: product.description || "",
              slug: product.slug || "",
              // Convert category to string (handles ObjectId from MongoDB)
              category: product.category ? String(product.category) : "",
              subcategory: product.subcategory ? String(product.subcategory) : "",
              tags: product.tags || [],
              brand: product.brand || "LIGNOVIA",
              // Pricing
              price: product.price || "",
              compareAtPrice: product.compareAtPrice || "",
              currency: product.currency || "TRY",
              // Inventory
              inStock: product.inStock !== undefined ? product.inStock : true,
              stock: product.stock || 0,
              lowStockThreshold: product.lowStockThreshold || 10,
              sku: product.sku || "",
              barcode: product.barcode || "",
              inventoryLocation: product.inventoryLocation || "",
              // Images
              mainImage: product.mainImage || "",
              images: product.images || [],
              thumbnail: product.thumbnail || "",
              video: product.video || "",
              zoomImage: product.zoomImage || "",
              // Variants
              hasVariants: product.hasVariants || false,
              variantGroups: Array.isArray(product.variantGroups) ? product.variantGroups.map((group) => ({
                name: group.name || "",
                options: Array.isArray(group.options) ? group.options.map((opt) => ({
                  name: opt.name || "",
                  value: opt.value || "",
                })) : [],
              })) : [],
              variants: Array.isArray(product.variants) ? product.variants.map((variant) => ({
                name: variant.name || "",
                optionValues: variant.optionValues ? (variant.optionValues instanceof Map ? Object.fromEntries(variant.optionValues) : variant.optionValues) : {},
                price: variant.price || 0,
                compareAtPrice: variant.compareAtPrice || null,
                stock: variant.stock || 0,
                sku: variant.sku || "",
                barcode: variant.barcode || "",
                image: variant.image || "",
                inStock: variant.inStock !== undefined ? variant.inStock : true,
                isDefault: variant.isDefault || false,
              })) : [],
              // Attributes
              material: product.material || "",
              finish: product.finish || "",
              dimensions: product.dimensions || { width: "", height: "", depth: "", thickness: "", unit: "cm" },
              weight: product.weight || "",
              weightUnit: product.weightUnit || "kg",
              careInstructions: product.careInstructions || "",
              warranty: product.warranty || "",
              // Shipping
              packageDimensions: product.packageDimensions || { length: "", width: "", height: "", weight: "", unit: "cm", weightUnit: "kg" },
              packageWeight: product.packageWeight || "",
              packageWeightUnit: product.packageWeightUnit || "kg",
              shippingClass: product.shippingClass || "standard",
              processingTime: product.processingTime || "1-3 days",
              // SEO
              seoTitle: product.seoTitle || "",
              seoDescription: product.seoDescription || "",
              seoKeywords: product.seoKeywords || [],
              ogImage: product.ogImage || "",
              // Status & Visibility
              status: product.status || "published",
              visibility: product.visibility || "public",
              // Internal Notes
              notes: product.notes || "",
            });
          } else {
            toastError(result.error || "Failed to load product");
            router.push("/admin/products");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          toastError("Failed to load product");
          router.push("/admin/products");
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isNewProduct, router]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested field changes
  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Handle save
  const handleSave = async (draft = false) => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toastError("Product name is required");
      return;
    }

    if (!formData.slug || !formData.slug.trim()) {
      toastError("Product slug is required");
      return;
    }

    if (!formData.price || formData.price === "") {
      toastError("Product price is required");
      return;
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug.trim().toLowerCase())) {
      toastError("Slug must be a valid URL-friendly string (lowercase letters, numbers, and hyphens only)");
      return;
    }

    setSaving(true);

    try {
      // Prepare product data
      const productData = {
        // Basic Info
        name: formData.name.trim(),
        shortDescription: formData.shortDescription || "",
        description: formData.description || "",
        slug: formData.slug.trim().toLowerCase(),
        // Ensure category is a string (convert ObjectId if needed)
        category: formData.category ? String(formData.category) : "",
        subcategory: formData.subcategory ? String(formData.subcategory) : "",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        brand: formData.brand || "LIGNOVIA",
        // Pricing
        price: Number(formData.price) || 0,
        compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
        currency: formData.currency || "TRY",
        // Inventory
        inStock: formData.inStock !== undefined ? formData.inStock : true,
        stock: Number(formData.stock) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        sku: formData.sku || "",
        barcode: formData.barcode || "",
        inventoryLocation: formData.inventoryLocation || "",
        // Images
        mainImage: formData.mainImage || "",
        images: Array.isArray(formData.images) ? formData.images : [],
        thumbnail: formData.thumbnail || "",
        video: formData.video || "",
        zoomImage: formData.zoomImage || "",
        // Backward compatibility
        image: formData.mainImage || formData.images?.[0] || "",
        // Variants
        hasVariants: formData.hasVariants || false,
        variantGroups: Array.isArray(formData.variantGroups) ? formData.variantGroups.map((group) => ({
          name: group.name || "",
          options: Array.isArray(group.options) ? group.options.map((opt) => ({
            name: opt.name || "",
            value: opt.value || "",
          })) : [],
        })) : [],
        variants: Array.isArray(formData.variants) ? formData.variants.map((variant) => ({
          name: variant.name || "",
          optionValues: variant.optionValues || {},
          price: variant.price ? Number(variant.price) : 0,
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
          stock: variant.stock ? Number(variant.stock) : 0,
          sku: variant.sku || "",
          barcode: variant.barcode || "",
          image: variant.image || "",
          inStock: variant.inStock !== undefined ? variant.inStock : true,
          isDefault: variant.isDefault || false,
        })) : [],
        // Attributes
        material: formData.material || "",
        finish: formData.finish || "",
        dimensions: formData.dimensions || {},
        weight: formData.weight ? Number(formData.weight) : null,
        weightUnit: formData.weightUnit || "kg",
        careInstructions: formData.careInstructions || "",
        warranty: formData.warranty || "",
        // Shipping
        packageDimensions: formData.packageDimensions || {},
        packageWeight: formData.packageWeight ? Number(formData.packageWeight) : null,
        packageWeightUnit: formData.packageWeightUnit || "kg",
        shippingClass: formData.shippingClass || "standard",
        processingTime: formData.processingTime || "1-3 days",
        // SEO
        seoTitle: formData.seoTitle || "",
        seoDescription: formData.seoDescription || "",
        seoKeywords: Array.isArray(formData.seoKeywords) ? formData.seoKeywords : [],
        ogImage: formData.ogImage || "",
        // Status & Visibility
        status: draft ? "draft" : (formData.status || "published"),
        visibility: formData.visibility || "public",
        // Internal Notes
        notes: formData.notes || "",
      };

      console.log("Saving product:", { isNewProduct, id, productData });

      const url = isNewProduct ? "/api/products" : `/api/products/${id}`;
      const method = isNewProduct ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        toastSuccess(draft ? "Product saved as draft" : isNewProduct ? "Product created successfully" : "Product updated successfully");
        // Redirect to products list
        router.push("/admin/products");
      } else {
        console.error("Error saving product:", result.error);
        toastError(result.error || `Failed to ${isNewProduct ? "create" : "update"} product`);
        setSaving(false);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toastError(`Failed to ${isNewProduct ? "create" : "update"} product`);
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (isNewProduct) return;

    const confirmed = await confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (confirmed) {
      // TODO: Implement delete logic
      // This is just structure - no business logic
      toastSuccess("Product deleted successfully");
      router.push("/admin/products");
    }
  };

  if (status === "loading") {
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
        <title>{isNewProduct ? "Create Product" : "Edit Product"} - LIGNOVIA Admin</title>
        <meta name="description" content={isNewProduct ? "Create a new product" : "Edit product"} />
      </Head>

      {/* Header Section */}
      <div className="mb-6 pb-6 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
              <Link href="/admin/products" className="hover:text-accent transition-colors duration-200">
                Products
              </Link>
              <span>/</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {isNewProduct ? "Create" : "Edit"}
              </span>
            </nav>
            
            {/* Page Title */}
            <h1 className="text-3xl lg:text-4xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              {isNewProduct ? "Create Product" : "Edit Product"}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="px-4 py-2 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            {!isNewProduct && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-[10px] text-body-sm bg-error-light/10 dark:bg-error-dark/10 border border-error-light/30 dark:border-error-dark/30 text-error-light dark:text-error-dark hover:bg-error-light/20 dark:hover:bg-error-dark/20 transition-all duration-200"
              >
                Delete
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-2 rounded-[10px] text-button bg-accent text-white hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-soft-lg"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border-light dark:border-border-dark scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setPrevTab(activeTab);
                  setActiveTab(tab.id);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-t-[10px] text-body-sm font-medium whitespace-nowrap
                  transition-all duration-200 relative
                  ${
                    isActive
                      ? "bg-accent/20 text-accent border-b-2 border-accent"
                      : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-hover-light dark:hover:bg-hover-dark hover:text-accent"
                  }
                `}
              >
                <TabIcon icon={tab.icon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-surface-light dark:bg-surface-dark rounded-[18px] border border-border-light dark:border-border-dark p-6 lg:p-8 shadow-soft">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="space-y-6 tab-content-enter">
            <BasicInfoTab formData={formData} onChange={handleChange} onNestedChange={handleNestedChange} categories={categories} />
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === "pricing" && (
          <div className="space-y-6 tab-content-enter">
            <PricingTab formData={formData} onChange={handleChange} />
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-6 tab-content-enter">
            <InventoryTab formData={formData} onChange={handleChange} />
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-6 tab-content-enter">
            <ImagesTab formData={formData} onChange={handleChange} />
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === "variants" && (
          <div className="space-y-6 tab-content-enter">
            <VariantsTab formData={formData} onChange={handleChange} onNestedChange={handleNestedChange} />
          </div>
        )}

        {/* Attributes Tab */}
        {activeTab === "attributes" && (
          <div className="space-y-6 tab-content-enter">
            <AttributesTab formData={formData} onChange={handleChange} onNestedChange={handleNestedChange} />
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === "shipping" && (
          <div className="space-y-6 tab-content-enter">
            <ShippingTab formData={formData} onChange={handleChange} onNestedChange={handleNestedChange} />
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-6 tab-content-enter">
            <SEOTab formData={formData} onChange={handleChange} />
          </div>
        )}

        {/* Status & Visibility Tab */}
        {activeTab === "status" && (
          <div className="space-y-6 tab-content-enter">
            <StatusTab formData={formData} onChange={handleChange} />
          </div>
        )}

        {/* Internal Notes Tab */}
        {activeTab === "notes" && (
          <div className="space-y-6 tab-content-enter">
            <NotesTab formData={formData} onChange={handleChange} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Tab Components (Structure Only - No Business Logic)

function BasicInfoTab({ formData, onChange, onNestedChange, categories = [] }) {
  return (
    <>
      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Product Name <span className="text-error-light dark:text-error-dark">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Enter product name"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Short Description
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => onChange("shortDescription", e.target.value)}
          placeholder="Brief product description (max 500 characters)"
          rows="3"
          maxLength="500"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {formData.shortDescription.length}/500 characters
        </p>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Full Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Full product description"
          rows="8"
          maxLength="10000"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {formData.description.length}/10000 characters
        </p>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Category
        </label>
        <CategoryDropdown
          value={formData.category}
          onChange={(value) => {
            onChange("category", value);
            // Auto-update category path when category changes
            // TODO: Fetch category path from API based on selected category ID
          }}
          categories={categories}
          placeholder="Select category"
          showBreadcrumb={true}
          className="w-full"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          Select a category. Subcategories are nested under their parent categories. The full path will be shown automatically.
        </p>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-body-sm"
            >
              {tag}
              <button
                onClick={() => {
                  const newTags = formData.tags.filter((_, i) => i !== index);
                  onChange("tags", newTags);
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
          placeholder="Add tags (press Enter)"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              e.preventDefault();
              onChange("tags", [...formData.tags, e.target.value.trim()]);
              e.target.value = "";
            }
          }}
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
          onChange={(e) => onChange("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          placeholder="product-slug"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          URL-friendly identifier (auto-generated from name)
        </p>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Brand
        </label>
        <input
          type="text"
          value={formData.brand}
          onChange={(e) => onChange("brand", e.target.value)}
          placeholder="LIGNOVIA"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
      </div>
    </>
  );
}

function PricingTab({ formData, onChange }) {
  const discountPercentage = formData.compareAtPrice && formData.price
    ? Math.round(((formData.compareAtPrice - formData.price) / formData.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Base Price <span className="text-error-light dark:text-error-dark">*</span>
          </label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => onChange("price", e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Compare-at Price
          </label>
          <input
            type="number"
            value={formData.compareAtPrice}
            onChange={(e) => onChange("compareAtPrice", e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
          <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
            Original price for discount display
          </p>
        </div>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Currency
        </label>
        <select
          value={formData.currency}
          onChange={(e) => onChange("currency", e.target.value)}
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        >
          <option value="TRY">TRY - Turkish Lira</option>
          <option value="USD">USD - US Dollar</option>
          <option value="EUR">EUR - Euro</option>
          <option value="GBP">GBP - British Pound</option>
          <option value="CAD">CAD - Canadian Dollar</option>
          <option value="AUD">AUD - Australian Dollar</option>
          <option value="JPY">JPY - Japanese Yen</option>
          <option value="CNY">CNY - Chinese Yuan</option>
        </select>
      </div>

      {/* Price Preview */}
      {formData.price && (
        <div className="mt-6 p-6 rounded-[14px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
          <h3 className="text-heading-5 mb-4">Storefront Preview</h3>
          <div className="flex items-center gap-4">
            {formData.compareAtPrice && parseFloat(formData.compareAtPrice) > parseFloat(formData.price) ? (
              <>
                <span className="text-2xl font-medium text-text-primary-light dark:text-text-primary-dark">
                  {formData.currency} {parseFloat(formData.price).toFixed(2)}
                </span>
                <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark line-through">
                  {formData.currency} {parseFloat(formData.compareAtPrice).toFixed(2)}
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-body-sm font-medium">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-medium text-text-primary-light dark:text-text-primary-dark">
                {formData.currency} {parseFloat(formData.price).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function InventoryTab({ formData, onChange }) {
  const stockStatus = formData.stock === 0
    ? "Out of Stock"
    : formData.stock <= formData.lowStockThreshold
    ? "Low Stock"
    : "In Stock";

  const stockStatusColor = formData.stock === 0
    ? "bg-error-light/20 text-error-light dark:bg-error-dark/20 dark:text-error-dark"
    : formData.stock <= formData.lowStockThreshold
    ? "bg-accent/20 text-accent dark:bg-accent/30 dark:text-accent"
    : "bg-success-light/20 text-success-light dark:bg-success-dark/20 dark:text-success-dark";

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.inStock}
            onChange={(e) => onChange("inStock", e.target.checked)}
            className="w-5 h-5 rounded-[6px] border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark text-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
          />
          <span className="text-label text-text-primary-light dark:text-text-primary-dark">In Stock</span>
        </label>
        <span className={`px-3 py-1 rounded-full text-body-sm font-medium ${stockStatusColor}`}>
          {stockStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Stock Quantity
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => onChange("stock", parseInt(e.target.value) || 0)}
            placeholder="0"
            min="0"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Low Stock Threshold
          </label>
          <input
            type="number"
            value={formData.lowStockThreshold}
            onChange={(e) => onChange("lowStockThreshold", parseInt(e.target.value) || 10)}
            placeholder="10"
            min="0"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            SKU
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => onChange("sku", e.target.value)}
            placeholder="SKU-001"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Barcode
          </label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => onChange("barcode", e.target.value)}
            placeholder="EAN/UPC"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Inventory Location
        </label>
        <input
          type="text"
          value={formData.inventoryLocation}
          onChange={(e) => onChange("inventoryLocation", e.target.value)}
          placeholder="Warehouse / Location"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
      </div>
    </>
  );
}

function ImagesTab({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Main Image
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
            id="main-image-upload"
          />
          <label
            htmlFor="main-image-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <svg className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
              Click to upload or drag and drop
            </span>
          </label>
          {formData.mainImage && (
            <div className="mt-4">
              <img src={formData.mainImage} alt="Main" className="w-32 h-32 object-cover rounded-[10px] mx-auto" />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Gallery Images
        </label>
        <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-[14px] p-8 text-center hover:border-accent transition-colors duration-200">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              // TODO: Handle image upload
              // This is just structure - no business logic
            }}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <svg className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
              Upload multiple images
            </span>
          </label>
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-[10px]" />
                  <button
                    onClick={() => {
                      const newImages = formData.images.filter((_, i) => i !== index);
                      onChange("images", newImages);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-error-light/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function VariantsTab({ formData, onChange, onNestedChange }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedVariants, setExpandedVariants] = useState({});

  // Add variant group
  const addVariantGroup = () => {
    const newGroup = {
      name: "Color",
      options: [],
    };
    onChange("variantGroups", [...formData.variantGroups, newGroup]);
  };

  // Remove variant group
  const removeVariantGroup = (index) => {
    const newGroups = formData.variantGroups.filter((_, i) => i !== index);
    onChange("variantGroups", newGroups);
  };

  // Add option to variant group
  const addOptionToGroup = (groupIndex) => {
    const newGroups = [...formData.variantGroups];
    newGroups[groupIndex].options = [
      ...newGroups[groupIndex].options,
      { name: "", value: "" },
    ];
    onChange("variantGroups", newGroups);
  };

  // Remove option from variant group
  const removeOptionFromGroup = (groupIndex, optionIndex) => {
    const newGroups = [...formData.variantGroups];
    newGroups[groupIndex].options = newGroups[groupIndex].options.filter((_, i) => i !== optionIndex);
    onChange("variantGroups", newGroups);
  };

  // Update variant group option
  const updateVariantGroupOption = (groupIndex, optionIndex, field, value) => {
    const newGroups = [...formData.variantGroups];
    newGroups[groupIndex].options[optionIndex][field] = value;
    onChange("variantGroups", newGroups);
  };

  // Update variant group name
  const updateVariantGroupName = (groupIndex, name) => {
    const newGroups = [...formData.variantGroups];
    newGroups[groupIndex].name = name;
    onChange("variantGroups", newGroups);
  };

  // Add variant
  const addVariant = () => {
    const newVariant = {
      name: "",
      optionValues: {},
      price: formData.price || 0,
      compareAtPrice: null,
      stock: 0,
      sku: "",
      barcode: "",
      image: "",
      inStock: true,
      isDefault: false,
    };
    onChange("variants", [...formData.variants, newVariant]);
  };

  // Remove variant
  const removeVariant = (index) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    onChange("variants", newVariants);
  };

  // Update variant
  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index][field] = value;
    onChange("variants", newVariants);
  };

  // Update variant option value
  const updateVariantOptionValue = (variantIndex, optionName, value) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].optionValues = {
      ...newVariants[variantIndex].optionValues,
      [optionName]: value,
    };
    onChange("variants", newVariants);
  };

  // Toggle group expansion
  const toggleGroupExpansion = (index) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Toggle variant expansion
  const toggleVariantExpansion = (index) => {
    setExpandedVariants((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.hasVariants}
            onChange={(e) => onChange("hasVariants", e.target.checked)}
            className="w-5 h-5 rounded-[6px] border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark text-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
          />
          <span className="text-label text-text-primary-light dark:text-text-primary-dark">Enable Variants</span>
        </label>
      </div>

      {formData.hasVariants && (
        <div className="space-y-6">
          {/* Variant Groups Section */}
          <div className="p-6 rounded-[14px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-heading-5 mb-2">Variant Groups</h3>
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Define option groups (e.g., Color, Size, Material)
                </p>
              </div>
              <button
                onClick={addVariantGroup}
                className="px-4 py-2 rounded-[10px] text-body-sm bg-accent text-white hover:bg-accent/90 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                Add Group
              </button>
            </div>

            <div className="space-y-4">
              {formData.variantGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="p-4 rounded-[12px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleGroupExpansion(groupIndex)}
                        className="p-1 rounded-[6px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedGroups[groupIndex] ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <select
                        value={group.name}
                        onChange={(e) => updateVariantGroupName(groupIndex, e.target.value)}
                        className="flex-1 px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      >
                        <option value="Color">Color</option>
                        <option value="Size">Size</option>
                        <option value="Material">Material</option>
                        <option value="Finish">Finish</option>
                        <option value="Style">Style</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeVariantGroup(groupIndex)}
                      className="p-2 rounded-[6px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {expandedGroups[groupIndex] && (
                    <div className="space-y-3 mt-3">
                      {group.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) => updateVariantGroupOption(groupIndex, optionIndex, "name", e.target.value)}
                            placeholder="Option name"
                            className="flex-1 px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) => updateVariantGroupOption(groupIndex, optionIndex, "value", e.target.value)}
                            placeholder="Option value"
                            className="flex-1 px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                          <button
                            onClick={() => removeOptionFromGroup(groupIndex, optionIndex)}
                            className="p-2 rounded-[6px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOptionToGroup(groupIndex)}
                        className="px-3 py-2 rounded-[10px] text-body-sm bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {formData.variantGroups.length === 0 && (
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
                  No variant groups defined. Add a group to get started.
                </p>
              )}
            </div>
          </div>

          {/* Variants Section */}
          <div className="p-6 rounded-[14px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-heading-5 mb-2">Variants</h3>
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Manage individual product variants
                </p>
              </div>
              <button
                onClick={addVariant}
                className="px-4 py-2 rounded-[10px] text-body-sm bg-accent text-white hover:bg-accent/90 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
              >
                Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {formData.variants.map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="p-4 rounded-[12px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleVariantExpansion(variantIndex)}
                        className="p-1 rounded-[6px] text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedVariants[variantIndex] ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(variantIndex, "name", e.target.value)}
                        placeholder="Variant name"
                        className="flex-1 px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.isDefault}
                          onChange={(e) => updateVariant(variantIndex, "isDefault", e.target.checked)}
                          className="w-4 h-4 rounded-[4px] border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark text-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
                        />
                        <span className="text-caption text-text-secondary-light dark:text-text-secondary-dark">
                          Default
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={() => removeVariant(variantIndex)}
                      className="p-2 rounded-[6px] text-error-light dark:text-error-dark hover:bg-error-light/10 dark:hover:bg-error-dark/10 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {expandedVariants[variantIndex] && (
                    <div className="space-y-4 mt-4 pl-6 border-l-2 border-border-light dark:border-border-dark">
                      {/* Option Values */}
                      {formData.variantGroups.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-label text-text-primary-light dark:text-text-primary-dark">
                            Option Values
                          </label>
                          {formData.variantGroups.map((group, groupIndex) => (
                            <div key={groupIndex}>
                              <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">
                                {group.name}
                              </label>
                              <select
                                value={variant.optionValues[group.name] || ""}
                                onChange={(e) => updateVariantOptionValue(variantIndex, group.name, e.target.value)}
                                className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                              >
                                <option value="">Select {group.name}</option>
                                {group.options.map((option, optionIndex) => (
                                  <option key={optionIndex} value={option.value}>
                                    {option.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Variant Price */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                            Price
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variantIndex, "price", parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                            Compare-at Price
                          </label>
                          <input
                            type="number"
                            value={variant.compareAtPrice || ""}
                            onChange={(e) => updateVariant(variantIndex, "compareAtPrice", e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Variant Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variantIndex, "stock", parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer mt-6">
                            <input
                              type="checkbox"
                              checked={variant.inStock}
                              onChange={(e) => updateVariant(variantIndex, "inStock", e.target.checked)}
                              className="w-4 h-4 rounded-[4px] border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark text-accent focus:ring-2 focus:ring-accent/30 transition-all duration-200"
                            />
                            <span className="text-label text-text-primary-light dark:text-text-primary-dark">
                              In Stock
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Variant SKU & Barcode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) => updateVariant(variantIndex, "sku", e.target.value)}
                            placeholder="SKU-001"
                            className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                            Barcode
                          </label>
                          <input
                            type="text"
                            value={variant.barcode}
                            onChange={(e) => updateVariant(variantIndex, "barcode", e.target.value)}
                            placeholder="EAN/UPC"
                            className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Variant Image */}
                      <div>
                        <label className="block text-label mb-1 text-text-primary-light dark:text-text-primary-dark">
                          Variant Image
                        </label>
                        <div className="border-2 border-dashed border-border-light dark:border-border-dark rounded-[10px] p-4 text-center hover:border-accent transition-colors duration-200">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              // TODO: Handle image upload
                              // This is just structure - no business logic
                            }}
                            className="hidden"
                            id={`variant-image-${variantIndex}`}
                          />
                          <label
                            htmlFor={`variant-image-${variantIndex}`}
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <svg className="w-8 h-8 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-caption text-text-secondary-light dark:text-text-secondary-dark">
                              Upload image
                            </span>
                          </label>
                          {variant.image && (
                            <div className="mt-2">
                              <img src={variant.image} alt="Variant" className="w-16 h-16 object-cover rounded-[8px] mx-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {formData.variants.length === 0 && (
                <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
                  No variants defined. Add a variant to get started.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AttributesTab({ formData, onChange, onNestedChange }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Material
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => onChange("material", e.target.value)}
            placeholder="e.g., Oak, Maple, Walnut"
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Finish
          </label>
          <select
            value={formData.finish}
            onChange={(e) => onChange("finish", e.target.value)}
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            <option value="">Select finish</option>
            <option value="matte">Matte</option>
            <option value="oiled">Oiled</option>
            <option value="lacquered">Lacquered</option>
            <option value="varnished">Varnished</option>
            <option value="natural">Natural</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-label mb-4 text-text-primary-light dark:text-text-primary-dark">
          Dimensions
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Width</label>
            <input
              type="number"
              value={formData.dimensions.width}
              onChange={(e) => onNestedChange("dimensions", "width", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Height</label>
            <input
              type="number"
              value={formData.dimensions.height}
              onChange={(e) => onNestedChange("dimensions", "height", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Depth</label>
            <input
              type="number"
              value={formData.dimensions.depth}
              onChange={(e) => onNestedChange("dimensions", "depth", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Thickness</label>
            <input
              type="number"
              value={formData.dimensions.thickness}
              onChange={(e) => onNestedChange("dimensions", "thickness", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
        </div>
        <div className="mt-3">
          <select
            value={formData.dimensions.unit}
            onChange={(e) => onNestedChange("dimensions", "unit", e.target.value)}
            className="px-4 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => onChange("weight", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="flex-1 px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
            <select
              value={formData.weightUnit}
              onChange={(e) => onChange("weightUnit", e.target.value)}
              className="px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="g">g</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Care Instructions
        </label>
        <textarea
          value={formData.careInstructions}
          onChange={(e) => onChange("careInstructions", e.target.value)}
          placeholder="Care and maintenance instructions"
          rows="4"
          maxLength="2000"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {formData.careInstructions.length}/2000 characters
        </p>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Warranty
        </label>
        <input
          type="text"
          value={formData.warranty}
          onChange={(e) => onChange("warranty", e.target.value)}
          placeholder="e.g., 1 year warranty"
          maxLength="500"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {formData.warranty.length}/500 characters
        </p>
      </div>
    </>
  );
}

function ShippingTab({ formData, onChange, onNestedChange }) {
  return (
    <>
      <div>
        <label className="block text-label mb-4 text-text-primary-light dark:text-text-primary-dark">
          Package Dimensions
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Length</label>
            <input
              type="number"
              value={formData.packageDimensions.length}
              onChange={(e) => onNestedChange("packageDimensions", "length", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Width</label>
            <input
              type="number"
              value={formData.packageDimensions.width}
              onChange={(e) => onNestedChange("packageDimensions", "width", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-caption mb-1 text-text-secondary-light dark:text-text-secondary-dark">Height</label>
            <input
              type="number"
              value={formData.packageDimensions.height}
              onChange={(e) => onNestedChange("packageDimensions", "height", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="w-full px-3 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <select
            value={formData.packageDimensions.unit}
            onChange={(e) => onNestedChange("packageDimensions", "unit", e.target.value)}
            className="px-4 py-2 rounded-[10px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            <option value="cm">cm</option>
            <option value="in">in</option>
            <option value="m">m</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Package Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.packageWeight}
              onChange={(e) => onChange("packageWeight", e.target.value)}
              placeholder="0"
              step="0.1"
              min="0"
              className="flex-1 px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            />
            <select
              value={formData.packageWeightUnit}
              onChange={(e) => onChange("packageWeightUnit", e.target.value)}
              className="px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="g">g</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
            Shipping Class
          </label>
          <select
            value={formData.shippingClass}
            onChange={(e) => onChange("shippingClass", e.target.value)}
            className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
          >
            <option value="standard">Standard</option>
            <option value="expedited">Expedited</option>
            <option value="overnight">Overnight</option>
            <option value="fragile">Fragile</option>
            <option value="oversized">Oversized</option>
            <option value="free">Free Shipping</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Processing Time
        </label>
        <input
          type="text"
          value={formData.processingTime}
          onChange={(e) => onChange("processingTime", e.target.value)}
          placeholder="1-3 days"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
      </div>

      {/* Shipping Preview */}
      <div className="mt-6 p-6 rounded-[14px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V11.25c0-4.556-4.03-8.25-9-8.25a9.764 9.764 0 00-2.555.325A9.954 9.954 0 003 11.25v7.875c0 .621.504 1.125 1.125 1.125h1.5m6-4.5H21m-3.75-4.5H21m-1.125 4.5H18m-2.25-4.5H15m-2.25 4.5h-1.5m-1.5-4.5H12m-1.5 4.5H9.75m0-4.5H8.25m0 4.5H6m12-4.5v1.5m0 0V16.5m0-1.5v-1.5m0 0H18m-6 0v1.5m0 0V16.5m0-1.5v-1.5m0 0H12" />
          </svg>
          <h3 className="text-heading-5">Estimated Shipping</h3>
        </div>
        <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
          Processing: {formData.processingTime || "1-3 days"}
        </p>
        <p className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
          Shipping Class: {formData.shippingClass || "Standard"}
        </p>
      </div>
    </>
  );
}

function SEOTab({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          SEO Title
        </label>
        <input
          type="text"
          value={formData.seoTitle}
          onChange={(e) => onChange("seoTitle", e.target.value)}
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
          onChange={(e) => onChange("seoDescription", e.target.value)}
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
                  onChange("seoKeywords", newKeywords);
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
              onChange("seoKeywords", [...formData.seoKeywords, e.target.value.trim().toLowerCase()]);
              e.target.value = "";
            }
          }}
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          OpenGraph Image
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
            id="og-image-upload"
          />
          <label
            htmlFor="og-image-upload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <svg className="w-12 h-12 text-text-secondary-light dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-body-sm text-text-secondary-light dark:text-text-secondary-dark">
              Upload OpenGraph image
            </span>
          </label>
          {formData.ogImage && (
            <div className="mt-4">
              <img src={formData.ogImage} alt="OG" className="w-32 h-32 object-cover rounded-[10px] mx-auto" />
            </div>
          )}
        </div>
      </div>

      {/* SEO Preview */}
      {formData.seoTitle && (
        <div className="mt-6 p-6 rounded-[14px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark">
          <h3 className="text-heading-5 mb-4">Google Search Preview</h3>
          <div className="space-y-2">
            <p className="text-lg text-blue-600 dark:text-blue-400 line-clamp-1">
              {formData.seoTitle || formData.name}
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              https://lignovia.com/products/{formData.slug || "product-slug"}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
              {formData.seoDescription || formData.shortDescription || "Product description"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function StatusTab({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Product Status
        </label>
        <div className="flex flex-wrap gap-3">
          {["draft", "published", "archived"].map((status) => {
            const isActive = formData.status === status;
            return (
              <button
                key={status}
                onClick={() => onChange("status", status)}
                className={`
                  px-4 py-2 rounded-[10px] text-body-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-accent text-white shadow-soft"
                      : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

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
                onClick={() => onChange("visibility", visibility)}
                className={`
                  px-4 py-2 rounded-[10px] text-body-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-accent text-white shadow-soft"
                      : "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                  }
                `}
              >
                {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NotesTab({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block text-label mb-2 text-text-primary-light dark:text-text-primary-dark">
          Internal Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Internal notes (not shown on storefront)"
          rows="12"
          maxLength="5000"
          className="w-full px-4 py-3 rounded-[12px] bg-hover-light dark:bg-hover-dark border border-border-light dark:border-border-dark text-body text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all duration-200 resize-none"
        />
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {formData.notes.length}/5000 characters
        </p>
        <p className="text-caption text-text-secondary-light dark:text-text-secondary-dark mt-2">
          These notes are for internal use only and will not be displayed on the storefront.
        </p>
      </div>
    </>
  );
}

