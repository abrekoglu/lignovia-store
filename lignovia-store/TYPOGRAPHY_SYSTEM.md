# LIGNOVIA Typography System

## Overview

The LIGNOVIA Typography System provides a unified, warm, handcrafted typography foundation for the entire storefront. It ensures consistent font hierarchy, spacing, and color usage while maintaining the brand's premium, minimal aesthetic.

## Typography Philosophy

LIGNOVIA typography embodies:

- **Warmth**: Soft, organic, inviting
- **Elegance**: Refined, sophisticated, premium
- **Airiness**: Generous spacing, comfortable readability
- **Quietness**: Calm, minimal, never aggressive
- **Handcrafted**: Editorial, artisanal, thoughtful

**Principles:**
- No overly heavy fonts
- No condensed styles
- No high-contrast black text
- Smooth curves and soft terminals
- Balanced letter spacing
- Natural, comfortable line heights

## Font Family

### Primary Font: Inter

**Why Inter?**
- Clean, modern, elegant sans-serif
- Smooth curves and soft terminals
- Slightly rounded edges
- Excellent readability at all sizes
- Balanced letter spacing
- Natural, warm feel

### Fallback Stack

```
'Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'
```

**Font Weights:**
- 300 (Light)
- 400 (Regular) - Body text
- 500 (Medium) - Headings, buttons, labels
- 600 (Semibold) - Used sparingly
- 700 (Bold) - Avoid in most cases

## Type Scale

### Headings (H1-H6)

Headings use medium weight (500), warm brown tones, generous line height, and soft tracking.

#### H1 - Page Titles
```css
font-size: clamp(2rem, 5vw, 3.5rem);
font-weight: 500;
line-height: 1.2;
letter-spacing: -0.03em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h1 className="text-heading-1">Page Title</h1>
```

#### H2 - Section Titles
```css
font-size: clamp(1.75rem, 4vw, 2.75rem);
font-weight: 500;
line-height: 1.25;
letter-spacing: -0.025em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h2 className="text-heading-2">Section Title</h2>
```

#### H3 - Subsection Titles
```css
font-size: clamp(1.5rem, 3.5vw, 2.25rem);
font-weight: 500;
line-height: 1.3;
letter-spacing: -0.02em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h3 className="text-heading-3">Subsection Title</h3>
```

#### H4 - Card Titles
```css
font-size: clamp(1.25rem, 3vw, 1.75rem);
font-weight: 500;
line-height: 1.35;
letter-spacing: -0.015em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h4 className="text-heading-4">Card Title</h4>
```

#### H5 - Small Headings
```css
font-size: clamp(1.125rem, 2.5vw, 1.5rem);
font-weight: 500;
line-height: 1.4;
letter-spacing: -0.01em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h5 className="text-heading-5">Small Heading</h5>
```

#### H6 - Smallest Headings
```css
font-size: clamp(1rem, 2vw, 1.25rem);
font-weight: 500;
line-height: 1.45;
letter-spacing: -0.005em;
color: var(--text-primary);
```

**Usage:**
```jsx
<h6 className="text-heading-6">Smallest Heading</h6>
```

### Body Text

Body text uses regular weight (400), comfortable size, high readability, natural line spacing, and warm neutral color.

#### Body (Default)
```css
font-size: 1rem;
line-height: 1.7;
letter-spacing: -0.011em;
color: var(--text-primary);
font-weight: 400;
```

**Usage:**
```jsx
<p className="text-body">Body text content</p>
```

#### Body Large
```css
font-size: 1.125rem;
line-height: 1.75;
letter-spacing: -0.012em;
color: var(--text-primary);
font-weight: 400;
```

**Usage:**
```jsx
<p className="text-body-lg">Large body text</p>
```

#### Body Small
```css
font-size: 0.875rem;
line-height: 1.6;
letter-spacing: -0.005em;
color: var(--text-secondary);
font-weight: 400;
```

**Usage:**
```jsx
<p className="text-body-sm">Small body text</p>
```

### Small Text / Captions

#### Caption
```css
font-size: 0.875rem;
line-height: 1.6;
letter-spacing: -0.005em;
color: var(--text-secondary);
font-weight: 400;
```

**Usage:**
```jsx
<span className="text-caption">Caption text</span>
```

#### Small
```css
font-size: 0.75rem;
line-height: 1.5;
letter-spacing: 0;
color: var(--text-secondary);
font-weight: 400;
```

**Usage:**
```jsx
<span className="text-small">Small text</span>
```

