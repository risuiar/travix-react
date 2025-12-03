import { useCallback } from "react";
import { useModal } from "./useModal";
import { ConfirmType, ConfirmAction } from "../components/Modal/ModalConfirm";

interface ConfirmOptions {
  title: string;
  message: string;
  type?: ConfirmType;
  action?: ConfirmAction;
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  title: string;
  message: string;
  type?: ConfirmType;
}

export function useModalConfirm() {
  const modal = useModal();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const confirm = useCallback((_options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // Aquí implementarías la lógica de confirmación
      // Por ahora retornamos true como ejemplo
      resolve(true);
    });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const alert = useCallback((_options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      // Aquí implementarías la lógica de alerta
      resolve();
    });
  }, []);

  // Convenience methods for different types
  const confirmDelete = useCallback(
    (title: string, message: string, confirmText?: string) => {
      return confirm({
        title,
        message,
        type: "danger",
        action: "delete",
        confirmText,
      });
    },
    [confirm]
  );

  const confirmSave = useCallback(
    (title: string, message: string, confirmText?: string) => {
      return confirm({
        title,
        message,
        type: "success",
        action: "save",
        confirmText,
      });
    },
    [confirm]
  );

  const alertSuccess = useCallback(
    (title: string, message: string) => {
      return alert({ title, message, type: "success" });
    },
    [alert]
  );

  const alertError = useCallback(
    (title: string, message: string) => {
      return alert({ title, message, type: "danger" });
    },
    [alert]
  );

  return {
    ...modal,
    confirm,
    confirmDelete,
    confirmSave,
    alert,
    alertSuccess,
    alertError,
  };
}
