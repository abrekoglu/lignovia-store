import { useState } from "react";
import { signOut } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";

/**
 * LIGNOVIA Account Actions Component
 * 
 * Features:
 * - Delete account option
 * - Deactivate account option
 * - Calm, safe design
 */
export default function AccountActions() {
  const { toastSuccess, toastError } = useToast();
  const { confirm } = useConfirmDialog();
  const [loading, setLoading] = useState(false);

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirmed = await confirm({
      title: "Delete Account?",
      message: "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently removed.",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "destructive",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      // TODO: Implement API call to delete account
      // const response = await fetch("/api/admin/delete-account", {
      //   method: "DELETE",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toastSuccess("Account deleted successfully");
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toastError("Failed to delete account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle deactivate account
  const handleDeactivateAccount = async () => {
    const confirmed = await confirm({
      title: "Deactivate Account?",
      message: "Your account will be temporarily disabled. You can reactivate it later by logging in.",
      confirmText: "Deactivate",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "normal",
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      // TODO: Implement API call to deactivate account
      // const response = await fetch("/api/admin/deactivate-account", {
      //   method: "POST",
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toastSuccess("Account deactivated successfully");
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toastError("Failed to deactivate account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 md:p-8 border-error-light/30 dark:border-error-dark/30">
      <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-6 tracking-tight">
        Account Actions
      </h3>

      <div className="space-y-4">
        {/* Deactivate Account */}
        <div className="p-4 bg-hover-light dark:bg-hover-dark rounded-[12px] border border-border-light dark:border-border-dark">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Deactivate Account
              </h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Temporarily disable your account. You can reactivate it later by logging in.
              </p>
            </div>
            <button
              onClick={handleDeactivateAccount}
              disabled={loading}
              className="px-4 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-[10px] text-sm font-medium hover:bg-hover-light dark:hover:bg-hover-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-error-light/10 dark:bg-error-dark/10 rounded-[12px] border border-error-light/30 dark:border-error-dark/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-1">
                Delete Account
              </h4>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <p className="text-xs text-error-light dark:text-error-dark font-medium">
                Warning: This action is permanent and irreversible.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="px-4 py-2 bg-error-light/20 dark:bg-error-dark/20 text-error-light dark:text-error-dark border border-error-light/30 dark:border-error-dark/30 rounded-[10px] text-sm font-medium hover:bg-error-light/30 dark:hover:bg-error-dark/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

