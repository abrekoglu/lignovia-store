import { useCalendar } from "@/contexts/CalendarContext";
import EventCard from "./EventCard";
import { useState } from "react";

export default function CalendarMonthView() {
  const { currentDate, getEventsForDate, getFilteredEvents, setSelectedDate, selectedDate, setSelectedEvent } = useCalendar();
  const [hoveredDate, setHoveredDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getPreviousMonthDays = (year, month, startingDayOfWeek) => {
    const days = [];
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(prevYear, prevMonth, daysInPrevMonth - i));
    }
    return days;
  };

  const getNextMonthDays = (year, month, daysInMonth, startingDayOfWeek) => {
    const days = [];
    const totalCells = 42; // 6 weeks * 7 days
    const usedCells = startingDayOfWeek + daysInMonth;
    const remainingCells = totalCells - usedCells;

    for (let i = 1; i <= remainingCells; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const previousDays = getPreviousMonthDays(year, month, startingDayOfWeek);
  const currentDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const nextDays = getNextMonthDays(year, month, daysInMonth, startingDayOfWeek);

  const allDays = [...previousDays, ...currentDays, ...nextDays];

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event, date) => {
    setSelectedEvent(event);
    setSelectedDate(date);
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[18px] p-6 overflow-hidden">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark text-center py-2 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {allDays.map((date, index) => {
          // Get filtered events for this date
          const filteredEvents = getFilteredEvents();
          const events = filteredEvents.filter((event) => {
            const eventDate = new Date(event.date).toISOString().split("T")[0];
            const dateStr = date.toISOString().split("T")[0];
            return eventDate === dateStr;
          });
          const today = isToday(date);
          const currentMonth = isCurrentMonth(date);
          const selected = isSelected(date);
          const hovered = hoveredDate && date.getTime() === hoveredDate.getTime();

          return (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                min-h-[100px] lg:min-h-[120px]
                p-2
                rounded-[12px]
                border
                transition-all duration-150
                cursor-pointer
                ${
                  selected
                    ? "border-accent bg-accent/10 dark:bg-accent/20"
                    : hovered
                    ? "border-border-light dark:border-border-dark bg-hover-light dark:bg-hover-dark"
                    : "border-transparent bg-transparent"
                }
                ${!currentMonth ? "opacity-40" : ""}
              `}
            >
              {/* Date Number */}
              <div
                className={`
                  text-sm
                  font-medium
                  mb-1.5
                  ${today ? "text-accent" : "text-text-secondary-light dark:text-text-secondary-dark"}
                  ${selected ? "text-accent font-semibold" : ""}
                `}
              >
                {date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {events.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, date);
                    }}
                    compact={true}
                  />
                ))}
                {events.length > 3 && (
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark px-2 py-0.5">
                    +{events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

