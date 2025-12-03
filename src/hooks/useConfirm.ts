import { useState, useCallback } from "react";
import { ConfirmType, ConfirmAction } from "../components/Modal/ModalConfirm";
import { useToast } from "./useToast";

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

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  type: ConfirmType;
  action: ConfirmAction;
  confirmText?: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isAlert: boolean;
}

export function useConfirm() {
  const { showSuccessToast, showErrorToast, showInfoToast, showWarningToast } =
    useToast();

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    action: "custom",
    cancelText: "Cancel",
    onConfirm: () => {},
    onCancel: () => {},
    isLoading: false,
    isAlert: false,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setConfirmState((prev) => ({
          ...prev,
          isOpen: false,
          isLoading: false,
        }));
        resolve(true);
      };

      const handleCancel = () => {
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
        resolve(false);
      };

      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type || "info",
        action: options.action || "custom",
        confirmText: options.confirmText,
        cancelText: options.cancelText || "Cancel",
        onConfirm: handleConfirm,
        onCancel: handleCancel,
        isLoading: false,
        isAlert: false,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        type: options.type || "info",
        action: "custom",
        cancelText: "OK",
        onConfirm: () => {
          // Cerrar el modal inmediatamente
          setConfirmState((prev) => ({
            ...prev,
            isOpen: false,
            isLoading: false,
          }));
          // Resolver después de un pequeño delay para asegurar que el estado se actualice
          setTimeout(() => resolve(), 0);
        },
        onCancel: () => {
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
          resolve();
        },
        isLoading: false,
        isAlert: true,
      });
    });
  }, []);

  const close = useCallback(() => {
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
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

  const confirmExport = useCallback(
    (title: string, message: string, confirmText?: string) => {
      return confirm({
        title,
        message,
        type: "info",
        action: "export",
        confirmText,
      });
    },
    [confirm]
  );

  const confirmWarning = useCallback(
    (title: string, message: string, confirmText?: string) => {
      return confirm({
        title,
        message,
        type: "warning",
        confirmText,
      });
    },
    [confirm]
  );

  // Convenience methods for different alert types
  const alertSuccess = useCallback(
    (title: string, message: string) => {
      showSuccessToast(title, message);
    },
    [showSuccessToast]
  );

  const alertError = useCallback(
    (title: string, message: string) => {
      showErrorToast(title, message);
    },
    [showErrorToast]
  );

  const alertWarning = useCallback(
    (title: string, message: string) => {
      showWarningToast(title, message);
    },
    [showWarningToast]
  );

  const alertInfo = useCallback(
    (title: string, message: string) => {
      showInfoToast(title, message);
    },
    [showInfoToast]
  );

  return {
    confirmState,
    confirm,
    confirmDelete,
    confirmSave,
    confirmExport,
    confirmWarning,
    close,
    alert,
    alertSuccess,
    alertError,
    alertWarning,
    alertInfo,
  };
}
