import { useState } from "react";

const eventTypeIcons = {
  order: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125.504 1.125 1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  inventory: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
    </svg>
  ),
  task: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  reminder: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  deadline: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

const eventTypeColors = {
  order: "bg-accent/30 text-text-primary-light dark:text-text-primary-dark border-accent/20",
  inventory: "bg-[#4F8A5E]/40 text-text-primary-light dark:text-text-primary-dark border-[#4F8A5E]/30",
  task: "bg-accent/30 text-text-primary-light dark:text-text-primary-dark border-accent/20",
  reminder: "bg-[#D0A37A]/40 text-text-primary-light dark:text-text-primary-dark border-[#D0A37A]/30",
  deadline: "bg-[#B35B4E]/40 text-text-primary-light dark:text-text-primary-dark border-[#B35B4E]/30",
};

export default function EventCard({ event, onClick, compact = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (dateTime) => {
    if (!dateTime) return "";
    const date = new Date(dateTime);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const icon = eventTypeIcons[event.type] || eventTypeIcons.task;
  const colorClass = eventTypeColors[event.type] || eventTypeColors.task;

  if (compact) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          w-full
          px-2 py-1
          rounded-[6px]
          text-xs
          font-medium
          truncate
          cursor-pointer
          transition-all duration-150
          border
          ${colorClass}
          ${isHovered ? "opacity-90 scale-[1.02]" : ""}
        `}
        title={event.title}
      >
        <div className="flex items-center gap-1.5">
          <span className="flex-shrink-0">{icon}</span>
          <span className="truncate">{event.title}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full
        px-3 py-2
        rounded-[8px]
        text-sm
        cursor-pointer
        transition-all duration-150
        border
        ${colorClass}
        ${isHovered ? "opacity-90 scale-[1.02] shadow-md" : ""}
      `}
    >
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-text-primary-light dark:text-text-primary-dark truncate">
            {event.title}
          </div>
          {event.time && (
            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
              {formatTime(event.time)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


