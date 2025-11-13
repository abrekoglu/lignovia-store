import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * LIGNOVIA Theme Preferences Component
 * 
 * Features:
 * - Theme switch (Light/Dark/Auto)
 * - Accent color preview
 * - Font size preference
 * - Visually refined design
 */
export default function ThemePreferences({ preferences, onUpdate }) {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(preferences.fontSize || "medium");

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme);
      // Update preferences via onUpdate callback
      onUpdate?.("theme", newTheme);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    onUpdate?.("fontSize", newSize);
    // Apply font size to document
    document.documentElement.style.fontSize =
      newSize === "small" ? "14px" : newSize === "large" ? "18px" : "16px";
  };

  const themeOptions = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
  ];

  const fontSizeOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
        Theme & Display
      </h3>

      <div className="space-y-6">
        {/* Theme Switch */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            Theme Preference
          </label>
          <div className="flex gap-2 bg-hover-light dark:bg-hover-dark rounded-[12px] p-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                  theme === option.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color Preview */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            Accent Color
          </label>
          <div className="flex items-center gap-4 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
            <div
              className="w-12 h-12 rounded-[10px] shadow-sm border-2 border-border-light dark:border-border-dark"
              style={{ backgroundColor: "#C8A98B" }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                LIGNOVIA Beige
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                #C8A98B
              </p>
            </div>
          </div>
        </div>

        {/* Font Size Preference */}
        <div>
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
            Font Size
          </label>
          <div className="flex gap-2 bg-hover-light dark:bg-hover-dark rounded-[12px] p-1">
            {fontSizeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontSizeChange(option.value)}
                className={`flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                  fontSize === option.value
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light dark:hover:bg-surface-dark"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

