import { useState } from "react";

/**
 * LIGNOVIA Notification Preferences Component
 * 
 * Features:
 * - Notification toggles
 * - Rounded pill toggles
 * - Accent color when active
 * - Soft animations
 */
export default function NotificationPreferences({ preferences, onToggle }) {
  const notifications = [
    {
      key: "productUpdates",
      label: "Product Updates",
      description: "Get notified about new products and updates",
    },
    {
      key: "orderAlerts",
      label: "Order Alerts",
      description: "Receive notifications for new orders and status changes",
    },
    {
      key: "systemNotifications",
      label: "System Notifications",
      description: "Important system updates and maintenance alerts",
    },
    {
      key: "inventoryWarnings",
      label: "Inventory Warnings",
      description: "Alerts when products are running low on stock",
    },
    {
      key: "marketingEmails",
      label: "Marketing Emails",
      description: "Receive promotional emails and newsletters",
    },
  ];

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const isEnabled = preferences.notifications?.[notification.key] || false;

          return (
            <div
              key={notification.key}
              className="flex items-start justify-between gap-4 p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark transition-all duration-200 hover:bg-surface-light dark:hover:bg-surface-dark"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  {notification.label}
                </h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {notification.description}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => onToggle?.(notification.key, !isEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                  isEnabled ? "bg-accent" : "bg-border-light dark:bg-border-dark"
                }`}
                role="switch"
                aria-checked={isEnabled}
                aria-label={`Toggle ${notification.label}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


