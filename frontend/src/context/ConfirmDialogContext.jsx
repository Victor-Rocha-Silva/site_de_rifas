import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ConfirmDialogContext = createContext(null);

function ConfirmDialog({ dialog, onConfirm, onCancel }) {
  if (!dialog) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-head">
          <h2>{dialog.title || "Confirmar ação"}</h2>
          <p>{dialog.description || "Deseja continuar com esta ação?"}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-secondary-btn"
            onClick={onCancel}
          >
            {dialog.cancelText || "Cancelar"}
          </button>

          <button
            type="button"
            className="confirm-primary-btn"
            onClick={onConfirm}
          >
            {dialog.confirmText || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (dialog?.resolve) {
      dialog.resolve(true);
    }
    setDialog(null);
  }, [dialog]);

  const handleCancel = useCallback(() => {
    if (dialog?.resolve) {
      dialog.resolve(false);
    }
    setDialog(null);
  }, [dialog]);

  const value = useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  return (
    <ConfirmDialogContext.Provider value={value}>
      {children}
      <ConfirmDialog
        dialog={dialog}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}