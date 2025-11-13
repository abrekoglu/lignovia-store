# LIGNOVIA Global Container System

## Overview

The Global Container System provides a unified, responsive layout foundation for the entire LIGNOVIA Storefront. It ensures consistent width, padding, and spacing across all pages while maintaining the brand's premium, handcrafted aesthetic.

## Core Components

### 1. Container Component

The `Container` component is the primary layout wrapper for all page content.

**Location:** `components/Container.js`

**Features:**
- Max width: 1400px (premium, airy feel)
- Centered with auto margins
- Responsive horizontal padding
- Full dark mode support

**Basic Usage:**
```jsx
import Container from "@/components/Container";

<Container>
  <YourContent />
</Container>
```

**With Custom Spacing:**
```jsx
<Container className="py-16">
  <YourContent />
</Container>
```

**Full Width (Edge-to-Edge):**
```jsx
<Container fullWidth>
  <YourContent />
</Container>
```

**Custom Max Width:**
```jsx
<Container maxWidth="max-w-6xl">
  <YourContent />
</Container>
```

**Without Padding:**
```jsx
<Container padding={false}>
  <YourContent />
</Container>
```

### 2. Section Component

The `Section` component provides consistent vertical spacing between major page sections.

**Location:** `components/Section.js`

**Features:**
- Generous vertical padding
- Responsive spacing adjustments
- Optional background colors
- Full dark mode support

**Basic Usage:**
```jsx
import Section from "@/components/Section";

<Section>
  <YourSectionContent />
</Section>
```

**With Custom Spacing:**
```jsx
<Section paddingY="large">
  <YourSectionContent />
</Section>
```

**With Background:**
```jsx
<Section background="surface">
  <YourSectionContent />
</Section>
```

**Padding Options:**
- `small`: `py-8 md:py-12 lg:py-16`
- `default`: `py-12 md:py-16 lg:py-20 xl:py-24` (default)
- `large`: `py-16 md:py-20 lg:py-24 xl:py-28`
- `none`: No padding

**Background Options:**
- `transparent`: No background (default)
- `surface`: `bg-surface-light dark:bg-surface-dark`
- `hover`: `bg-hover-light dark:bg-hover-dark`

### 3. Layout Component

The `Layout` component wraps all pages and automatically applies the Container system.

**Location:** `components/Layout.js`

**Features:**
- Automatically wraps content in Container
- Provides consistent vertical spacing
- Includes Navbar and Footer
- Full dark mode support

**Usage:**
```jsx
import Layout from "@/components/Layout";

<Layout>
  <YourPageContent />
</Layout>
```

**With Custom Container Class:**
```jsx
<Layout containerClassName="py-12">
  <YourPageContent />
</Layout>
```

## Container Specifications

### Max Width
- **Default:** 1400px (`max-w-container`)
- Provides a premium, airy feel without being cramped
- Centered on all screen sizes

### Horizontal Padding

Responsive padding that adapts to screen size:

| Breakpoint | Padding |
|------------|---------|
| Mobile (< 640px) | 16px (1rem) |
| Small Mobile (≥ 640px) | 20px (1.25rem) |
| Tablet (≥ 768px) | 24px (1.5rem) |
| Desktop (≥ 1024px) | 32px (2rem) |
| Large Desktop (≥ 1280px) | 40px (2.5rem) |
| Extra Large (≥ 1536px) | 48px (3rem) |

### Vertical Spacing

The Layout component provides generous vertical spacing:

| Breakpoint | Padding Top/Bottom |
|------------|-------------------|
| Mobile | 32px (py-8) |
| Tablet (≥ 768px) | 48px (py-12) |
| Desktop (≥ 1024px) | 64px (py-16) |
| Large Desktop (≥ 1280px) | 80px (py-20) |

## Responsive Breakpoints

The container system uses Tailwind's standard breakpoints:

| Breakpoint | Width | Description |
|------------|-------|-------------|
| `sm` | 640px | Mobile large |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / Desktop standard |
| `xl` | 1280px | Desktop wide |
| `2xl` | 1536px | Desktop extra wide |

## Visual Behavior

### Background Colors
- Background colors extend edge-to-edge
- Content inside container remains centered
- Full-width sections (e.g., hero banners) can use `Container fullWidth` and align text with the container grid

### Content Alignment
- All content is centered within the container
- Container itself is centered on the page
- No layout shifts or sudden jumps between breakpoints

## Dark Mode Support

The container system fully supports dark mode:
- Spacing remains identical in both themes
- Surface colors adapt to warm dark palette
- Borders, dividers, and shadows adjust accordingly
- Structure stays identical; only the palette shifts

## Integration Examples

### Home Page
```jsx
<Layout>
  <Section paddingY="large">
    <div className="text-center">
      <h1>Welcome to LIGNOVIA</h1>
    </div>
  </Section>
</Layout>
```

### Shop Page
```jsx
<Layout>
  <div>
    <h1>Shop</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Product cards */}
    </div>
  </div>
</Layout>
```

### Full-Width Hero Section
```jsx
<Layout>
  <Container fullWidth className="bg-surface-light dark:bg-surface-dark">
    <Container className="py-20">
      <h1>Hero Title</h1>
    </Container>
  </Container>
</Layout>
```

### Multi-Section Page
```jsx
<Layout>
  <Section paddingY="large">
    <h1>Page Title</h1>
  </Section>
  
  <Section background="surface">
    <div>Content with background</div>
  </Section>
  
  <Section paddingY="small">
    <div>Compact section</div>
  </Section>
</Layout>
```

## Best Practices

1. **Always use Layout component** for page-level wrappers
2. **Use Container directly** when you need custom container behavior
3. **Use Section** for major content sections that need vertical spacing
4. **Avoid nested containers** unless intentionally creating nested layouts
5. **Use fullWidth sparingly** - only for hero banners or edge-to-edge sections
6. **Maintain consistent spacing** - use Section padding options rather than custom classes
7. **Test on all breakpoints** - ensure content looks good at every screen size

## Migration Guide

### Before (Old System)
```jsx
<main className="container mx-auto px-4 lg:px-6 py-8 lg:py-12">
  <div className="max-w-4xl mx-auto">
    <YourContent />
  </div>
</main>
```

### After (New System)
```jsx
<Layout>
  <Container maxWidth="max-w-4xl">
    <YourContent />
  </Container>
</Layout>
```

Or simply:
```jsx
<Layout>
  <YourContent />
</Layout>
```

The Layout component automatically applies the Container system, so you can remove redundant wrapper divs.

## Technical Details

### Tailwind Configuration

The container system extends Tailwind's configuration:

```javascript
maxWidth: {
  'container': '1400px', // Premium container width
},
container: {
  center: true,
  padding: {
    DEFAULT: '1rem',      // Mobile: 16px
    sm: '1.25rem',        // Small mobile: 20px
    md: '1.5rem',         // Tablet: 24px
    lg: '2rem',           // Desktop: 32px
    xl: '2.5rem',         // Large desktop: 40px
    '2xl': '3rem',        // Extra large: 48px
  },
}
```

### CSS Classes

The system also provides a CSS utility class:

```css
.container-lignovia {
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  /* Responsive padding applied via media queries */
}
```

## Support

For questions or issues with the container system, refer to:
- Component source code: `components/Container.js`, `components/Section.js`, `components/Layout.js`
- Tailwind config: `tailwind.config.js`
- Global styles: `styles/globals.css`


