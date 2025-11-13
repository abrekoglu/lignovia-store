/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Theme
        'bg-light': '#FDFBF9',
        'surface-light': '#F5F2EF',
        'text-primary-light': '#3C3026',
        'text-secondary-light': '#7B6A5E',
        'accent': '#C8A98B',
        'border-light': '#E5DED7',
        'success-light': '#4F8A5E',
        'error-light': '#B35B4E',
        'hover-light': '#EFE8E2',
        // Dark Theme
        'bg-dark': '#1E1A17',
        'surface-dark': '#29231F',
        'text-primary-dark': '#F2EAE4',
        'text-secondary-dark': '#BFAFA0',
        'border-dark': '#3B332C',
        'success-dark': '#5FA374',
        'error-dark': '#CC6C5E',
        'hover-dark': '#2E2722',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Heading Scale
        'h1': ['clamp(2rem, 5vw, 3.5rem)', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '500' }],
        'h2': ['clamp(1.75rem, 4vw, 2.75rem)', { lineHeight: '1.25', letterSpacing: '-0.025em', fontWeight: '500' }],
        'h3': ['clamp(1.5rem, 3.5vw, 2.25rem)', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '500' }],
        'h4': ['clamp(1.25rem, 3vw, 1.75rem)', { lineHeight: '1.35', letterSpacing: '-0.015em', fontWeight: '500' }],
        'h5': ['clamp(1.125rem, 2.5vw, 1.5rem)', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '500' }],
        'h6': ['clamp(1rem, 2vw, 1.25rem)', { lineHeight: '1.45', letterSpacing: '-0.005em', fontWeight: '500' }],
        // Body Scale
        'body': ['1rem', { lineHeight: '1.7', letterSpacing: '-0.011em', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', letterSpacing: '-0.012em', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '-0.005em', fontWeight: '400' }],
        // Utility Scale
        'caption': ['0.875rem', { lineHeight: '1.6', letterSpacing: '-0.005em', fontWeight: '400' }],
        'small': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'overline': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.1em', fontWeight: '500', textTransform: 'uppercase' }],
        'label': ['0.875rem', { lineHeight: '1.5', letterSpacing: '-0.005em', fontWeight: '500' }],
        'button': ['0.9375rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '500' }],
      },
      lineHeight: {
        'tight': '1.2',
        'snug': '1.25',
        'normal': '1.5',
        'relaxed': '1.65',
        'loose': '1.7',
        'extra-loose': '1.75',
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.02em',
        'normal': '-0.011em',
        'wide': '0.05em',
        'wider': '0.1em',
      },
      borderRadius: {
        'soft': '6px',
        'softer': '8px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(60, 48, 38, 0.08)',
        'soft-lg': '0 4px 16px rgba(60, 48, 38, 0.12)',
        'soft-dark': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'soft-lg-dark': '0 4px 16px rgba(0, 0, 0, 0.4)',
      },
      transitionDuration: {
        'smooth': '300ms',
        'smoother': '400ms',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
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
      },
    },
    screens: {
      'sm': '640px',      // Mobile large
      'md': '768px',      // Tablet portrait
      'lg': '1024px',     // Tablet landscape / Desktop standard
      'xl': '1280px',     // Desktop wide
      '2xl': '1536px',    // Desktop extra wide
    },
  },
  plugins: [],
}

