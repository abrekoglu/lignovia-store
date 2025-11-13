# LIGNOVIA Admin Table System

A unified, elegant, high-functionality table system for the LIGNOVIA Admin Panel that reflects the brand's handcrafted, warm, minimal aesthetic while offering professional-grade capabilities.

## Features

- ✅ **Sticky Header** - Header remains visible while scrolling
- ✅ **Resizable Columns** - Drag to resize column widths
- ✅ **Sortable Columns** - Click column headers to sort data
- ✅ **Hover Effects** - Smooth transitions and hover states
- ✅ **Responsive Layout** - Mobile card view support
- ✅ **Empty States** - Calm, intentional empty state design
- ✅ **Pagination** - Built-in pagination with rows per page selector
- ✅ **Dark Mode** - Full dark mode support
- ✅ **Bulk Selection** - Optional row selection with checkboxes
- ✅ **Search** - Optional built-in search functionality
- ✅ **Export CSV** - Optional CSV export button
- ✅ **Custom Rendering** - Flexible column rendering options

## Installation

The table components are already integrated into the LIGNOVIA Admin Panel. Import them as needed:

```javascript
import { Table } from "@/components/table";
```

## Basic Usage

```javascript
import { Table } from "@/components/table";

function MyAdminPage() {
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

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  return (
    <Table
      columns={columns}
      data={data}
      onSort={(column, direction) => {
        setSortColumn(column);
        setSortDirection(direction);
      }}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      sortable={true}
      resizable={true}
      stickyHeader={true}
    />
  );
}
```

## Column Configuration

### Column Properties

| Property | Type | Description |
|----------|------|-------------|
| `key` | string | Unique identifier for the column (required) |
| `label` | string | Column header label (required) |
| `sortable` | boolean | Whether the column is sortable (default: true) |
| `width` | number | Column width in pixels |
| `minWidth` | number | Minimum column width in pixels (default: 80) |
| `maxWidth` | number | Maximum column width in pixels |
| `align` | string | Text alignment: "left", "right", or "center" (default: "left") |
| `type` | string | Column type: "thumbnail", "status", "date", "datetime", "currency", "number", "actions" |
| `render` | function | Custom render function: `(row, column) => ReactNode` |
| `cellClassName` | string | Additional CSS classes for cells |

### Column Types

#### Thumbnail
Displays an image thumbnail with optional text:

```javascript
{
  key: "product",
  label: "Product",
  type: "thumbnail",
  width: 300,
}
```

#### Status
Displays a status badge with color coding:

```javascript
{
  key: "status",
  label: "Status",
  type: "status",
  width: 150,
}
```

Supported status values: `pending`, `completed`, `cancelled`, `active`, `inactive`, `in_stock`, `out_of_stock`, `low_stock`

#### Date/DateTime
Formats dates automatically:

```javascript
{
  key: "createdAt",
  label: "Created",
  type: "date", // or "datetime"
  width: 180,
}
```

#### Currency
Formats numbers as currency:

```javascript
{
  key: "total",
  label: "Total",
  type: "currency",
  align: "right",
  width: 120,
}
```

#### Number
Formats numbers with thousand separators:

```javascript
{
  key: "stock",
  label: "Stock",
  type: "number",
  align: "right",
  width: 100,
}
```

#### Actions
Displays action buttons:

```javascript
{
  key: "actions",
  label: "Actions",
  type: "actions",
  align: "right",
  width: 100,
  actions: [
    {
      label: "View",
      icon: <ViewIcon />,
      onClick: (row) => console.log("View:", row),
    },
    {
      label: "Edit",
      icon: <EditIcon />,
      onClick: (row) => console.log("Edit:", row),
    },
    {
      label: "Delete",
      variant: "danger",
      icon: <DeleteIcon />,
      onClick: (row) => console.log("Delete:", row),
    },
  ],
}
```

## Table Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | array | `[]` | Column configuration array (required) |
| `data` | array | `[]` | Data array (required) |
| `onSort` | function | - | Sort handler: `(column, direction) => void` |
| `sortColumn` | string | - | Currently sorted column key |
| `sortDirection` | string | - | Sort direction: "asc" or "desc" |
| `onRowClick` | function | - | Row click handler: `(row, event) => void` |
| `pagination` | boolean | `false` | Enable pagination |
| `currentPage` | number | `1` | Current page number |
| `pageSize` | number | `10` | Items per page |
| `totalItems` | number | `0` | Total number of items |
| `onPageChange` | function | - | Page change handler: `(page) => void` |
| `onPageSizeChange` | function | - | Page size change handler: `(size) => void` |
| `pageSizeOptions` | array | `[10, 25, 50, 100]` | Available page sizes |
| `showHeader` | boolean | `true` | Show table header |
| `stickyHeader` | boolean | `true` | Make header sticky |
| `resizable` | boolean | `true` | Enable column resizing |
| `sortable` | boolean | `true` | Enable column sorting |
| `emptyStateTitle` | string | `"No data available"` | Empty state title |
| `emptyStateDescription` | string | `"Try adjusting your filters or add new content."` | Empty state description |
| `emptyStateAction` | object | - | Empty state action button |
| `emptyStateIcon` | ReactNode | - | Empty state icon |
| `searchable` | boolean | `false` | Enable search |
| `searchValue` | string | - | Search input value |
| `onSearch` | function | - | Search handler: `(value) => void` |
| `searchPlaceholder` | string | `"Search..."` | Search input placeholder |
| `onSelectionChange` | function | - | Selection change handler: `(selectedRows) => void` |
| `selectedRows` | array | `[]` | Selected rows |
| `bulkActions` | ReactNode | - | Bulk actions component |
| `exportCSV` | function | - | CSV export handler: `() => void` |
| `mobileCardComponent` | function | - | Mobile card renderer: `(row, index) => ReactNode` |
| `loading` | boolean | `false` | Show loading skeleton |
| `className` | string | - | Additional CSS classes |
| `rowClassName` | string | - | Additional CSS classes for rows |
| `headerClassName` | string | - | Additional CSS classes for header |
| `bodyClassName` | string | - | Additional CSS classes for body |

## Examples

See `examples.js` for comprehensive examples of all table features.

## Styling

The table system uses LIGNOVIA's design system:

- **Background**: `#F5F2EF` (light) / `#29231F` (dark)
- **Borders**: `#E5DED7` (light) / `#3B332C` (dark)
- **Text**: `#3C3026` (light) / `#F2EAE4` (dark)
- **Accent**: `#C8A98B`
- **Hover**: `#EFE8E2` (light) / `#2E2722` (dark)

All styles are automatically applied based on the theme context.

## Responsive Design

On mobile devices (< 1024px), the table automatically switches to card view if `mobileCardComponent` is provided. Otherwise, it displays a horizontal scrollable table.

## Accessibility

The table system includes:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader support

## Performance

The table system is optimized for performance:

- Virtual scrolling support (via pagination)
- Efficient rendering with React.memo
- Debounced search
- Optimized resize handlers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Part of the LIGNOVIA Admin Panel.


