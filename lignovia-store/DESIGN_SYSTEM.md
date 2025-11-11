# LIGNOVIA Design System

## 🎨 Brand Identity

LIGNOVIA is a minimalist, elegant brand featuring thin geometric lines and a stylized wooden tree ring in beige and dark brown tones. The aesthetic combines modern minimalism with the organic warmth of wood.

## 🖼️ Logo

The LIGNOVIA logo is located at `/public/images/logo/logo.png` and should be used in:
- Header/Navbar (centered, 42-48px height)
- Footer (brand section, 36-40px height)
- Any loading screens or splash pages

**Logo Sizing:**
- **Header**: `h-10 md:h-12` (40px mobile, 48px desktop) - maintains aspect ratio
- **Footer**: `h-9 md:h-10` (36px mobile, 40px desktop) - maintains aspect ratio
- Always use `w-auto` to maintain original aspect ratio
- Never crop, stretch, or distort the logo

**Usage:**
```jsx
import Image from "next/image";

// Header Logo
<Image
  src="/images/logo/logo.png"
  alt="LIGNOVIA"
  width={200}
  height={48}
  className="h-10 md:h-12 w-auto"
  priority
/>

// Footer Logo
<Image
  src="/images/logo/logo.png"
  alt="LIGNOVIA"
  width={150}
  height={38}
  className="h-9 md:h-10 w-auto"
/>
```

## 🌈 Color Palette

### Light Theme
- **Background**: `#FDFBF9` - `bg-bg-light`
- **Surface/Cards**: `#F5F2EF` - `bg-surface-light`
- **Primary Text**: `#3C3026` - `text-text-primary-light`
- **Secondary Text**: `#7B6A5E` - `text-text-secondary-light`
- **Accent (Beige)**: `#C8A98B` - `text-accent` / `bg-accent`
- **Border/Divider**: `#E5DED7` - `border-border-light`
- **Success**: `#4F8A5E` - `text-success-light` / `bg-success-light`
- **Error**: `#B35B4E` - `text-error-light` / `bg-error-light`
- **Hover Background**: `#EFE8E2` - `bg-hover-light`

### Dark Theme
- **Background**: `#1E1A17` - `bg-bg-dark`
- **Surface/Cards**: `#29231F` - `bg-surface-dark`
- **Primary Text**: `#F2EAE4` - `text-text-primary-dark`
- **Secondary Text**: `#BFAFA0` - `text-text-secondary-dark`
- **Accent (Beige)**: `#C8A98B` - `text-accent` / `bg-accent` (same in both themes)
- **Border/Divider**: `#3B332C` - `border-border-dark`
- **Success**: `#5FA374` - `text-success-dark` / `bg-success-dark`
- **Error**: `#CC6C5E` - `text-error-dark` / `bg-error-dark`
- **Hover Background**: `#2E2722` - `bg-hover-dark`

## 📝 Typography

- **Font Family**: Poppins, Raleway, Montserrat (sans-serif fallback)
- **Letter Spacing**: 0.01em
- **Line Height**: 1.6
- **Font Weights**: 300, 400, 500, 600, 700

## 🎯 Component Classes

### Buttons

#### Primary Button
```jsx
<button className="btn-primary">
  Button Text
</button>
```

#### Secondary Button
```jsx
<button className="btn-secondary">
  Button Text
</button>
```

#### Text Button
```jsx
<button className="btn-text">
  Button Text
</button>
```

### Cards

#### Basic Card
```jsx
<div className="card p-6">
  Card Content
</div>
```

#### Card with Hover
```jsx
<div className="card-hover p-6">
  Card Content
</div>
```

### Inputs

```jsx
<input
  type="text"
  className="input"
  placeholder="Placeholder text"
/>
```

### Badges

```jsx
<span className="badge bg-accent text-white">
  Badge Text
</span>
```

## 🎭 Usage Examples

### Theme Toggle
The theme toggle is automatically included in the Navbar. Use the `ThemeToggle` component anywhere:

```jsx
import ThemeToggle from "@/components/ThemeToggle";

<ThemeToggle />
```

### Using Theme Context
```jsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // theme is 'light' or 'dark'
}
```

## 🎨 Design Principles

1. **Minimalism**: Clean, uncluttered interfaces
2. **Warmth**: Natural, organic feel with beige accents
3. **Elegance**: Sophisticated color balance
4. **Precision**: Consistent spacing and alignment
5. **Serenity**: Calm, refined visual tone

## 📐 Spacing & Borders

- **Border Radius**: 
  - Soft: `8px` - `rounded-soft`
  - Softer: `12px` - `rounded-softer`
- **Shadows**:
  - Soft: `shadow-soft` / `shadow-soft-dark`
  - Large: `shadow-soft-lg` / `shadow-soft-lg-dark`
- **Transitions**: 
  - Smooth: `300ms` - `duration-smooth`
  - Smoother: `400ms` - `duration-smoother`

## 🌓 Theme System

**Default Theme: Light Mode**

The site defaults to Light Mode on first load, regardless of system preference (`prefers-color-scheme`).

**Theme Behavior:**
- **First Visit**: Always loads in Light Mode
- **User Preference**: Saved in `localStorage` as `lignovia-theme`
- **Subsequent Visits**: Restores user's last selected theme (light or dark)
- **Fallback**: If no saved preference exists, defaults to Light Mode
- **Manual Toggle**: Users can switch themes using the toggle button in the header

**Theme Transitions:**
- Smooth fade animations (200ms) when switching between themes
- All color properties transition smoothly (background, text, borders)
- No flash of incorrect theme on page load

**Implementation:**
- Uses Tailwind's `class` strategy for dark mode
- Theme state managed via React Context (`ThemeContext`)
- Accent color (#C8A98B) remains consistent across both themes

## 📱 Responsive Design

All components are fully responsive using Tailwind's breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## ✨ Animations

All transitions use smooth fade/scale animations:
- Color transitions: `transition-colors duration-smooth`
- All transitions: `transition-all duration-smooth`
- Never abrupt changes

