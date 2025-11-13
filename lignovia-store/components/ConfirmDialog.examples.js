/**
 * CONFIRMATION DIALOG USAGE EXAMPLES
 * 
 * This file contains usage examples for the ConfirmDialog component
 * across different admin panel scenarios.
 * 
 * The ConfirmDialog is available via the useConfirmDialog hook.
 */

import { useConfirmDialog } from "@/contexts/ConfirmDialogContext";
import { useToast } from "@/contexts/ToastContext";

// ============================================
// EXAMPLE 1: Delete Product (Destructive)
// ============================================
export function ExampleDeleteProduct() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleDelete = async (productId) => {
    const confirmed = await confirm({
      title: "Delete Product?",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Product deleted successfully!");
        // Refresh products list
      } else {
        toastError(data.error || "Failed to delete product");
      }
    } catch (err) {
      toastError("Error deleting product: " + err.message);
    }
  };

  return <button onClick={() => handleDelete(123)}>Delete Product</button>;
}

// ============================================
// EXAMPLE 2: Update Order Status (Normal)
// ============================================
export function ExampleUpdateOrderStatus() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleStatusUpdate = async (orderId, newStatus) => {
    const confirmed = await confirm({
      title: "Update Status?",
      message: `You are about to change the order status to "${newStatus}". This will apply immediately.`,
      confirmText: "Update",
      cancelText: "Cancel",
      iconType: "checkmark",
      variant: "normal",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Order status updated successfully!");
        // Refresh orders list
      } else {
        toastError(data.error || "Failed to update order status");
      }
    } catch (err) {
      toastError("Error updating order status: " + err.message);
    }
  };

  return <button onClick={() => handleStatusUpdate(123, "shipped")}>Update Status</button>;
}

// ============================================
// EXAMPLE 3: Stock Adjustment (Warning)
// ============================================
export function ExampleStockAdjustment() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleStockUpdate = async (productId, newStock) => {
    const confirmed = await confirm({
      title: "Update Stock?",
      message: `You are about to change the stock quantity to ${newStock}. This will apply immediately.`,
      confirmText: "Update",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "normal",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Stock updated successfully!");
        // Refresh products list
      } else {
        toastError(data.error || "Failed to update stock");
      }
    } catch (err) {
      toastError("Error updating stock: " + err.message);
    }
  };

  return <button onClick={() => handleStockUpdate(123, 50)}>Update Stock</button>;
}

// ============================================
// EXAMPLE 4: Publish/Unpublish Product
// ============================================
export function ExamplePublishProduct() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handlePublishToggle = async (productId, currentStatus) => {
    const action = currentStatus ? "unpublish" : "publish";
    const confirmed = await confirm({
      title: `${action === "publish" ? "Publish" : "Unpublish"} Product?`,
      message: `Are you sure you want to ${action} this product? ${
        action === "unpublish"
          ? "It will no longer be visible to customers."
          : "It will be visible to customers immediately."
      }`,
      confirmText: action === "publish" ? "Publish" : "Unpublish",
      cancelText: "Cancel",
      iconType: action === "publish" ? "checkmark" : "alert",
      variant: "normal",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: action === "publish" }),
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess(`Product ${action}ed successfully!`);
        // Refresh products list
      } else {
        toastError(data.error || `Failed to ${action} product`);
      }
    } catch (err) {
      toastError(`Error ${action}ing product: ` + err.message);
    }
  };

  return <button onClick={() => handlePublishToggle(123, false)}>Publish Product</button>;
}

// ============================================
// EXAMPLE 5: Logout Confirmation
// ============================================
export function ExampleLogout() {
  const { confirm } = useConfirmDialog();
  const { signOut } = require("next-auth/react");

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Sign Out?",
      message: "Are you sure you want to sign out? You will need to sign in again to access the admin panel.",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      iconType: "lock",
      variant: "normal",
    });

    if (!confirmed) return;

    signOut({ callbackUrl: "/login" });
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}

// ============================================
// EXAMPLE 6: Reset Settings (Destructive)
// ============================================
export function ExampleResetSettings() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleResetSettings = async () => {
    const confirmed = await confirm({
      title: "Reset Settings?",
      message: "Are you sure you want to reset all settings to their default values? This action cannot be undone.",
      confirmText: "Reset",
      cancelText: "Cancel",
      iconType: "alert",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const response = await fetch("/api/admin/settings/reset", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Settings reset successfully!");
        // Refresh settings
      } else {
        toastError(data.error || "Failed to reset settings");
      }
    } catch (err) {
      toastError("Error resetting settings: " + err.message);
    }
  };

  return <button onClick={handleResetSettings}>Reset Settings</button>;
}

// ============================================
// EXAMPLE 7: Remove Customer (Destructive)
// ============================================
export function ExampleRemoveCustomer() {
  const { confirm } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleRemoveCustomer = async (customerId, customerName) => {
    const confirmed = await confirm({
      title: "Remove Customer?",
      message: `Are you sure you want to remove "${customerName}" from the system? This action cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      iconType: "trash",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Customer removed successfully!");
        // Refresh customers list
      } else {
        toastError(data.error || "Failed to remove customer");
      }
    } catch (err) {
      toastError("Error removing customer: " + err.message);
    }
  };

  return <button onClick={() => handleRemoveCustomer(123, "John Doe")}>Remove Customer</button>;
}

// ============================================
// EXAMPLE 8: Info Dialog (Neutral)
// ============================================
export function ExampleInfoDialog() {
  const { confirm } = useConfirmDialog();

  const handleInfo = async () => {
    await confirm({
      title: "Information",
      message: "This feature is currently in development. It will be available in a future update.",
      confirmText: "OK",
      cancelText: null, // Hide cancel button for info dialogs
      iconType: "info",
      variant: "normal",
    });
  };

  return <button onClick={handleInfo}>Show Info</button>;
}

// ============================================
// EXAMPLE 9: With Loading State
// ============================================
export function ExampleWithLoading() {
  const { confirm, setLoading } = useConfirmDialog();
  const { toastSuccess, toastError } = useToast();

  const handleActionWithLoading = async (actionId) => {
    const confirmed = await confirm({
      title: "Process Action?",
      message: "This action may take a few moments to complete.",
      confirmText: "Process",
      cancelText: "Cancel",
      iconType: "checkmark",
      variant: "normal",
    });

    if (!confirmed) return;

    // Set loading state (if you need to show loading in the dialog)
    // Note: This requires updating the ConfirmDialogContext to support setLoading
    // For now, you can handle loading in your component state

    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toastSuccess("Action completed successfully!");
      } else {
        toastError(data.error || "Failed to process action");
      }
    } catch (err) {
      toastError("Error processing action: " + err.message);
    }
  };

  return <button onClick={() => handleActionWithLoading(123)}>Process Action</button>;
}