### Button Text

```css
font-size: 0.9375rem;
font-weight: 500;
letter-spacing: -0.01em;
line-height: 1.5;
```

**Usage:**
```jsx
<button className="btn-primary">Button Text</button>
```

### Overline / Section Labels

```css
font-size: 0.75rem;
font-weight: 500;
letter-spacing: 0.1em;
text-transform: uppercase;
line-height: 1.5;
color: var(--text-secondary);
opacity: 0.8;
```

**Usage:**
```jsx
<span className="text-overline">Section Label</span>
```

### Label Text

```css
font-size: 0.875rem;
font-weight: 500;
letter-spacing: -0.005em;
line-height: 1.5;
color: var(--text-primary);
```

**Usage:**
```jsx
<label className="text-label">Label Text</label>
```

## Color Usage

### Light Theme

- **Primary Text**: `#3C3026` - Deep warm brown (`text-text-primary-light`)
- **Secondary Text**: `#7B6A5E` - Softer brown (`text-text-secondary-light`)
- **Muted Text**: Warm taupe (same as secondary)
- **Disabled Text**: Warm grey with low contrast

### Dark Theme

- **Primary Text**: `#F2EAE4` - Warm cream (`text-text-primary-dark`)
- **Secondary Text**: `#BFAFA0` - Softer warm beige (`text-text-secondary-dark`)
- **Muted Text**: Softer warm beige (same as secondary)
- **Disabled Text**: Warm grey with low contrast

**Rules:**
- No pure black (`#000000`)
- No pure white (`#FFFFFF`)
- No cold grays
- All text uses warm tones

## Line Height & Spacing Rules

### Line Heights

- **Headings**: 1.2 - 1.45 (tight, but not cramped)
- **Body Text**: 1.7 - 1.75 (generous, airy)
- **Small Text**: 1.5 - 1.6 (comfortable)
- **Buttons**: 1.5 (balanced)

### Letter Spacing

- **Headings**: -0.03em to -0.005em (tight, modern)
- **Body Text**: -0.011em to -0.012em (slightly tight, natural)
- **Small Text**: 0 to -0.005em (neutral)
- **Overlines**: 0.1em (wide, uppercase)

### Vertical Rhythm

- **Headings**: Generous margin-bottom (1.5em - 2em)
- **Body Text**: Comfortable spacing (1em - 1.5em)
- **Sections**: Generous padding (2rem - 4rem)

## Responsive Typography

Typography adapts smoothly across breakpoints using `clamp()` for fluid scaling:

### Heading Scale
- **Mobile**: Smaller base size
- **Desktop**: Larger maximum size
- **Smooth scaling**: No sudden jumps

### Body Text
- **Mobile**: 1rem (16px) - Readable
- **Desktop**: 1rem (16px) - Consistent
- **Large Body**: 1.125rem (18px) - For emphasis

### Spacing Adjustments
- **Mobile**: Reduced spacing for compact layout
- **Desktop**: Generous spacing for airy feel
- **Smooth transitions**: Maintains visual balance

## Dark Mode Typography

In dark mode, typography shifts to warm cream/beige tones:

- **Primary Text**: Warm cream (`#F2EAE4`)
- **Secondary Text**: Softer warm beige (`#BFAFA0`)
- **Accent Color**: Remains the same (`#C8A98B`)
- **No Pure White**: Avoids harsh contrast

**Principles:**
- Same spacing and sizing
- Only color palette shifts
- Remains calm and warm
- Maintains readability

## Integration Examples

### Header & Footer
```jsx
<header>
  <nav className="text-body-sm">Navigation links</nav>
</header>
<footer>
  <h3 className="text-overline">Section Title</h3>
  <p className="text-body-sm">Footer text</p>
</footer>
```

### Product List
```jsx
<h1 className="text-heading-1">Shop</h1>
<h2 className="text-heading-4">Product Name</h2>
<p className="text-body-sm">Product description</p>
<span className="text-caption">Price</span>
```

### Product Detail Page
```jsx
<h1 className="text-heading-2">Product Name</h1>
<p className="text-body-lg">Product description</p>
<p className="text-body">Detailed information</p>
<button className="btn-primary">Add to Cart</button>
```

### Buttons
```jsx
<button className="btn-primary">Primary Button</button>
<button className="btn-secondary">Secondary Button</button>
<button className="btn-text">Text Button</button>
```

### Inputs
```jsx
<label className="text-label">Email Address</label>
<input className="text-body" type="email" />
<span className="text-caption">Helper text</span>
```

