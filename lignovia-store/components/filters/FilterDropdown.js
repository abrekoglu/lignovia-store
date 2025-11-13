import { useState, useEffect, useRef } from "react";

export default function FilterDropdown({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full
            flex items-center justify-between
            px-4 py-2.5
            bg-surface-light dark:bg-surface-dark
            border border-border-light dark:border-border-dark
            rounded-[10px]
            text-left
            text-text-primary-light dark:text-text-primary-dark
            placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
            transition-all duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-accent/30
            focus:border-accent
            ${isOpen ? "border-accent ring-2 ring-accent/30" : "hover:border-accent/50"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${mounted && isOpen ? "bg-hover-light dark:bg-hover-dark" : ""}
          `}
        >
          <span className={selectedOption ? "" : "text-text-secondary-light dark:text-text-secondary-dark"}>
            {displayText}
          </span>
          <svg
            className={`
              w-4 h-4
              text-accent
              transition-transform duration-200
              flex-shrink-0 ml-2
              ${isOpen ? "transform rotate-180" : ""}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={`
              absolute z-50
              w-full mt-2
              bg-surface-light dark:bg-surface-dark
              border border-border-light dark:border-border-dark
              rounded-[12px]
              shadow-soft dark:shadow-soft-dark
              overflow-hidden
              transition-all duration-200
              ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
            `}
          >
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`
                        w-full
                        px-4 py-2.5
                        text-left
                        text-sm
                        transition-all duration-150
                        first:rounded-t-[12px]
                        last:rounded-b-[12px]
                        ${
                          isSelected
                            ? "bg-accent/20 text-accent font-medium"
                            : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

