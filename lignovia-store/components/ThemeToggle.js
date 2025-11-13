import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-[10px] bg-hover-light dark:bg-hover-dark flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-[10px] bg-hover-light dark:bg-hover-dark flex items-center justify-center transition-all duration-300 ease-out hover:bg-accent/10 dark:hover:bg-accent/20 hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-0"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark transition-all duration-300 ease-out"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark transition-all duration-300 ease-out"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364 8.25l-1.898 1.898M21 12h-2.25m-10.606 6.364l-1.898 1.898M12 18.75V21m-4.773-4.227l-1.898 1.898M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      )}
    </button>
  );
}
