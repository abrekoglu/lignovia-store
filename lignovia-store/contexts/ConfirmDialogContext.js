import { createContext, useContext, useState, useCallback } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    iconType: "checkmark",
    variant: "normal",
    onConfirm: null,
    onCancel: null,
    isLoading: false,
  });

  const confirm = useCallback(
    ({
      title = "Confirm Action",
      message = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      iconType = "checkmark",
      variant = "normal",
      onConfirm,
      onCancel,
    }) => {
      return new Promise((resolve) => {
        setDialogState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText: cancelText === null ? null : cancelText || "Cancel",
          iconType,
          variant,
          onConfirm: () => {
            if (onConfirm) {
              onConfirm();
            }
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(true);
          },
          onCancel: () => {
            if (onCancel) {
              onCancel();
            }
            setDialogState((prev) => ({ ...prev, isOpen: false }));
            resolve(false);
          },
          isLoading: false,
        });
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      onConfirm: null,
      onCancel: null,
    }));
  }, []);

  const setLoading = useCallback((isLoading) => {
    setDialogState((prev) => ({ ...prev, isLoading }));
  }, []);

  return (
    <ConfirmDialogContext.Provider value={{ confirm, closeDialog, setLoading }}>
      {children}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={dialogState.onCancel || closeDialog}
        onConfirm={dialogState.onConfirm || closeDialog}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        iconType={dialogState.iconType}
        variant={dialogState.variant}
        isLoading={dialogState.isLoading}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within ConfirmDialogProvider");
  }
  return context;
}

