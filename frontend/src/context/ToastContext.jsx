import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

function ToastItem({ toast, onClose }) {
  return (
    <div className={`toast-item ${toast.type || "info"}`}>
      <div className="toast-item-content">
        {toast.title && <strong>{toast.title}</strong>}
        <span>{toast.message}</span>
      </div>

      <button
        type="button"
        className="toast-close-btn"
        onClick={() => onClose(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "info",
      title = "",
      message = "",
      duration = 3500,
    }) => {
      const id = crypto.randomUUID();

      const toast = {
        id,
        type,
        title,
        message,
      };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title, message, duration = 3500) => {
      showToast({ type: "success", title, message, duration });
    },
    [showToast]
  );

  const error = useCallback(
    (title, message, duration = 4000) => {
      showToast({ type: "error", title, message, duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (title, message, duration = 4000) => {
      showToast({ type: "warning", title, message, duration });
    },
    [showToast]
  );

  const info = useCallback(
    (title, message, duration = 3500) => {
      showToast({ type: "info", title, message, duration });
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
    }),
    [showToast, success, error, warning, info]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}