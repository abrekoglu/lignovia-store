import { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "@/components/ToastContainer";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message: toast.message,
      variant: toast.variant || "info",
      duration: toast.duration !== undefined ? toast.duration : 4000,
      persistent: toast.persistent || false,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, variant = "info", options = {}) => {
      return addToast({
        message,
        variant,
        ...options,
      });
    },
    [addToast]
  );

  const toastSuccess = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "success",
        ...options,
      });
    },
    [addToast]
  );

  const toastError = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "error",
        ...options,
      });
    },
    [addToast]
  );

  const toastWarning = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "warning",
        ...options,
      });
    },
    [addToast]
  );

  const toastInfo = useCallback(
    (message, options = {}) => {
      return addToast({
        message,
        variant: "info",
        ...options,
      });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    toast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

