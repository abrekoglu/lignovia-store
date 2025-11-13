import { createContext, useContext, useState, useCallback } from "react";

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // month, week, day, agenda
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    status: "all",
  });

  const navigateDate = useCallback((direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === "month") {
        newDate.setMonth(prev.getMonth() + direction);
      } else if (viewMode === "week") {
        newDate.setDate(prev.getDate() + direction * 7);
      } else if (viewMode === "day") {
        newDate.setDate(prev.getDate() + direction);
      }
      return newDate;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }, []);

  const addEvent = useCallback((event) => {
    const newEvent = {
      id: Date.now().toString(),
      ...event,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((eventId, updates) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, ...updates } : event))
    );
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId));
  }, []);

  const getEventsForDate = useCallback(
    (date) => {
      const dateStr = date.toISOString().split("T")[0];
      return events.filter((event) => {
        const eventDate = new Date(event.date).toISOString().split("T")[0];
        return eventDate === dateStr;
      });
    },
    [events]
  );

  const getFilteredEvents = useCallback(() => {
    return events.filter((event) => {
      // Category filter maps to type (since events use type, not category)
      if (filters.category !== "all" && event.type !== filters.category) return false;
      if (filters.type !== "all" && event.type !== filters.type) return false;
      if (filters.status !== "all" && event.status !== filters.status) return false;
      return true;
    });
  }, [events, filters]);

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        selectedDate,
        setSelectedDate,
        selectedEvent,
        setSelectedEvent,
        isAddEventModalOpen,
        setIsAddEventModalOpen,
        events,
        setEvents,
        filters,
        setFilters,
        navigateDate,
        goToToday,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsForDate,
        getFilteredEvents,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarProvider");
  }
  return context;
}

