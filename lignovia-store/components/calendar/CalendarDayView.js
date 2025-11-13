import { useCalendar } from "@/contexts/CalendarContext";
import EventCard from "./EventCard";

export default function CalendarDayView() {
  const { currentDate, getEventsForDate, getFilteredEvents, setSelectedEvent } = useCalendar();

  // Get filtered events for current date
  const filteredEvents = getFilteredEvents();
  const events = filteredEvents.filter((event) => {
    const eventDate = new Date(event.date).toISOString().split("T")[0];
    const dateStr = currentDate.toISOString().split("T")[0];
    return eventDate === dateStr;
  });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const getEventsForHour = (hour) => {
    return events.filter((event) => {
      if (!event.time) return false;
      const eventHour = new Date(event.time).getHours();
      return eventHour === hour;
    });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[18px] p-6 overflow-hidden">
      <div className="flex">
        {/* Hour Labels */}
        <div className="w-20 flex-shrink-0 pr-4">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-16 border-b border-border-light dark:border-border-dark flex items-start pt-1"
            >
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {formatHour(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Events Timeline */}
        <div className="flex-1 relative">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            return (
              <div
                key={hour}
                className="h-16 border-b border-border-light dark:border-border-dark relative"
              >
                {hourEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="absolute top-0 left-0 right-0"
                    style={{ top: `${index * 60}%` }}
                  >
                    <EventCard
                      event={event}
                      onClick={() => handleEventClick(event)}
                      compact={false}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

