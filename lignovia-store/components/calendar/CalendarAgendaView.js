import { useCalendar } from "@/contexts/CalendarContext";
import EventCard from "./EventCard";

export default function CalendarAgendaView() {
  const { getFilteredEvents, setSelectedEvent, setSelectedDate } = useCalendar();

  const events = getFilteredEvents().sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });

  const groupEventsByDate = (events) => {
    const grouped = {};
    events.forEach((event) => {
      const dateKey = new Date(event.date).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  };

  const groupedEvents = groupEventsByDate(events);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
  };

  if (events.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[18px] p-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
        </div>
        <p className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
          No upcoming events
        </p>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Create your first event to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-[18px] p-6 overflow-hidden">
      <div className="space-y-6">
        {Object.entries(groupedEvents)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([dateKey, dateEvents]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="mb-4 pb-3 border-b border-border-light dark:border-border-dark">
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                  {formatDateHeader(dateKey)}
                </h3>
              </div>

              {/* Events List */}
              <div className="space-y-2">
                {dateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                    compact={false}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

