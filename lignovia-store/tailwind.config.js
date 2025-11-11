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
        sans: ['Poppins', 'Raleway', 'Montserrat', 'system-ui', 'sans-serif'],
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
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  plugins: [],
}

