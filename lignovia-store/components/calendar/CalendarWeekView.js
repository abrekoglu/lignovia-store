import { useCalendar } from "@/contexts/CalendarContext";
import EventCard from "./EventCard";
import { useState } from "react";

export default function CalendarWeekView() {
  const { currentDate, getEventsForDate, getFilteredEvents, setSelectedDate, selectedDate, setSelectedEvent } = useCalendar();
  const [hoveredDate, setHoveredDate] = useState(null);

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
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

  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const weekDays = getWeekDays(currentDate);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleEventClick = (event, date) => {
    setSelectedEvent(event);
    setSelectedDate(date);
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[18px] p-6 overflow-hidden">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, index) => {
          // Get filtered events for this date
          const filteredEvents = getFilteredEvents();
          const events = filteredEvents.filter((event) => {
            const eventDate = new Date(event.date).toISOString().split("T")[0];
            const dateStr = date.toISOString().split("T")[0];
            return eventDate === dateStr;
          });
          const today = isToday(date);
          const selected = isSelected(date);
          const hovered = hoveredDate && date.getTime() === hoveredDate.getTime();

          return (
            <div
              key={index}
              className={`
                min-h-[400px]
                border-l
                ${index === 0 ? "border-l-0" : "border-border-light dark:border-border-dark"}
                pl-4
                ${index === 0 ? "pl-0" : ""}
              `}
            >
              {/* Day Header */}
              <div
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`
                  mb-3
                  pb-2
                  border-b
                  border-border-light dark:border-border-dark
                  cursor-pointer
                  transition-all duration-150
                  ${selected ? "border-accent" : ""}
                `}
              >
                <div className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                  {dayNames[index]}
                </div>
                <div
                  className={`
                    text-lg
                    font-semibold
                    ${today ? "text-accent" : "text-text-primary-light dark:text-text-primary-dark"}
                    ${selected ? "text-accent" : ""}
                  `}
                >
                  {date.getDate()}
                </div>
              </div>

              {/* Events */}
              <div className="space-y-2">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, date);
                    }}
                    compact={false}
                  />
                ))}
                {events.length === 0 && (
                  <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center py-4">
                    No events
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

