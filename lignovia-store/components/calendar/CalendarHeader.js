import { useCalendar } from "@/contexts/CalendarContext";
import FilterDropdown from "@/components/filters/FilterDropdown";

const viewModes = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "agenda", label: "Agenda" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "order", label: "Orders" },
  { value: "inventory", label: "Inventory" },
  { value: "task", label: "Tasks" },
  { value: "reminder", label: "Reminders" },
  { value: "deadline", label: "Deadlines" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "order", label: "Order" },
  { value: "inventory", label: "Inventory" },
  { value: "task", label: "Task" },
  { value: "reminder", label: "Reminder" },
  { value: "deadline", label: "Deadline" },
];

export default function CalendarHeader() {
  const {
    currentDate,
    viewMode,
    setViewMode,
    navigateDate,
    goToToday,
    setIsAddEventModalOpen,
    filters,
    setFilters,
  } = useCalendar();

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const formatWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const formatDay = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const getDisplayText = () => {
    if (viewMode === "month") return formatMonthYear(currentDate);
    if (viewMode === "week") return formatWeekRange(currentDate);
    if (viewMode === "day") return formatDay(currentDate);
    return "Agenda";
  };

  return (
    <div className="mb-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Left: Date Display & Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateDate(-1)}
              className="
                p-2
                rounded-[10px]
                text-accent
                hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-150
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
              "
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigateDate(1)}
              className="
                p-2
                rounded-[10px]
                text-accent
                hover:bg-hover-light dark:hover:bg-hover-dark
                transition-colors duration-150
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
              "
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-text-primary-light dark:text-text-primary-dark tracking-tight">
            {getDisplayText()}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[10px] p-1">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => setViewMode(mode.value)}
                className={`
                  px-3 py-1.5
                  rounded-[8px]
                  text-sm
                  font-medium
                  transition-all duration-150
                  focus:outline-none
                  focus:ring-2
                  focus:ring-accent/30
                  ${
                    viewMode === mode.value
                      ? "bg-accent text-white"
                      : "text-text-secondary-light dark:text-text-secondary-dark hover:text-accent hover:bg-hover-light dark:hover:bg-hover-dark"
                  }
                `}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="
              px-4 py-2
              bg-surface-light dark:bg-surface-dark
              border border-border-light dark:border-border-dark
              rounded-[10px]
              text-sm
              font-medium
              text-text-primary-light dark:text-text-primary-dark
              hover:bg-hover-light dark:hover:bg-hover-dark
              transition-colors duration-150
              focus:outline-none
              focus:ring-2
              focus:ring-accent/30
            "
          >
            Today
          </button>

          {/* Add Event Button */}
          <button
            type="button"
            onClick={() => setIsAddEventModalOpen(true)}
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
              flex items-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-auto min-w-[180px]">
          <FilterDropdown
            label=""
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => setFilters({ ...filters, category: value })}
            placeholder="All Categories"
            className="mb-0"
          />
        </div>
        <div className="w-full sm:w-auto min-w-[180px]">
          <FilterDropdown
            label=""
            options={typeOptions}
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value })}
            placeholder="All Types"
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
}


