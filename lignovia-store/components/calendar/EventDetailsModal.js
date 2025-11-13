import { useEffect, useState } from "react";
import { useCalendar } from "@/contexts/CalendarContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

const eventTypeIcons = {
  order: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  inventory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  task: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  reminder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  deadline: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

export default function EventDetailsModal() {
  const { selectedEvent, setSelectedEvent, updateEvent, deleteEvent } = useCalendar();
  const { confirm } = useConfirmDialog();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      setMounted(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  // Handle ESC key
  useEffect(() => {
    if (!selectedEvent) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedEvent]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsClosing(false);
    }, 200);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    const confirmed = await confirm({
      title: "Delete Event?",
      message: "Are you sure you want to delete this event? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (confirmed) {
      deleteEvent(selectedEvent.id);
      handleClose();
    }
  };

  const handleMarkAsDone = () => {
    if (!selectedEvent) return;
    updateEvent(selectedEvent.id, { status: "completed" });
    handleClose();
  };

  if (!selectedEvent && !isClosing) return null;

  const formatDateTime = (date, time) => {
    const dateObj = date ? new Date(date) : null;
    const timeObj = time ? new Date(time) : null;

    if (!dateObj) return "No date set";

    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (timeObj) {
      const timeStr = timeObj.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${dateStr} at ${timeStr}`;
    }

    return dateStr;
  };

  const icon = eventTypeIcons[selectedEvent?.type] || eventTypeIcons.task;
  const isCompleted = selectedEvent?.status === "completed";

  return (
    <div
      className={`
        fixed inset-0
        z-[10001]
        flex items-center justify-center
        p-4
        bg-black/30
        backdrop-blur-sm
        transition-opacity duration-200
        ${mounted && !isClosing ? "opacity-100" : "opacity-0"}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          w-full max-w-[520px]
          bg-surface-light dark:bg-surface-dark
          border border-border-light dark:border-border-dark
          rounded-[18px]
          shadow-soft dark:shadow-soft-dark
          p-8
          transition-all duration-200
          ${mounted && !isClosing ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-[12px] bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-accent">
              {icon}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
                {selectedEvent?.title}
              </h2>
              <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {selectedEvent?.type ? selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1) : "Event"}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="
              p-2
              rounded-[8px]
              text-text-secondary-light dark:text-text-secondary-dark
              hover:bg-hover-light dark:hover:bg-hover-dark
              hover:text-accent
              transition-colors duration-150
              focus:outline-none
              focus:ring-2
              focus:ring-accent/30
            "
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Date & Time */}
          <div>
            <div className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
              Date & Time
            </div>
            <div className="text-base text-text-primary-light dark:text-text-primary-dark">
              {formatDateTime(selectedEvent?.date, selectedEvent?.time)}
            </div>
          </div>

          {/* Description */}
          {selectedEvent?.description && (
            <div>
              <div className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                Description
              </div>
              <div className="text-base text-text-primary-light dark:text-text-primary-dark leading-relaxed">
                {selectedEvent.description}
              </div>
            </div>
          )}

          {/* Related Entity */}
          {selectedEvent?.relatedEntity && (
            <div>
              <div className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
                Related
              </div>
              <div className="text-base text-text-primary-light dark:text-text-primary-dark">
                {selectedEvent.relatedEntity}
              </div>
            </div>
          )}

          {/* Status */}
          {isCompleted && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-light/20 dark:bg-success-dark/20 text-success-light dark:text-success-dark rounded-[8px] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Completed
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border-light dark:border-border-dark">
          {!isCompleted && (
            <button
              onClick={handleMarkAsDone}
              className="
                flex-1
                px-4 py-2.5
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
                flex items-center justify-center gap-2
              "
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Mark as Done
            </button>
          )}
          <button
            onClick={handleDelete}
            className="
              flex-1
              px-4 py-2.5
              bg-transparent
              border border-border-light dark:border-border-dark
              text-text-secondary-light dark:text-text-secondary-dark
              rounded-[10px]
              text-sm
              font-medium
              hover:bg-hover-light dark:hover:bg-hover-dark
              hover:text-error-light dark:hover:text-error-dark
              transition-colors duration-150
              focus:outline-none
              focus:ring-2
              focus:ring-accent/30
              flex items-center justify-center gap-2
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

