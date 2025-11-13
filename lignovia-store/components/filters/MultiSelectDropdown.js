import { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
  className = "",
  disabled = false,
  maxHeight = "16rem",
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

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
      ? selectedOptions[0].label
      : `${selectedOptions.length} selected`;

  const handleToggle = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange([]);
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
          <span className={selectedOptions.length === 0 ? "text-text-secondary-light dark:text-text-secondary-dark" : ""}>
            {displayText}
          </span>
          <div className="flex items-center gap-2">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-150"
                aria-label="Clear selection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={`
                w-4 h-4
                text-accent
                transition-transform duration-200
                flex-shrink-0
                ${isOpen ? "transform rotate-180" : ""}
              `}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
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
            style={{ maxHeight }}
          >
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 0.5rem)` }}>
              {options.length === 0 ? (
                <div className="px-4 py-3 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center">
                  No options available
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleToggle(option.value)}
                      className={`
                        w-full
                        flex items-center gap-3
                        px-4 py-2.5
                        text-left
                        text-sm
                        transition-all duration-150
                        first:rounded-t-[12px]
                        last:rounded-b-[12px]
                        ${
                          isSelected
                            ? "bg-accent/10 text-text-primary-light dark:text-text-primary-dark"
                            : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                        }
                      `}
                    >
                      {/* Custom Checkbox */}
                      <div
                        className={`
                          w-4 h-4
                          rounded-[4px]
                          border-2
                          flex items-center justify-center
                          flex-shrink-0
                          transition-all duration-150
                          ${
                            isSelected
                              ? "border-accent bg-accent"
                              : "border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                          }
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="flex-1">{option.label}</span>
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

