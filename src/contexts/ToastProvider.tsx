import React, { useState, useCallback } from "react";
import { ToastContainer } from "../components/ToastContainer";
import type { ToastProps } from "../components/Toast";
import { useTranslation } from "react-i18next";
import { ToastContext } from "./ToastContext";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const { t } = useTranslation();

  const handleCloseToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastProps, "id" | "onClose">) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      setToasts((prev) => [
        ...prev,
        { ...toast, id, onClose: handleCloseToast },
      ]);
    },
    [handleCloseToast]
  );

  // Funciones de conveniencia
  const showSuccessToast = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: "success",
        title,
        message,
        duration: 3000,
      });
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: "error",
        title,
        message,
        duration: 5000,
      });
    },
    [showToast]
  );

  const showInfoToast = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: "info",
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  const showWarningToast = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: "warning",
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  // Funciones automáticas para CRUD
  const showCreateSuccess = useCallback(
    (entity: string, name?: string) => {
      const entityKey = entity.toLowerCase();
      const title = t(`toast.${entityKey}.created`, `${entity} creado`);
      const message = name
        ? t(
            `toast.${entityKey}.createdWithName`,
            `${entity} "${name}" creado exitosamente`
          )
        : undefined;
      showSuccessToast(title, message);
    },
    [showSuccessToast, t]
  );

  const showUpdateSuccess = useCallback(
    (entity: string, name?: string) => {
      const entityKey = entity.toLowerCase();
      const title = t(`toast.${entityKey}.updated`, `${entity} actualizado`);
      const message = name
        ? t(
            `toast.${entityKey}.updatedWithName`,
            `${entity} "${name}" actualizado exitosamente`
          )
        : undefined;
      showSuccessToast(title, message);
    },
    [showSuccessToast, t]
  );

  const showDeleteSuccess = useCallback(
    (entity: string, name?: string) => {
      const entityKey = entity.toLowerCase();
      const title = t(`toast.${entityKey}.deleted`, `${entity} eliminado`);
      const message = name
        ? t(
            `toast.${entityKey}.deletedWithName`,
            `${entity} "${name}" eliminado exitosamente`
          )
        : undefined;
      showSuccessToast(title, message);
    },
    [showSuccessToast, t]
  );

  const showOperationError = useCallback(
    (operation: string, error?: string) => {
      const title = t(`toast.error.${operation}`, `Error al ${operation}`);
      const message =
        error || t("toast.error.generic", "Ha ocurrido un error inesperado");
      showErrorToast(title, message);
    },
    [showErrorToast, t]
  );

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccessToast,
        showErrorToast,
        showInfoToast,
        showWarningToast,
        showCreateSuccess,
        showUpdateSuccess,
        showDeleteSuccess,
        showOperationError,
      }}
    >
      <ToastContainer toasts={toasts} onClose={handleCloseToast} />
      {children}
    </ToastContext.Provider>
  );
};
