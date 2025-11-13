import { useCalendar } from "@/contexts/CalendarContext";
import CalendarHeader from "./CalendarHeader";
import CalendarMonthView from "./CalendarMonthView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarDayView from "./CalendarDayView";
import CalendarAgendaView from "./CalendarAgendaView";
import EventDetailsModal from "./EventDetailsModal";
import AddEventModal from "./AddEventModal";

export default function AdminCalendar() {
  const { viewMode } = useCalendar();

  const renderView = () => {
    switch (viewMode) {
      case "month":
        return <CalendarMonthView />;
      case "week":
        return <CalendarWeekView />;
      case "day":
        return <CalendarDayView />;
      case "agenda":
        return <CalendarAgendaView />;
      default:
        return <CalendarMonthView />;
    }
  };

  return (
    <div className="w-full">
      <CalendarHeader />
      <div className="mb-6">{renderView()}</div>
      <EventDetailsModal />
      <AddEventModal />
    </div>
  );
}

