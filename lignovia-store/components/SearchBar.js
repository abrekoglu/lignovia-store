import { useState } from "react";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";

export default function SearchBar() {
  const { openSearch } = useGlobalSearch();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <button
      onClick={openSearch}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`
        relative
        flex items-center gap-3
        px-3 lg:px-4 py-2
        bg-surface-light dark:bg-surface-dark
        border border-border-light dark:border-border-dark
        rounded-[12px]
        text-left
        transition-all duration-200
        ${isFocused ? "ring-2 ring-accent/30 border-accent" : "hover:border-accent/50"}
        min-w-[2.5rem] lg:min-w-[20rem]
      `}
      aria-label="Open search"
    >
      {/* Search Icon */}
      <div className="flex-shrink-0 text-accent">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>

      {/* Placeholder Text - Hidden on mobile for icon-only */}
      <span className="flex-1 text-text-secondary-light dark:text-text-secondary-dark text-sm hidden lg:block">
        Search products, orders, customers...
      </span>

      {/* Keyboard Shortcut Hint - Hidden on mobile */}
      <div className="flex-shrink-0 hidden xl:flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
        <kbd className="px-2 py-1 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark rounded text-xs">
          Ctrl+K
        </kbd>
      </div>
    </button>
  );
}

