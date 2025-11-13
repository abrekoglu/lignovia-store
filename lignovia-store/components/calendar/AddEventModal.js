import { useEffect, useState } from "react";
import { useCalendar } from "@/contexts/CalendarContext";
import DatePicker from "@/components/filters/DatePicker";
import FilterDropdown from "@/components/filters/FilterDropdown";

const eventTypeOptions = [
  { value: "order", label: "Order" },
  { value: "inventory", label: "Inventory" },
  { value: "task", label: "Task" },
  { value: "reminder", label: "Reminder" },
  { value: "deadline", label: "Deadline" },
];

export default function AddEventModal() {
  const { isAddEventModalOpen, setIsAddEventModalOpen, addEvent } = useCalendar();
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: null,
    time: null,
    type: "task",
    description: "",
    relatedEntity: "",
  });

  useEffect(() => {
    if (isAddEventModalOpen) {
      setMounted(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
      // Reset form
      setFormData({
        title: "",
        date: null,
        time: null,
        type: "task",
        description: "",
        relatedEntity: "",
      });
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isAddEventModalOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isAddEventModalOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isAddEventModalOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsAddEventModalOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date) {
      return;
    }

    // Combine date and time if both are provided
    let dateTime = formData.date;
    if (formData.time) {
      const [hours, minutes] = formData.time.split(":");
      const date = new Date(formData.date);
      date.setHours(parseInt(hours), parseInt(minutes));
      dateTime = date.toISOString();
    }

    addEvent({
      ...formData,
      date: formData.date,
      time: formData.time ? dateTime : null,
      status: "pending",
    });

    handleClose();
  };

  if (!isAddEventModalOpen && !isClosing) return null;

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
          w-full max-w-[560px]
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
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
            Create New Event
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Add a new event, task, or reminder to your calendar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="
                w-full
                px-4 py-2.5
                bg-bg-light dark:bg-bg-dark
                border border-border-light dark:border-border-dark
                rounded-[10px]
                text-text-primary-light dark:text-text-primary-dark
                placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
                focus:border-accent
                transition-all duration-200
              "
              placeholder="Enter event title"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <DatePicker
                label="Date *"
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                placeholder="Select date"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wider">
                Time
              </label>
              <input
                type="time"
                value={formData.time || ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="
                  w-full
                  px-4 py-2.5
                  bg-bg-light dark:bg-bg-dark
                  border border-border-light dark:border-border-dark
                  rounded-[10px]
                  text-text-primary-light dark:text-text-primary-dark
                  focus:outline-none
                  focus:ring-2
                  focus:ring-accent/30
                  focus:border-accent
                  transition-all duration-200
                "
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <FilterDropdown
              label="Event Type"
              options={eventTypeOptions}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value })}
              placeholder="Select type"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="
                w-full
                px-4 py-2.5
                bg-bg-light dark:bg-bg-dark
                border border-border-light dark:border-border-dark
                rounded-[10px]
                text-text-primary-light dark:text-text-primary-dark
                placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
                focus:border-accent
                transition-all duration-200
                resize-none
              "
              placeholder="Add notes or description..."
            />
          </div>

          {/* Related Entity */}
          <div>
            <label className="block text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2 uppercase tracking-wider">
              Related Entity (Optional)
            </label>
            <input
              type="text"
              value={formData.relatedEntity}
              onChange={(e) => setFormData({ ...formData, relatedEntity: e.target.value })}
              className="
                w-full
                px-4 py-2.5
                bg-bg-light dark:bg-bg-dark
                border border-border-light dark:border-border-dark
                rounded-[10px]
                text-text-primary-light dark:text-text-primary-dark
                placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
                focus:border-accent
                transition-all duration-200
              "
              placeholder="e.g., Order #12345, Product Name"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={handleClose}
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
                hover:text-accent
                transition-colors duration-150
                focus:outline-none
                focus:ring-2
                focus:ring-accent/30
              "
            >
              Cancel
            </button>
            <button
              type="submit"
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
              "
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