### Cart & Checkout
```jsx
<h2 className="text-heading-3">Shopping Cart</h2>
<p className="text-body">Cart items</p>
<span className="text-body-sm">Total: $99.99</span>
<button className="btn-primary">Checkout</button>
```

### Modals
```jsx
<h2 className="text-heading-3">Modal Title</h2>
<p className="text-body">Modal content</p>
<button className="btn-primary">Confirm</button>
```

### Filters & Dropdowns
```jsx
<label className="text-label">Filter by Category</label>
<select className="text-body-sm">Options</select>
<span className="text-caption">Selected option</span>
```

### User Account Pages
```jsx
<h1 className="text-heading-1">My Account</h1>
<h2 className="text-heading-4">Profile Information</h2>
<p className="text-body">Account details</p>
<label className="text-label">Email</label>
<input className="text-body" type="email" />
```

### Home Page Content Sections
```jsx
<h1 className="text-heading-1">Welcome to LIGNOVIA</h1>
<p className="text-body-lg">Brand message</p>
<p className="text-body">Detailed description</p>
<button className="btn-primary">Explore Shop</button>
```

## Utility Classes

### Typography Classes

- `.text-heading-1` through `.text-heading-6` - Heading styles
- `.text-body` - Default body text
- `.text-body-lg` - Large body text
- `.text-body-sm` - Small body text
- `.text-caption` - Caption text
- `.text-small` - Small text
- `.text-overline` - Overline/section label
- `.text-label` - Form label
- `.text-button` - Button text

### Color Classes

- `.text-text-primary-light` / `.text-text-primary-dark` - Primary text
- `.text-text-secondary-light` / `.text-text-secondary-dark` - Secondary text
- `.text-accent` - Accent color

### Spacing Classes

- `.leading-tight` - Tight line height (1.2)
- `.leading-snug` - Snug line height (1.25)
- `.leading-normal` - Normal line height (1.5)
- `.leading-relaxed` - Relaxed line height (1.65)
- `.leading-loose` - Loose line height (1.7)
- `.leading-extra-loose` - Extra loose line height (1.75)

### Letter Spacing Classes

- `.tracking-tighter` - Tighter letter spacing (-0.03em)
- `.tracking-tight` - Tight letter spacing (-0.02em)
- `.tracking-normal` - Normal letter spacing (-0.011em)
- `.tracking-wide` - Wide letter spacing (0.05em)
- `.tracking-wider` - Wider letter spacing (0.1em)

## Best Practices

1. **Use semantic HTML** - Use `<h1>`, `<h2>`, `<p>`, etc.
2. **Apply utility classes** - Use typography utility classes for consistency
3. **Maintain hierarchy** - Follow the heading scale (H1 → H6)
4. **Use warm colors** - Always use warm text colors, never pure black/white
5. **Preserve spacing** - Maintain generous vertical rhythm
6. **Test readability** - Ensure text is readable at all sizes
7. **Support dark mode** - Use dark mode color classes
8. **Avoid font weights > 600** - Keep typography light and airy
9. **Use responsive typography** - Leverage `clamp()` for fluid scaling
10. **Maintain consistency** - Use the same typography classes across components

## Migration Guide

### Before (Old System)
```jsx
<h1 className="text-4xl lg:text-5xl font-semibold">Title</h1>
<p className="text-lg">Body text</p>
```

### After (New System)
```jsx
<h1 className="text-heading-1">Title</h1>
<p className="text-body-lg">Body text</p>
```

Or with Tailwind classes:
```jsx
<h1 className="text-h1">Title</h1>
<p className="text-body-lg">Body text</p>
```

## Technical Details

### Font Loading

Fonts are loaded via Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
```

### Font Features

- **Font Smoothing**: Antialiased for smooth rendering
- **Font Features**: Kern and ligature support enabled
- **Letter Spacing**: Negative tracking for modern feel
- **Line Height**: Generous for readability

### CSS Variables

Typography colors use CSS variables for theme support:
```css
--text-primary: #3C3026; /* Light theme */
--text-secondary: #7B6A5E; /* Light theme */
```

Dark mode:
```css
--text-primary: #F2EAE4; /* Dark theme */
--text-secondary: #BFAFA0; /* Dark theme */
```

## Support

For questions or issues with the typography system, refer to:
- Component source code: `styles/globals.css`
- Tailwind config: `tailwind.config.js`
- Documentation: `TYPOGRAPHY_SYSTEM.md`

