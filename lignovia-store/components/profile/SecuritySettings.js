import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import ChangePasswordModal from "./ChangePasswordModal";

/**
 * LIGNOVIA Security Settings Component
 * 
 * Features:
 * - Change password modal
 * - 2FA toggle
 * - Active sessions list
 * - Log out from all devices
 */
export default function SecuritySettings({ preferences, onPreferenceUpdate, activeSessions = [] }) {
  const { toastSuccess, toastError } = useToast();
  const { confirm } = useConfirmDialog();
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const twoFactorAuth = preferences.twoFactorAuth || false;

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to toggle 2FA
      // const response = await fetch("/api/admin/two-factor-auth", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ enabled: !twoFactorAuth }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newValue = !twoFactorAuth;
      onPreferenceUpdate?.("twoFactorAuth", newValue);
      toastSuccess(newValue ? "Two-factor authentication enabled" : "Two-factor authentication disabled");
    } catch (error) {
      toastError("Failed to update two-factor authentication: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle log out from all devices
  const handleLogoutAll = async () => {
    const confirmed = await confirm({
      title: "Log Out from All Devices?",
      message: "Are you sure you want to log out from all devices? You will need to sign in again on all devices.",
      confirmText: "Log Out",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "normal",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      // TODO: Implement API call to logout from all devices
      // const response = await fetch("/api/auth/logout-all", {
      //   method: "POST",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toastSuccess("Logged out from all devices successfully");
      // Optionally reload the page or redirect
    } catch (error) {
      toastError("Failed to log out from all devices: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 md:p-8">
      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
        Security Settings
      </h3>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Password
              </h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Update your password to keep your account secure
              </p>
            </div>
            <button
              onClick={() => setIsChangePasswordModalOpen(true)}
              className="px-4 py-2 bg-accent text-white rounded-[10px] text-sm font-medium hover:bg-accent/90 transition-colors duration-200"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
                twoFactorAuth ? "bg-accent/20 dark:bg-accent/30" : "bg-border-light dark:bg-border-dark"
              }`}>
                <svg
                  className={`w-5 h-5 ${twoFactorAuth ? "text-accent" : "text-text-secondary-light dark:text-text-secondary-dark"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <button
              onClick={handle2FAToggle}
              disabled={loading}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                twoFactorAuth ? "bg-accent" : "bg-border-light dark:bg-border-dark"
              }`}
              role="switch"
              aria-checked={twoFactorAuth}
              aria-label="Toggle two-factor authentication"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  twoFactorAuth ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Active Sessions
            </h4>
            {activeSessions.length > 0 && (
              <button
                onClick={handleLogoutAll}
                disabled={loading}
                className="text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-accent transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log out from all devices
              </button>
            )}
          </div>
          {activeSessions.length > 0 ? (
            <div className="space-y-2">
              {activeSessions.map((session, index) => (
                <div
                  key={index}
                  className="p-3 bg-hover-light dark:bg-hover-dark rounded-[10px] border border-border-light dark:border-border-dark"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                        {session.device || "Unknown Device"}
                      </p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                        {session.location || "Unknown Location"} • {session.lastActive || "Just now"}
                      </p>
                    </div>
                    {session.current && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-accent/20 dark:bg-accent/30 text-accent">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-hover-light dark:bg-hover-dark rounded-[10px] border border-border-light dark:border-border-dark text-center">
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                No active sessions found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}

