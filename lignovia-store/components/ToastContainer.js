import { useEffect, useState } from "react";
import Toast from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) {
    return null;
  }

  return (
    <>
      {/* Desktop: Top-right */}
      <div className="hidden md:block fixed top-6 right-6 z-[9999] pointer-events-none">
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              persistent={toast.persistent}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>

      {/* Mobile: Bottom-center */}
      <div className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none w-[90%] max-w-[360px]">
        <div className="flex flex-col gap-3 items-center pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              persistent={toast.persistent}
              onClose={removeToast}
            />
          ))}
        </div>
      </div>
    </>
  );
}
