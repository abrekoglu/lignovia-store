import { useState, useEffect } from "react";
import FilterDropdown from "./FilterDropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";
import DatePicker from "./DatePicker";
import DateRangePicker from "./DateRangePicker";
import { FilterChips } from "./FilterChip";

export default function ExpandableFilterPanel({
  title = "Filters",
  children,
  filters = [],
  onApply,
  onReset,
  defaultOpen = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Collect active filters for chips
  const activeFilters = filters
    .filter((filter) => {
      if (filter.type === "dropdown" || filter.type === "date") {
        return filter.value !== null && filter.value !== undefined && filter.value !== "";
      }
      if (filter.type === "daterange") {
        return (
          filter.value &&
          (filter.value.start !== null ||
            filter.value.end !== null ||
            (filter.value.start && filter.value.end))
        );
      }
      if (filter.type === "multiselect") {
        return Array.isArray(filter.value) && filter.value.length > 0;
      }
      return false;
    })
    .map((filter) => {
      let chipLabel = filter.chipLabel || filter.label;
      
      // Format date range for chip label
      if (filter.type === "daterange" && filter.value) {
        const formatDate = (date) => {
          if (!date) return "";
          return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        };
        if (filter.value.start && filter.value.end) {
          chipLabel = `${filter.label}: ${formatDate(filter.value.start)} - ${formatDate(filter.value.end)}`;
        } else if (filter.value.start) {
          chipLabel = `${filter.label}: ${formatDate(filter.value.start)}`;
        }
      }

      return {
        id: filter.id || filter.label,
        label: chipLabel,
        onRemove:
          filter.onRemove ||
          (() => {
            if (filter.type === "multiselect") {
              filter.onChange?.([]);
            } else if (filter.type === "daterange") {
              filter.onChange?.({ start: null, end: null });
            } else {
              filter.onChange?.(null);
            }
          }),
      };
    });

  return (
    <div className={`mb-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex items-center gap-2
            text-text-primary-light dark:text-text-primary-dark
            font-medium
            hover:text-accent
            transition-colors duration-150
            focus:outline-none
            focus:ring-2
            focus:ring-accent/30
            rounded-[8px]
            px-2 py-1
          "
        >
          <span>{title}</span>
          <svg
            className={`
              w-4 h-4
              text-accent
              transition-transform duration-200
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

        {/* Action Buttons */}
        {isOpen && (
          <div className="flex items-center gap-3">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="
                  text-sm
                  text-text-secondary-light dark:text-text-secondary-dark
                  hover:text-accent
                  transition-colors duration-150
                  focus:outline-none
                  focus:ring-1
                  focus:ring-accent/30
                  rounded-[8px]
                  px-2 py-1
                "
              >
                Reset Filters
              </button>
            )}
            {onApply && (
              <button
                type="button"
                onClick={onApply}
                className="
                  px-4 py-2
                  bg-accent
                  text-white
                  rounded-[10px]
                  text-sm
                  font-medium
                  hover:bg-accent/90
                  transition-colors duration-150
                  focus:outline-none
                  focus:ring-2
                  focus:ring-accent/30
                "
              >
                Apply Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <FilterChips chips={activeFilters} onClearAll={onReset} />
        </div>
      )}

      {/* Filter Panel Content */}
      <div
        className={`
          bg-surface-light dark:bg-surface-dark
          border border-border-light dark:border-border-dark
          rounded-[12px]
          p-6
          transition-all duration-300
          overflow-hidden
          ${isOpen && mounted ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isOpen ? "" : "hidden"}`}>
          {filters.map((filter) => {
            if (filter.type === "dropdown") {
              return (
                <FilterDropdown
                  key={filter.id || filter.label}
                  label={filter.label}
                  options={filter.options || []}
                  value={filter.value}
                  onChange={filter.onChange}
                  placeholder={filter.placeholder}
                />
              );
            }
            if (filter.type === "multiselect") {
              return (
                <MultiSelectDropdown
                  key={filter.id || filter.label}
                  label={filter.label}
                  options={filter.options || []}
                  value={filter.value || []}
                  onChange={filter.onChange}
                  placeholder={filter.placeholder}
                />
              );
            }
            if (filter.type === "date") {
              return (
                <DatePicker
                  key={filter.id || filter.label}
                  label={filter.label}
                  value={filter.value}
                  onChange={filter.onChange}
                  placeholder={filter.placeholder}
                  mode={filter.mode || "single"}
                  minDate={filter.minDate}
                  maxDate={filter.maxDate}
                />
              );
            }
            if (filter.type === "daterange") {
              return (
                <DateRangePicker
                  key={filter.id || filter.label}
                  label={filter.label}
                  value={filter.value || { start: null, end: null }}
                  onChange={filter.onChange}
                  placeholder={filter.placeholder}
                  minDate={filter.minDate}
                  maxDate={filter.maxDate}
                />
              );
            }
            return null;
          })}
          {children}
        </div>
      </div>
    </div>
  );
}

