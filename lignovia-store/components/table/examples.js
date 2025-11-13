/**
 * LIGNOVIA Table Component Examples
 * 
 * This file demonstrates how to use the Table component with various configurations.
 */

import { useState } from "react";
import { Table } from "./index";

// Example 1: Basic Table
export function BasicTableExample() {
  const columns = [
    { key: "id", label: "ID", sortable: true, width: 100 },
    { key: "name", label: "Name", sortable: true, width: 200 },
    { key: "email", label: "Email", sortable: true, width: 250 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
  ];

  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      onSort={(column, direction) => console.log("Sort:", column, direction)}
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}

// Example 2: Table with Pagination
export function PaginatedTableExample() {
  const columns = [
    { key: "orderId", label: "Order ID", sortable: true, width: 150 },
    { key: "customer", label: "Customer", sortable: true, width: 200 },
    { key: "date", label: "Date", type: "datetime", sortable: true, width: 180 },
    { key: "total", label: "Total", type: "currency", sortable: true, align: "right", width: 120 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
    {
      key: "actions",
      label: "Actions",
      type: "actions",
      align: "right",
      width: 100,
      actions: [
        {
          label: "View",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          onClick: (row) => console.log("View:", row),
        },
        {
          label: "Edit",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          ),
          onClick: (row) => console.log("Edit:", row),
        },
        {
          label: "Delete",
          variant: "danger",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          ),
          onClick: (row) => console.log("Delete:", row),
        },
      ],
    },
  ];

  const data = [
    { id: 1, orderId: "ORD-001", customer: "John Doe", date: new Date(), total: 100.50, status: "pending" },
    { id: 2, orderId: "ORD-002", customer: "Jane Smith", date: new Date(), total: 250.75, status: "completed" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  return (
    <Table
      columns={columns}
      data={data}
      pagination={true}
      currentPage={currentPage}
      pageSize={pageSize}
      totalItems={data.length}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onSort={(column, direction) => {
        setSortColumn(column);
        setSortDirection(direction);
      }}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      sortable={true}
      resizable={true}
      stickyHeader={true}
      emptyStateTitle="No orders found"
      emptyStateDescription="Try adjusting your filters or create a new order."
      emptyStateAction={{
        label: "Create Order",
        onClick: () => console.log("Create order"),
      }}
    />
  );
}

// Example 3: Table with Thumbnails
export function TableWithThumbnailsExample() {
  const columns = [
    {
      key: "product",
      label: "Product",
      type: "thumbnail",
      sortable: true,
      width: 300,
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img src={row.image} alt={row.name} className="w-10 h-10 rounded-[8px] object-cover" />
          )}
          <div>
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{row.name}</p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{row.category}</p>
          </div>
        </div>
      ),
    },
    { key: "price", label: "Price", type: "currency", sortable: true, align: "right", width: 120 },
    { key: "stock", label: "Stock", type: "number", sortable: true, align: "right", width: 100 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
  ];

  const data = [
    { id: 1, name: "Product 1", category: "Category A", image: "/images/product1.jpg", price: 29.99, stock: 10, status: "in_stock" },
    { id: 2, name: "Product 2", category: "Category B", image: "/images/product2.jpg", price: 49.99, stock: 0, status: "out_of_stock" },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      onSort={(column, direction) => console.log("Sort:", column, direction)}
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}

// Example 4: Table with Selection and Bulk Actions
export function TableWithSelectionExample() {
  const columns = [
    { key: "name", label: "Name", sortable: true, width: 200 },
    { key: "email", label: "Email", sortable: true, width: 250 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
  ];

  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  ];

  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <Table
      columns={columns}
      data={data}
      onSelectionChange={setSelectedRows}
      selectedRows={selectedRows}
      bulkActions={
        <div className="flex gap-2">
          <button
            onClick={() => console.log("Bulk action:", selectedRows)}
            className="px-4 py-2 bg-accent text-white rounded-[10px] text-sm font-medium hover:bg-accent/90"
          >
            Delete Selected
          </button>
        </div>
      }
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}

// Example 5: Table with Search
export function TableWithSearchExample() {
  const columns = [
    { key: "name", label: "Name", sortable: true, width: 200 },
    { key: "email", label: "Email", sortable: true, width: 250 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
  ];

  const data = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "inactive" },
  ];

  const [searchValue, setSearchValue] = useState("");

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    item.email.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Table
      columns={columns}
      data={filteredData}
      searchable={true}
      searchValue={searchValue}
      onSearch={setSearchValue}
      searchPlaceholder="Search by name or email..."
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}

// Example 6: Table with Mobile Card View
export function TableWithMobileViewExample() {
  const columns = [
    { key: "orderId", label: "Order ID", sortable: true, width: 150 },
    { key: "customer", label: "Customer", sortable: true, width: 200 },
    { key: "total", label: "Total", type: "currency", sortable: true, align: "right", width: 120 },
    { key: "status", label: "Status", type: "status", sortable: true, width: 150 },
  ];

  const data = [
    { id: 1, orderId: "ORD-001", customer: "John Doe", total: 100.50, status: "pending" },
    { id: 2, orderId: "ORD-002", customer: "Jane Smith", total: 250.75, status: "completed" },
  ];

  const mobileCardComponent = (row) => (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-accent font-mono mb-1">{row.orderId}</p>
          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{row.customer}</p>
        </div>
        <span className={`badge border rounded-full px-3 py-1 ${row.status === "completed" ? "bg-success-light/20" : "bg-accent/20"}`}>
          {row.status}
        </span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-border-dark">
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Total</span>
        <span className="text-lg font-semibold text-accent">${row.total.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <Table
      columns={columns}
      data={data}
      mobileCardComponent={mobileCardComponent}
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}

