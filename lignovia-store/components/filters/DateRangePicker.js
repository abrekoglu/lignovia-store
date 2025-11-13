import { useState, useEffect, useRef } from "react";

export default function DateRangePicker({
  label,
  value = { start: null, end: null },
  onChange,
  placeholder = "Select date range",
  className = "",
  disabled = false,
  minDate = null,
  maxDate = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selecting, setSelecting] = useState("start"); // start, end
  const datePickerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close date picker when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(e.target) &&
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

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const displayText =
    value.start && value.end
      ? `${formatDate(value.start)} - ${formatDate(value.end)}`
      : value.start
      ? `${formatDate(value.start)} - ...`
      : placeholder;

  const handleDateSelect = (date) => {
    if (selecting === "start") {
      onChange({ start: date.toISOString().split("T")[0], end: value.end });
      setSelecting("end");
    } else {
      const startDate = value.start ? new Date(value.start) : date;
      if (date < startDate) {
        // If end date is before start date, swap them
        onChange({ start: date.toISOString().split("T")[0], end: value.start });
      } else {
        onChange({ start: value.start, end: date.toISOString().split("T")[0] });
      }
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isInRange = (date) => {
    if (!value.start || !value.end) return false;
    const startDate = new Date(value.start);
    const endDate = new Date(value.end);
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (date) => {
    if (!value.start) return false;
    const startDate = new Date(value.start);
    return (
      date.getDate() === startDate.getDate() &&
      date.getMonth() === startDate.getMonth() &&
      date.getFullYear() === startDate.getFullYear()
    );
  };

  const isEndDate = (date) => {
    if (!value.end) return false;
    const endDate = new Date(value.end);
    return (
      date.getDate() === endDate.getDate() &&
      date.getMonth() === endDate.getMonth() &&
      date.getFullYear() === endDate.getFullYear()
    );
  };

  const isDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(viewDate);
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = [];
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

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
          <span className={value.start && value.end ? "" : "text-text-secondary-light dark:text-text-secondary-dark"}>
            {displayText}
          </span>
          <svg
            className="w-4 h-4 text-accent flex-shrink-0 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
        </button>

        {/* Date Range Picker Modal */}
        {isOpen && (
          <div
            ref={datePickerRef}
            className={`
              absolute z-50
              mt-2
              bg-bg-light dark:bg-bg-dark
              border border-border-light dark:border-border-dark
              rounded-[16px]
              shadow-soft dark:shadow-soft-dark
              p-4
              w-80
              transition-all duration-200
              ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}
            `}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => navigateMonth(-1)}
                className="
                  p-1.5
                  rounded-[8px]
                  text-accent
                  hover:bg-hover-light dark:hover:bg-hover-dark
                  transition-colors duration-150
                  focus:outline-none
                  focus:ring-1
                  focus:ring-accent/30
                "
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                {monthName}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth(1)}
                className="
                  p-1.5
                  rounded-[8px]
                  text-accent
                  hover:bg-hover-light dark:hover:bg-hover-dark
                  transition-colors duration-150
                  focus:outline-none
                  focus:ring-1
                  focus:ring-accent/30
                "
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Selection Status */}
            <div className="mb-3 text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
              {selecting === "start" ? "Select start date" : "Select end date"}
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark text-center py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="h-8" />;
                }

                const inRange = isInRange(date);
                const startDate = isStartDate(date);
                const endDate = isEndDate(date);
                const today = isToday(date);
                const disabled = isDisabled(date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => !disabled && handleDateSelect(date)}
                    disabled={disabled}
                    className={`
                      h-8
                      rounded-[8px]
                      text-sm
                      font-medium
                      transition-all duration-150
                      focus:outline-none
                      focus:ring-1
                      focus:ring-accent/30
                      relative
                      ${
                        startDate || endDate
                          ? "bg-accent text-white"
                          : inRange
                          ? "bg-accent/20 text-text-primary-light dark:text-text-primary-dark"
                          : today
                          ? "bg-accent/10 text-accent border border-accent/30"
                          : disabled
                          ? "text-text-secondary-light dark:text-text-secondary-dark opacity-30 cursor-not-allowed"
                          : "text-text-primary-light dark:text-text-primary-dark hover:bg-hover-light dark:hover:bg-hover-dark"
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => {
                  onChange({ start: null, end: null });
                  setSelecting("start");
                  setIsOpen(false);
                }}
                className="
                  text-sm
                  text-text-secondary-light dark:text-text-secondary-dark
                  hover:text-accent
                  transition-colors duration-150
                "
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="
                  px-4 py-1.5
                  bg-accent
                  text-white
                  rounded-[8px]
                  text-sm
                  font-medium
                  hover:bg-accent/90
                  transition-colors duration-150
                "
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


