import { createContext, useContext, useState, useCallback, useEffect } from "react";
import GlobalSearch from "@/components/GlobalSearch";

const GlobalSearchContext = createContext(null);

export function GlobalSearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSearch]);

  return (
    <GlobalSearchContext.Provider value={{ isOpen, openSearch, closeSearch, toggleSearch }}>
      {children}
      <GlobalSearch isOpen={isOpen} onClose={closeSearch} />
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearch must be used within GlobalSearchProvider");
  }
  return context;
}

