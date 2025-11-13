/**
 * FILTER COMPONENTS USAGE EXAMPLES
 * 
 * This file contains usage examples for all filter components
 * in the LIGNOVIA Admin Panel.
 */

import { useState } from "react";
import {
  FilterDropdown,
  MultiSelectDropdown,
  FilterChip,
  FilterChips,
  DatePicker,
  DateRangePicker,
  ExpandableFilterPanel,
} from "./index";

// ============================================
// EXAMPLE 1: Filter Dropdown (Single Select)
// ============================================
export function ExampleFilterDropdown() {
  const [status, setStatus] = useState(null);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <FilterDropdown
      label="Order Status"
      options={statusOptions}
      value={status}
      onChange={setStatus}
      placeholder="All Statuses"
    />
  );
}

// ============================================
// EXAMPLE 2: Multi-Select Dropdown
// ============================================
export function ExampleMultiSelect() {
  const [categories, setCategories] = useState([]);

  const categoryOptions = [
    { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" },
    { value: "lighting", label: "Lighting" },
    { value: "accessories", label: "Accessories" },
  ];

  return (
    <MultiSelectDropdown
      label="Categories"
      options={categoryOptions}
      value={categories}
      onChange={setCategories}
      placeholder="Select categories"
    />
  );
}

// ============================================
// EXAMPLE 3: Filter Chips
// ============================================
export function ExampleFilterChips() {
  const [chips, setChips] = useState([
    { id: "1", label: "Status: Pending" },
    { id: "2", label: "Category: Furniture" },
    { id: "3", label: "Date: Jan 1 - Jan 31" },
  ]);

  const handleRemove = (chipToRemove) => {
    setChips(chips.filter((chip) => chip.id !== chipToRemove.id));
  };

  const handleClearAll = () => {
    setChips([]);
  };

  return (
    <div>
      <FilterChips chips={chips} onRemove={handleRemove} onClearAll={handleClearAll} />
    </div>
  );
}

// ============================================
// EXAMPLE 4: Date Picker (Single Date)
// ============================================
export function ExampleDatePicker() {
  const [date, setDate] = useState(null);

  return (
    <DatePicker
      label="Created Date"
      value={date}
      onChange={setDate}
      placeholder="Select date"
      minDate="2024-01-01"
      maxDate="2024-12-31"
    />
  );
}

// ============================================
// EXAMPLE 5: Date Range Picker
// ============================================
export function ExampleDateRangePicker() {
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  return (
    <DateRangePicker
      label="Date Range"
      value={dateRange}
      onChange={setDateRange}
      placeholder="Select date range"
      minDate="2024-01-01"
      maxDate="2024-12-31"
    />
  );
}

// ============================================
// EXAMPLE 6: Expandable Filter Panel (Orders)
// ============================================
export function ExampleOrdersFilterPanel() {
  const [filters, setFilters] = useState({
    status: null,
    paymentStatus: null,
    dateRange: { start: null, end: null },
    categories: [],
  });

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentOptions = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  const categoryOptions = [
    { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" },
    { value: "lighting", label: "Lighting" },
  ];

  const filterConfig = [
    {
      type: "dropdown",
      id: "status",
      label: "Order Status",
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
      options: statusOptions,
      placeholder: "All Statuses",
    },
    {
      type: "dropdown",
      id: "paymentStatus",
      label: "Payment Status",
      value: filters.paymentStatus,
      onChange: (value) => setFilters({ ...filters, paymentStatus: value }),
      options: paymentOptions,
      placeholder: "All Payment Statuses",
    },
    {
      type: "daterange",
      id: "dateRange",
      label: "Date Range",
      value: filters.dateRange,
      onChange: (value) => setFilters({ ...filters, dateRange: value }),
      placeholder: "Select date range",
    },
    {
      type: "multiselect",
      id: "categories",
      label: "Categories",
      value: filters.categories,
      onChange: (value) => setFilters({ ...filters, categories: value }),
      options: categoryOptions,
      placeholder: "Select categories",
    },
  ];

  const handleApply = () => {
    console.log("Applying filters:", filters);
    // Apply filters to data
  };

  const handleReset = () => {
    setFilters({
      status: null,
      paymentStatus: null,
      dateRange: { start: null, end: null },
      categories: [],
    });
  };

  return (
    <ExpandableFilterPanel
      title="Filter Orders"
      filters={filterConfig}
      onApply={handleApply}
      onReset={handleReset}
      defaultOpen={false}
    />
  );
}

// ============================================
// EXAMPLE 7: Expandable Filter Panel (Products)
// ============================================
export function ExampleProductsFilterPanel() {
  const [filters, setFilters] = useState({
    category: null,
    stockStatus: null,
    visibility: null,
    priceRange: { min: null, max: null },
    tags: [],
  });

  const categoryOptions = [
    { value: "furniture", label: "Furniture" },
    { value: "decor", label: "Decor" },
    { value: "lighting", label: "Lighting" },
  ];

  const stockOptions = [
    { value: "in-stock", label: "In Stock" },
    { value: "low-stock", label: "Low Stock" },
    { value: "out-of-stock", label: "Out of Stock" },
  ];

  const visibilityOptions = [
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "hidden", label: "Hidden" },
  ];

  const tagOptions = [
    { value: "featured", label: "Featured" },
    { value: "new", label: "New" },
    { value: "sale", label: "On Sale" },
  ];

  const filterConfig = [
    {
      type: "dropdown",
      id: "category",
      label: "Category",
      value: filters.category,
      onChange: (value) => setFilters({ ...filters, category: value }),
      options: categoryOptions,
      placeholder: "All Categories",
    },
    {
      type: "dropdown",
      id: "stockStatus",
      label: "Stock Status",
      value: filters.stockStatus,
      onChange: (value) => setFilters({ ...filters, stockStatus: value }),
      options: stockOptions,
      placeholder: "All Stock Statuses",
    },
    {
      type: "dropdown",
      id: "visibility",
      label: "Visibility",
      value: filters.visibility,
      onChange: (value) => setFilters({ ...filters, visibility: value }),
      options: visibilityOptions,
      placeholder: "All Visibilities",
    },
    {
      type: "multiselect",
      id: "tags",
      label: "Tags",
      value: filters.tags,
      onChange: (value) => setFilters({ ...filters, tags: value }),
      options: tagOptions,
      placeholder: "Select tags",
    },
  ];

  const handleApply = () => {
    console.log("Applying filters:", filters);
    // Apply filters to data
  };

  const handleReset = () => {
    setFilters({
      category: null,
      stockStatus: null,
      visibility: null,
      priceRange: { min: null, max: null },
      tags: [],
    });
  };

  return (
    <ExpandableFilterPanel
      title="Filter Products"
      filters={filterConfig}
      onApply={handleApply}
      onReset={handleReset}
      defaultOpen={false}
    />
  );
}

// ============================================
// EXAMPLE 8: Custom Filter Chip
// ============================================
export function ExampleCustomFilterChip() {
  const handleRemove = () => {
    console.log("Filter removed");
  };

  return (
    <div className="flex gap-2">
      <FilterChip label="Status: Pending" onRemove={handleRemove} variant="default" />
      <FilterChip label="Clear All" onRemove={null} variant="accent" />
    </div>
  );
}


