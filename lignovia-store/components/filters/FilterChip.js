import { useState } from "react";

export default function FilterChip({
  label,
  onRemove,
  onClick,
  variant = "default", // default, accent
  className = "",
}) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `
    inline-flex
    items-center
    gap-2
    px-3 py-1.5
    rounded-full
    text-sm
    font-medium
    transition-all duration-150
    ${onClick ? "cursor-pointer" : ""}
  `;

  const variantClasses = {
    default: `
      bg-hover-light dark:bg-hover-dark
      text-text-primary-light dark:text-text-primary-dark
      border border-border-light dark:border-border-dark
      ${isHovered ? "bg-[#E5DED7] dark:bg-[#3B332C]" : ""}
    `,
    accent: `
      bg-accent/10 dark:bg-accent/20
      text-accent
      border border-accent/30
      ${isHovered ? "bg-accent/20 dark:bg-accent/30" : ""}
    `,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="
            flex items-center justify-center
            w-4 h-4
            rounded-full
            text-accent
            hover:bg-accent/20
            transition-colors duration-150
            focus:outline-none
            focus:ring-1
            focus:ring-accent/30
          "
          aria-label={`Remove ${label}`}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function FilterChips({ chips = [], onRemove, onClearAll, className = "" }) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {chips.map((chip, index) => (
        <FilterChip
          key={chip.id || index}
          label={chip.label}
          onRemove={chip.onRemove || (() => onRemove?.(chip))}
          onClick={chip.onClick}
          variant={chip.variant || "default"}
        />
      ))}
      {onClearAll && chips.length > 1 && (
        <FilterChip
          label="Clear All"
          onRemove={null}
          onClick={onClearAll}
          variant="accent"
          className="border-accent"
        />
      )}
    </div>
  );
}


