import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

// Result type icons
const IconProduct = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const IconOrder = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h11.25c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const IconCustomer = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconCategory = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const IconInventory = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>
);

const IconSettings = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const iconMap = {
  product: IconProduct,
  order: IconOrder,
  customer: IconCustomer,
  category: IconCategory,
  inventory: IconInventory,
  settings: IconSettings,
};

const typeLabels = {
  products: "Products",
  orders: "Orders",
  customers: "Customers",
  categories: "Categories",
  inventory: "Inventory",
  settings: "Settings",
};

export default function GlobalSearch({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    products: [],
    orders: [],
    customers: [],
    categories: [],
    inventory: [],
    settings: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Flatten results for keyboard navigation (maintain order)
  const allResults = [
    ...results.products.map((r) => ({ ...r, type: "product" })),
    ...results.orders.map((r) => ({ ...r, type: "order" })),
    ...results.customers.map((r) => ({ ...r, type: "customer" })),
    ...results.categories.map((r) => ({ ...r, type: "category" })),
    ...results.inventory.map((r) => ({ ...r, type: "inventory" })),
    ...results.settings.map((r) => ({ ...r, type: "settings" })),
  ];

  // Search function with debounce
  const search = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        setResults({
          products: [],
          orders: [],
          customers: [],
          categories: [],
          inventory: [],
          settings: [],
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen, search]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setQuery("");
      setSelectedIndex(0);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter" && allResults[selectedIndex]) {
        e.preventDefault();
        handleSelectResult(allResults[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, allResults, selectedIndex, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelectResult = (result) => {
    onClose();
    router.push(result.url);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !mounted) return null;

  const hasResults = Object.values(results).some((group) => group.length > 0);
  const totalResults = allResults.length;

  return (
    <div
      className={`
        fixed inset-0
        z-[10000]
        flex items-start justify-center
        p-4 pt-12 md:pt-20
        bg-black/30
        backdrop-blur-sm
        transition-opacity duration-200
        ${mounted && isOpen ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleBackdropClick}
    >
      <div
        className={`
          w-full max-w-[680px]
          bg-bg-light dark:bg-bg-dark
          border border-border-light dark:border-border-dark
          rounded-[22px]
          shadow-soft dark:shadow-soft-dark
          transition-all duration-200
          ${mounted && isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-6 border-b border-border-light dark:border-border-dark">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, customers..."
              className="
                w-full
                pl-12 pr-4 py-3
                bg-surface-light dark:bg-surface-dark
                border border-border-light dark:border-border-dark
                rounded-[12px]
                text-text-primary-light dark:text-text-primary-dark
                placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
                focus:border-accent
                transition-all duration-200
              "
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query || query.trim().length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-2">Start typing to search...</p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Press <kbd className="px-2 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded text-xs">Ctrl+K</kbd> to open search</p>
            </div>
          ) : hasResults ? (
            <div className="p-4 space-y-6">
              {Object.entries(results).map(([type, items]) => {
                if (items.length === 0) return null;

                const IconComponent = iconMap[type] || IconProduct;

                return (
                  <div key={type}>
                    {/* Section Header */}
                    <div className="mb-3 px-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
                        {typeLabels[type] || type}
                      </h3>
                    </div>

                    {/* Results List */}
                    <div className="space-y-1">
                      {items.map((item) => {
                        // Find global index in allResults array
                        const globalIndex = allResults.findIndex(
                          (r) => r.id === item.id && r.type === item.type
                        );
                        const isSelected = globalIndex === selectedIndex && globalIndex !== -1;

                        return (
                          <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleSelectResult(item)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`
                              w-full
                              flex items-center gap-4
                              px-4 py-3
                              rounded-[10px]
                              transition-all duration-200
                              text-left
                              ${isSelected
                                ? "bg-hover-light dark:bg-hover-dark border border-accent/30"
                                : "bg-transparent hover:bg-hover-light dark:hover:bg-hover-dark"
                              }
                            `}
                          >
                            {/* Icon or Thumbnail */}
                            <div className="flex-shrink-0">
                              {item.image ? (
                                <div className="w-10 h-10 rounded-[8px] overflow-hidden bg-surface-light dark:bg-surface-dark">
                                  <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-[8px] bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                                  <IconComponent className="w-5 h-5 text-accent" />
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
                                  {item.subtitle}
                                </div>
                              )}
                              {item.description && (
                                <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <div className="flex-shrink-0 text-text-secondary-light dark:text-text-secondary-dark">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                No results found.
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Try refining your search.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasResults && (
          <div className="p-4 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <span>{totalResults} result{totalResults !== 1 ? "s" : ""} found</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded">Enter</kbd>
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded">Esc</kbd>
                  <span>Close</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

