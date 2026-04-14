const listeners = new Set();

export function onToast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(payload) {
  listeners.forEach((listener) => listener(payload));
}

export const toast = {
  success(title, message, duration = 3500) {
    emit({ type: "success", title, message, duration });
  },

  error(title, message, duration = 4000) {
    emit({ type: "error", title, message, duration });
  },

  warning(title, message, duration = 4000) {
    emit({ type: "warning", title, message, duration });
  },

  info(title, message, duration = 3500) {
    emit({ type: "info", title, message, duration });
  },
};